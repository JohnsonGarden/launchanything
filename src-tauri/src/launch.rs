use std::path::Path;
#[cfg(target_os = "macos")]
use std::{io::Write, path::PathBuf, process::{Command, Stdio}};
use serde::Serialize;
#[cfg(target_os = "macos")]
use serde::Deserialize;
use tauri::AppHandle;
#[cfg(target_os = "macos")]
use tauri::Manager;

use crate::{model::{AppEntry, ProxyProfile, validate_app}, proxy::build_launch_plan};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LaunchResult {
    pub pid: i32,
    pub message: String,
}

#[cfg(target_os = "macos")]
#[derive(Deserialize)]
struct HelperReply {
    pid: Option<i32>,
    error: Option<String>,
}

#[cfg(target_os = "macos")]
#[derive(Serialize)]
struct HelperRequest<'a> {
    path: &'a str,
    environment: std::collections::BTreeMap<String, String>,
    arguments: Vec<String>,
}

#[cfg(target_os = "macos")]
fn resolve_helper(app: &AppHandle) -> Result<PathBuf, String> {
    let packaged = app.path().resource_dir().map_err(|e| e.to_string())?
        .join("bin/launchanything-macos-helper");
    if packaged.is_file() { return Ok(packaged); }
    let development = Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("bin/launchanything-macos-helper");
    if development.is_file() { return Ok(development); }
    Err("Native launcher missing. Rebuild the app using npm run build.".into())
}

pub fn launch(app: &AppHandle, entry: &AppEntry, profile: &ProxyProfile) -> Result<LaunchResult, String> {
    validate_app(entry)?;
    let path = std::fs::canonicalize(&entry.app_path)
        .map_err(|_| "The selected application no longer exists.".to_string())?;
    #[cfg(target_os = "macos")]
    if path.extension().and_then(|s| s.to_str()) != Some("app") || !path.is_dir() {
        return Err("The selected file is not a macOS application bundle.".into());
    }
    #[cfg(target_os = "windows")]
    if !path.is_file() || !path.extension().is_some_and(|ext| ext.eq_ignore_ascii_case("exe")) {
        return Err("The selected file is not a Windows .exe application.".into());
    }
    let plan = build_launch_plan(profile, &entry.mode)?;
    #[cfg(target_os = "windows")]
    {
        let _ = app;
        return crate::windows_launch::launch_windows(&path, plan);
    }
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        let _ = (app, path, plan);
        return Err("App launching is not supported on this platform.".into());
    }
    #[cfg(target_os = "macos")]
    {
        let helper = resolve_helper(app)?;
        let request = HelperRequest {
            path: path.to_str().ok_or("Unsupported application path encoding.")?,
            environment: plan.environment,
            arguments: plan.arguments,
        };
        let mut child = Command::new(helper)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::null())
            .spawn().map_err(|e| format!("Could not start native launcher: {e}"))?;
        if let Some(mut stdin) = child.stdin.take() {
            let bytes = serde_json::to_vec(&request).map_err(|e| e.to_string())?;
            stdin.write_all(&bytes).map_err(|e| format!("Failed to send launch request: {e}"))?;
        }
        let output = child.wait_with_output().map_err(|e| e.to_string())?;
        let reply: HelperReply = serde_json::from_slice(&output.stdout)
            .map_err(|_| "Native launcher returned an invalid response.".to_string())?;
        if !output.status.success() {
            return Err(reply.error.unwrap_or_else(|| "macOS refused to open this app.".into()));
        }
        let pid = reply.pid.ok_or("macOS did not confirm the new process.")?;
        Ok(LaunchResult {
            pid,
            message: "Launched with requested settings. App-level routing is not guaranteed; verify with the app's own network diagnostics.".into(),
        })
    }
}
