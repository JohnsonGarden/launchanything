use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum ProxyScheme {
    Http,
    Socks5,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum LaunchMode {
    Environment,
    Chromium,
    Combined,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProxyProfile {
    pub id: String,
    pub name: String,
    pub scheme: ProxyScheme,
    pub host: String,
    pub port: u16,
    #[serde(default)]
    pub bypass: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppEntry {
    pub id: String,
    pub name: String,
    pub app_path: String,
    pub profile_id: String,
    pub mode: LaunchMode,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppState {
    pub schema_version: u32,
    pub profiles: Vec<ProxyProfile>,
    pub apps: Vec<AppEntry>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            schema_version: 1,
            profiles: vec![ProxyProfile {
                id: "local-default".into(),
                name: "Local proxy".into(),
                scheme: ProxyScheme::Http,
                host: "127.0.0.1".into(),
                port: 7890,
                bypass: vec!["localhost".into(), "127.0.0.1".into(), "::1".into()],
            }],
            apps: Vec::new(),
        }
    }
}

fn validate_label(value: &str, label: &str, max: usize) -> Result<(), String> {
    let trimmed = value.trim();
    if trimmed.is_empty() || trimmed.len() > max || trimmed.chars().any(char::is_control) {
        return Err(format!("{label} must be 1–{max} characters."));
    }
    Ok(())
}

pub fn validate_profile(profile: &ProxyProfile) -> Result<(), String> {
    validate_label(&profile.id, "Profile ID", 100)?;
    validate_label(&profile.name, "Profile name", 70)?;
    let host = profile.host.trim();
    if host.is_empty()
        || host.len() > 253
        || host.contains(|c: char| c.is_whitespace() || c.is_control())
        || host.chars().any(|c| "/@?#\\".contains(c))
        || host.contains("://")
    {
        return Err("Enter a hostname or IP address, without a protocol or port.".into());
    }
    if profile.port == 0 {
        return Err("Port must be between 1 and 65535.".into());
    }
    if profile.bypass.len() > 64
        || profile.bypass.iter().any(|s| {
            s.len() > 253
                || s.trim().is_empty()
                || s.contains(|c: char| c.is_whitespace() || c.is_control())
                || s.chars().any(|c| ",;\n\r".contains(c))
        })
    {
        return Err("Bypass entries must be simple host patterns (max 64).".into());
    }
    Ok(())
}

pub fn validate_app(entry: &AppEntry) -> Result<(), String> {
    validate_label(&entry.id, "Application ID", 100)?;
    validate_label(&entry.name, "Application name", 70)?;
    validate_label(&entry.profile_id, "Proxy profile ID", 100)?;
    if !entry.app_path.ends_with(".app") || !entry.app_path.starts_with('/') || entry.app_path.contains('\0') {
        return Err("Select an absolute path to a macOS .app bundle.".into());
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn default_state_has_a_usable_local_profile() {
        let state = AppState::default();
        assert_eq!(state.schema_version, 1);
        assert!(validate_profile(&state.profiles[0]).is_ok());
    }

    #[test]
    fn reject_injected_host_strings() {
        let mut profile = AppState::default().profiles.remove(0);
        for host in ["", "http://127.0.0.1", "localhost:80/path", "evil host", "a\nB"] {
            profile.host = host.into();
            assert!(validate_profile(&profile).is_err(), "host: {host:?}");
        }
    }

    #[test]
    fn reject_invalid_bundle_path() {
        let mut app = AppEntry {
            id: "1".into(),
            name: "Test".into(),
            app_path: "/Applications/Test.app".into(),
            profile_id: "p".into(),
            mode: LaunchMode::Environment,
        };
        assert!(validate_app(&app).is_ok());
        app.app_path = "/bin/sh".into();
        assert!(validate_app(&app).is_err());
    }
}
