//! User-initiated, signature-verified GitHub Release updates.
//! The update endpoint is fixed to this repository; signing secrets are never embedded.
use serde::Serialize;
use std::time::Duration;
use tauri::{AppHandle, Emitter, State};
use tauri_plugin_updater::UpdaterExt;

use crate::{model::ProxyScheme, store::AppStore};

const PINNED_PUBLIC_KEY: &str = match option_env!("LAUNCHANYTHING_UPDATE_PUBKEY") {
    Some(value) => value,
    None => "",
};

#[derive(Clone, Serialize)]
struct DownloadProgress {
    downloaded: u64,
    total: Option<u64>,
}

/// A user-selected saved profile only; never take arbitrary proxy URLs from the webview.
fn proxy_url(proxy_profile_id: Option<&str>, store: &AppStore) -> Result<Option<reqwest::Url>, String> {
    let Some(id) = proxy_profile_id.filter(|id| !id.is_empty()) else {
        return Ok(None);
    };
    let state = store.snapshot()?;
    let profile = state.profiles.iter().find(|profile| profile.id == id)
        .ok_or("Select a valid saved proxy for update traffic.")?;
    let scheme = match profile.scheme {
        ProxyScheme::Http => "http",
        ProxyScheme::Socks5 => "socks5h",
    };
    let host = if profile.host.contains(':') && !profile.host.starts_with('[') {
        format!("[{}]", profile.host)
    } else {
        profile.host.clone()
    };
    let value = format!("{scheme}://{host}:{}", profile.port);
    reqwest::Url::parse(&value).map(Some).map_err(|error| error.to_string())
}

/// GitHub API calls are made by Rust, not the WebView, so they can use a
/// per-request local SOCKS5/HTTP proxy without changing macOS system settings.
#[tauri::command]
pub async fn fetch_github_releases(
    proxy_profile_id: Option<String>,
    store: State<'_, AppStore>,
) -> Result<serde_json::Value, String> {
    let mut client = reqwest::Client::builder()
        .user_agent("LaunchAnything-updater")
        .timeout(Duration::from_secs(20));
    if let Some(url) = proxy_url(proxy_profile_id.as_deref(), &store)? {
        let proxy = reqwest::Proxy::all(url).map_err(|error| error.to_string())?;
        client = client.proxy(proxy);
    }
    let response = client.build().map_err(|error| error.to_string())?
        .get("https://api.github.com/repos/JohnsonGarden/launchanything/releases?per_page=50")
        .send().await.map_err(|error| error.to_string())?
        .error_for_status().map_err(|error| error.to_string())?;
    response.json::<serde_json::Value>().await.map_err(|error| error.to_string())
}

#[tauri::command]
pub fn signed_updates_enabled() -> bool {
    !PINNED_PUBLIC_KEY.trim().is_empty()
}

#[tauri::command]
pub async fn install_signed_update(
    app: AppHandle,
    tag: String,
    proxy_profile_id: Option<String>,
    store: State<'_, AppStore>,
) -> Result<(), String> {
    if !signed_updates_enabled() {
        return Err("This build has no trusted update-signing key. Install a signed-update-enabled release manually first.".into());
    }
    // Never accept arbitrary URLs supplied by the WebView. Only canonical
    // SemVer release tags are allowed; Tauri verifies the downloaded archive.
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
    let mut builder = app.updater_builder()
        .pubkey(PINNED_PUBLIC_KEY)
        .endpoints(vec![reqwest::Url::parse(&endpoint).map_err(|error| error.to_string())?])
        .map_err(|error| error.to_string())?
        .timeout(Duration::from_secs(180));
    if let Some(url) = proxy_url(proxy_profile_id.as_deref(), &store)? {
        builder = builder.proxy(url);
    }
    let updater = builder.build().map_err(|error| error.to_string())?;
    let update = updater.check().await.map_err(|error| error.to_string())?
        .ok_or("No newer signed update was offered by this release.")?;

    if update.version != requested.to_string() {
        return Err("The signed update manifest version differs from the selected release.".into());
    }

    let emitter = app.clone();
    let mut downloaded = 0u64;
    update.download_and_install(
        move |bytes, total| {
            downloaded = downloaded.saturating_add(bytes as u64);
            let _ = emitter.emit("launchanything-update-progress", DownloadProgress {
                downloaded, total,
            });
        },
        || {},
    ).await.map_err(|error| error.to_string())?;

    // Native macOS replacement happens only after updater signature verification.
    app.restart();
}
