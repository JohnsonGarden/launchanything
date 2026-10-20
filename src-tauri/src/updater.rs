//! User-initiated, signature-verified GitHub Release updates.
//! No private signing key is ever stored in the application.
use serde::Serialize;
use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_updater::UpdaterExt;

const PINNED_PUBLIC_KEY: &str = match option_env!("LAUNCHANYTHING_UPDATE_PUBKEY") {
    Some(value) => value,
    None => "",
};

#[derive(Clone, Serialize)]
struct DownloadProgress {
    downloaded: u64,
    total: Option<u64>,
}

#[tauri::command]
pub fn signed_updates_enabled() -> bool {
    !PINNED_PUBLIC_KEY.trim().is_empty()
}

#[tauri::command]
pub async fn install_signed_update(app: AppHandle, tag: String) -> Result<(), String> {
    if !signed_updates_enabled() {
        return Err("This build has no trusted update-signing public key. Install the next signed-update-enabled release manually first.".into());
    }

    // Never accept arbitrary URLs supplied by the webview. Only our release
    // tags may be used, and the updater verifies the archive's signature.
    let version_text = tag.strip_prefix('v').ok_or("Invalid release tag.")?;
    let requested = semver::Version::parse(version_text)
        .map_err(|_| "Invalid release version.")?;
    if tag != format!("v{requested}") {
        return Err("Invalid release tag format.".into());
    }
    if requested <= app.package_info().version {
        return Err("The selected version is not newer than this installation.".into());
    }

    let endpoint = format!(
        "https://github.com/JohnsonGarden/launchanything/releases/download/{tag}/updater.json"
    );
    let updater = app
        .updater_builder()
        .pubkey(PINNED_PUBLIC_KEY)
        .endpoints(vec![endpoint])
        .map_err(|error| error.to_string())?
        .build()
        .map_err(|error| error.to_string())?;
    let update = updater
        .check()
        .await
        .map_err(|error| error.to_string())?
        .ok_or("No newer signed update was offered by this release.")?;

    if update.version != requested.to_string() {
        return Err("The update manifest version does not match the selected release.".into());
    }

    let emitter = app.clone();
    let mut downloaded = 0u64;
    update
        .download_and_install(
            move |bytes, total| {
                downloaded = downloaded.saturating_add(bytes as u64);
                let _ = emitter.emit(
                    "launchanything-update-progress",
                    DownloadProgress { downloaded, total },
                );
            },
            || {},
        )
        .await
        .map_err(|error| error.to_string())?;

    // macOS updater installs the signed app bundle in place. Relaunch only
    // after signature verification and installation have both succeeded.
    app.restart();
}
