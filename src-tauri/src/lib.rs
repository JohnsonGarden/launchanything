mod commands;
mod launch;
mod model;
mod proxy;
mod store;
#[cfg(target_os = "windows")]
mod windows_launch;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let dir = app.path().app_config_dir()?;
            let store = store::AppStore::new(dir).map_err(std::io::Error::other)?;
            app.manage(store);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::load_state,
            commands::save_profile,
            commands::delete_profile,
            commands::save_app,
            commands::delete_app,
            commands::test_proxy,
            commands::launch_app,
        ])
        .run(tauri::generate_context!())
        .expect("error while running LaunchAnything");
}
