mod commands;
mod launch;
mod model;
mod proxy;
mod store;
mod updater;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
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
            updater::signed_updates_enabled,
            updater::install_signed_update,
        ])
        .run(tauri::generate_context!())
        .expect("error while running LaunchAnything");
}
