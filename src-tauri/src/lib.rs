mod engine;
mod maps;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![
            engine::check_engine,
            engine::get_engine_path,
            engine::launch_game,
            engine::launch_multiplayer,
            maps::get_map_rotation,
            maps::sync_maps,
            maps::get_map_path,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
