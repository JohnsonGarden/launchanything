use tauri::{AppHandle, State};
use crate::{
    launch::{launch, LaunchResult},
    model::{AppEntry, AppState, ProxyProfile, validate_app, validate_profile},
    proxy::{check_proxy, ProxyCheck},
    store::AppStore,
};

#[tauri::command]
pub fn load_state(store: State<'_, AppStore>) -> Result<AppState, String> {
    store.snapshot()
}

#[tauri::command]
pub fn save_profile(profile: ProxyProfile, store: State<'_, AppStore>) -> Result<AppState, String> {
    validate_profile(&profile)?;
    store.update(|state| {
        if let Some(existing) = state.profiles.iter_mut().find(|p| p.id == profile.id) {
            *existing = profile;
        } else {
            state.profiles.push(profile);
        }
        Ok(())
    })
}

#[tauri::command]
pub fn delete_profile(id: String, store: State<'_, AppStore>) -> Result<AppState, String> {
    store.update(|state| {
        if state.apps.iter().any(|app| app.profile_id == id) {
            return Err("This proxy is assigned to applications. Reassign or remove them first.".into());
        }
        if state.profiles.len() <= 1 {
            return Err("Keep at least one proxy profile.".into());
        }
        state.profiles.retain(|profile| profile.id != id);
        Ok(())
    })
}

#[tauri::command]
pub fn save_app(entry: AppEntry, store: State<'_, AppStore>) -> Result<AppState, String> {
    validate_app(&entry)?;
    #[cfg(target_os = "macos")]
    if !std::path::Path::new(&entry.app_path).is_dir() {
        return Err("The selected .app bundle could not be found.".into());
    }
    #[cfg(target_os = "windows")]
    if !std::path::Path::new(&entry.app_path).is_file() {
        return Err("The selected .exe application could not be found.".into());
    }
    store.update(|state| {
        if !state.profiles.iter().any(|profile| profile.id == entry.profile_id) {
            return Err("Select a valid proxy profile.".into());
        }
        if let Some(existing) = state.apps.iter_mut().find(|app| app.id == entry.id) {
            *existing = entry;
        } else {
            state.apps.push(entry);
        }
        Ok(())
    })
}

#[tauri::command]
pub fn delete_app(id: String, store: State<'_, AppStore>) -> Result<AppState, String> {
    store.update(|state| {
        state.apps.retain(|entry| entry.id != id);
        Ok(())
    })
}

#[tauri::command]
pub fn test_proxy(profile: ProxyProfile) -> Result<ProxyCheck, String> {
    check_proxy(&profile)
}

#[tauri::command]
pub fn launch_app(id: String, app: AppHandle, store: State<'_, AppStore>) -> Result<LaunchResult, String> {
    let snapshot = store.snapshot()?;
    let entry = snapshot.apps.iter().find(|item| item.id == id)
        .ok_or("Application not found.")?;
    let profile = snapshot.profiles.iter().find(|item| item.id == entry.profile_id)
        .ok_or("Associated proxy profile not found.")?;
    // Fail closed if the configured proxy port is unreachable.
    let check = check_proxy(profile)?;
    if !check.reachable {
        return Err("Proxy port is unreachable. Launch cancelled to avoid a direct connection.".into());
    }
    launch(&app, entry, profile)
}
