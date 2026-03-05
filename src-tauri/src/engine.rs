use serde::Deserialize;
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::process::Command as StdCommand;
use tauri::{AppHandle, Manager};

const API_BASE: &str = "https://api.ctx.gg";

#[derive(Debug, Deserialize)]
struct LatestManifest {
    version: String,
    platforms: HashMap<String, PlatformAsset>,
}

#[derive(Debug, Deserialize)]
struct PlatformAsset {
    url: String,
}

fn engine_dir(app: &AppHandle) -> PathBuf {
    app.path().app_data_dir().unwrap().join("engine")
}

fn version_file(app: &AppHandle) -> PathBuf {
    engine_dir(app).join("version.txt")
}

fn installed_version(app: &AppHandle) -> Option<String> {
    fs::read_to_string(version_file(app)).ok().map(|s| s.trim().to_string())
}

fn platform_key() -> &'static str {
    #[cfg(all(target_os = "linux", target_arch = "x86_64"))]
    { "linux-x86_64" }
    #[cfg(all(target_os = "windows", target_arch = "x86_64"))]
    { "windows-x86_64" }
    #[cfg(all(target_os = "macos", target_arch = "x86_64"))]
    { "darwin-x86_64" }
    #[cfg(all(target_os = "macos", target_arch = "aarch64"))]
    { "darwin-aarch64" }
}

/// Returns the path to the engine binary, or None if not installed.
#[tauri::command]
pub fn get_engine_path(app: AppHandle) -> Option<String> {
    let dir = engine_dir(&app);
    #[cfg(target_os = "windows")]
    let bin = dir.join("mortar.exe");
    #[cfg(not(target_os = "windows"))]
    let bin = dir.join("mortar");

    if bin.exists() {
        Some(bin.to_string_lossy().into_owned())
    } else {
        None
    }
}

/// Check for the latest engine version, download and install if needed.
/// Returns the path to the engine binary.
#[tauri::command]
pub async fn check_engine(app: AppHandle) -> Result<String, String> {
    // Fetch the latest release from the API
    let url = format!("{API_BASE}/api/games/mortar/releases/latest");
    let manifest: LatestManifest = reqwest::get(&url)
        .await
        .map_err(|e| format!("Failed to check for engine updates: {e}"))?
        .json()
        .await
        .map_err(|e| format!("Invalid engine manifest: {e}"))?;

    let current = installed_version(&app);
    let needs_update = current.as_deref() != Some(&manifest.version);

    if !needs_update {
        // Already up to date, return binary path
        return get_engine_path(app).ok_or_else(|| "Engine binary missing".to_string());
    }

    // Find the asset for our platform
    let platform = platform_key();
    let asset = manifest
        .platforms
        .get(platform)
        .ok_or_else(|| format!("No engine build available for {platform}"))?;

    // Download the archive
    let response = reqwest::get(&asset.url)
        .await
        .map_err(|e| format!("Failed to download engine: {e}"))?;

    let bytes = response
        .bytes()
        .await
        .map_err(|e| format!("Failed to read engine download: {e}"))?;

    // Prepare the engine directory
    let dir = engine_dir(&app);
    if dir.exists() {
        fs::remove_dir_all(&dir).map_err(|e| format!("Failed to clean engine dir: {e}"))?;
    }
    fs::create_dir_all(&dir).map_err(|e| format!("Failed to create engine dir: {e}"))?;

    // Extract based on platform
    #[cfg(target_os = "windows")]
    {
        extract_zip(&bytes, &dir)?;
    }
    #[cfg(not(target_os = "windows"))]
    {
        extract_tar_gz(&bytes, &dir)?;
    }

    // Write version file
    fs::write(version_file(&app), &manifest.version)
        .map_err(|e| format!("Failed to write version: {e}"))?;

    // Set executable permission on Unix
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let bin = dir.join("mortar");
        if bin.exists() {
            fs::set_permissions(&bin, fs::Permissions::from_mode(0o755))
                .map_err(|e| format!("Failed to set permissions: {e}"))?;
        }
    }

    get_engine_path(app).ok_or_else(|| "Engine binary not found after extraction".to_string())
}

/// Launch the mortar engine with the given map.
#[tauri::command]
pub async fn launch_game(app: AppHandle, map_path: String) -> Result<(), String> {
    let engine_path = get_engine_path(app).ok_or("Engine is not installed")?;

    StdCommand::new(&engine_path)
        .arg("--map")
        .arg(&map_path)
        .spawn()
        .map_err(|e| format!("Failed to launch game: {e}"))?;

    Ok(())
}

#[cfg(not(target_os = "windows"))]
fn extract_tar_gz(data: &[u8], dest: &PathBuf) -> Result<(), String> {
    use flate2::read::GzDecoder;
    use tar::Archive;

    let decoder = GzDecoder::new(data);
    let mut archive = Archive::new(decoder);

    for entry in archive.entries().map_err(|e| format!("tar error: {e}"))? {
        let mut entry = entry.map_err(|e| format!("tar entry error: {e}"))?;
        let path = entry.path().map_err(|e| format!("tar path error: {e}"))?.into_owned();

        // Strip the top-level directory (e.g. mortar-linux-x86_64/)
        let stripped: PathBuf = path.components().skip(1).collect();
        if stripped.as_os_str().is_empty() {
            continue;
        }

        let out_path = dest.join(&stripped);
        if entry.header().entry_type().is_dir() {
            fs::create_dir_all(&out_path).map_err(|e| format!("mkdir error: {e}"))?;
        } else {
            if let Some(parent) = out_path.parent() {
                fs::create_dir_all(parent).map_err(|e| format!("mkdir error: {e}"))?;
            }
            entry.unpack(&out_path).map_err(|e| format!("unpack error: {e}"))?;
        }
    }

    Ok(())
}

#[cfg(target_os = "windows")]
fn extract_zip(data: &[u8], dest: &PathBuf) -> Result<(), String> {
    use std::io::{Cursor, Read};

    let reader = Cursor::new(data);
    let mut archive = zip::ZipArchive::new(reader).map_err(|e| format!("zip error: {e}"))?;

    for i in 0..archive.len() {
        let mut file = archive.by_index(i).map_err(|e| format!("zip entry error: {e}"))?;
        let path = file.mangled_name();

        // Strip the top-level directory
        let stripped: PathBuf = path.components().skip(1).collect();
        if stripped.as_os_str().is_empty() {
            continue;
        }

        let out_path = dest.join(&stripped);
        if file.is_dir() {
            fs::create_dir_all(&out_path).map_err(|e| format!("mkdir error: {e}"))?;
        } else {
            if let Some(parent) = out_path.parent() {
                fs::create_dir_all(parent).map_err(|e| format!("mkdir error: {e}"))?;
            }
            let mut buf = Vec::new();
            file.read_to_end(&mut buf).map_err(|e| format!("read error: {e}"))?;
            fs::write(&out_path, &buf).map_err(|e| format!("write error: {e}"))?;
        }
    }

    Ok(())
}
