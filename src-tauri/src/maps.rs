use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

const API_BASE: &str = "https://api.ctx.gg";

fn maps_dir(app: &AppHandle) -> PathBuf {
    app.path().app_data_dir().unwrap().join("maps")
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct RotationMap {
    pub id: String,
    pub slug: String,
    pub title: String,
    pub description: Option<String>,
    pub size: i64,
    pub updated_at: String,
}

#[derive(Debug, Serialize)]
pub struct MapSyncStatus {
    pub total: usize,
    pub downloaded: usize,
    pub maps: Vec<RotationMap>,
}

/// Fetch the current map rotation from the API
#[tauri::command]
pub async fn get_map_rotation() -> Result<Vec<RotationMap>, String> {
    let url = format!("{API_BASE}/api/maps/rotation");
    let maps: Vec<RotationMap> = reqwest::get(&url)
        .await
        .map_err(|e| format!("Failed to fetch map rotation: {e}"))?
        .json()
        .await
        .map_err(|e| format!("Invalid map rotation response: {e}"))?;
    Ok(maps)
}

/// Sync all maps in the current rotation to local storage.
/// Downloads any missing or outdated maps.
#[tauri::command]
pub async fn sync_maps(app: AppHandle) -> Result<MapSyncStatus, String> {
    let rotation = get_map_rotation().await?;
    let dir = maps_dir(&app);
    fs::create_dir_all(&dir).map_err(|e| format!("Failed to create maps dir: {e}"))?;

    let mut downloaded = 0;

    for map in &rotation {
        let map_path = dir.join(format!("{}.json", map.slug));
        let meta_path = dir.join(format!("{}.meta", map.slug));

        // Check if we already have this version
        let needs_download = if map_path.exists() && meta_path.exists() {
            let stored_date = fs::read_to_string(&meta_path).unwrap_or_default();
            stored_date.trim() != map.updated_at
        } else {
            true
        };

        if needs_download {
            let url = format!("{API_BASE}/api/maps/{}/download", map.slug);
            let data = reqwest::get(&url)
                .await
                .map_err(|e| format!("Failed to download map {}: {e}", map.slug))?
                .text()
                .await
                .map_err(|e| format!("Failed to read map {}: {e}", map.slug))?;

            fs::write(&map_path, &data)
                .map_err(|e| format!("Failed to save map {}: {e}", map.slug))?;
            fs::write(&meta_path, &map.updated_at)
                .map_err(|e| format!("Failed to save map meta {}: {e}", map.slug))?;

            downloaded += 1;
        }
    }

    Ok(MapSyncStatus {
        total: rotation.len(),
        downloaded,
        maps: rotation,
    })
}

/// Get the local path to a map file by slug.
#[tauri::command]
pub fn get_map_path(app: AppHandle, slug: String) -> Option<String> {
    let path = maps_dir(&app).join(format!("{slug}.json"));
    if path.exists() {
        Some(path.to_string_lossy().into_owned())
    } else {
        None
    }
}
