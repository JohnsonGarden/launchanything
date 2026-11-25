use serde::Serialize;
use crate::model::{ProxyProfile, ProxyScheme, validate_profile};
use std::process::Command;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EgressProbe {
    pub ip: String,
    pub country: String,
}

// Explicit user-triggered probe; fixed HTTPS endpoint, no redirects, no shell.
// curl validates TLS and performs HTTP CONNECT or SOCKS5 remote-DNS negotiation.
pub fn probe(profile: &ProxyProfile) -> Result<EgressProbe, String> {
    validate_profile(profile)?;
    let host = profile.host.trim();
    let host = if host.contains(':') && !host.starts_with('[') {
        format!("[{host}]")
    } else { host.to_owned() };
    let scheme = match profile.scheme { ProxyScheme::Http => "http", ProxyScheme::Socks5 => "socks5h" };
    let proxy = format!("{scheme}://{host}:{}", profile.port);
    let output = Command::new("/usr/bin/curl")
        .args(["-q", "--silent", "--show-error", "--fail", "--connect-timeout", "5",
            "--max-time", "12", "--max-filesize", "16384", "--proxy", &proxy,
            "--noproxy", "", "--proto", "=https", "https://www.cloudflare.com/cdn-cgi/trace"])
        .output().map_err(|_| "Unable to run system curl.".to_string())?;
    if !output.status.success() {
        return Err(format!("Proxy TLS probe failed (curl exit {}). No direct fallback.", output.status.code().unwrap_or(-1)));
    }
    parse_trace(&String::from_utf8_lossy(&output.stdout))
}

fn parse_trace(trace: &str) -> Result<EgressProbe, String> {
    let ip = trace.lines().find_map(|l| l.strip_prefix("ip=")).ok_or("Missing egress IP")?;
    let country = trace.lines().find_map(|l| l.strip_prefix("loc=")).ok_or("Missing country")?;
    if ip.parse::<std::net::IpAddr>().is_err() || country.len() != 2 ||
        !country.bytes().all(|b| b.is_ascii_uppercase()) {
        return Err("Invalid probe response.".into());
    }
    Ok(EgressProbe { ip: ip.into(), country: country.into() })
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn parses_only_expected_fields() {
        let result = parse_trace("ip=2001:db8::1\nloc=KR\nother=ignored\n").unwrap();
        assert_eq!(result.country, "KR");
        assert_eq!(result.ip, "2001:db8::1");
    }
    #[test]
    fn rejects_invalid_or_incomplete_response() {
        for sample in ["ip=not-ip\nloc=KR", "ip=127.0.0.1", "ip=192.0.2.1\nloc=KOREA"] {
            assert!(parse_trace(sample).is_err());
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProcessObservation {
    pub proxy_environment_matches: bool,
    pub observed_connections: Vec<String>,
    pub suspected_bypass: bool,
}

#[cfg(target_os = "macos")]
pub fn observe(pid: i32, entry: &crate::model::AppEntry, profile: &ProxyProfile) -> Result<ProcessObservation, String> {
    if pid <= 0 { return Err("Invalid PID.".into()); }
    // Check executable path before inspecting; do not expose the environment.
    let process = Command::new("/bin/ps").args(["-p", &pid.to_string(), "-o", "comm="])
        .output().map_err(|_| "Process inspection unavailable.")?;
    let executable = String::from_utf8_lossy(&process.stdout);
    let path = std::fs::canonicalize(&entry.app_path).map_err(|_| "Application missing.")?;
    let prefix = format!("{}/Contents/", path.display());
    if !process.status.success() || !executable.trim().starts_with(&prefix) {
        return Err("Process is no longer the selected app; relaunch to inspect.".into());
    }
    let env = Command::new("/bin/ps").args(["eww", "-p", &pid.to_string(), "-o", "command="])
        .output().map_err(|_| "Environment inspection unavailable.")?;
    if !env.status.success() { return Err("Environment inspection failed.".into()); }
    let text = String::from_utf8_lossy(&env.stdout);
    let plan = crate::proxy::build_launch_plan(profile, &entry.mode)?;
    let matches = !plan.environment.is_empty() && plan.environment.iter()
        .all(|(key, value)| text.split_whitespace().any(|part| part == format!("{key}={value}")));
    let sockets = Command::new("/usr/sbin/lsof").args(["-nP", "-a", "-p", &pid.to_string(), "-iTCP", "-sTCP:ESTABLISHED", "-Fn"])
        .output().map_err(|_| "Socket inspection unavailable.")?;
    // lsof exits 1 on no matches; never treat no samples as a clean bill of health.
    if !sockets.status.success() && (!sockets.stderr.is_empty() || sockets.status.code() != Some(1)) {
        return Err("Socket inspection failed.".into());
    }
    let connections: Vec<String> = String::from_utf8_lossy(&sockets.stdout).lines()
        .filter_map(|line| line.strip_prefix('n'))
        .filter_map(|line| line.split_once("->").map(|(_, remote)| remote.to_owned()))
        .collect();
    let bypass = connections.iter().any(|remote| suspected_remote(remote, profile));
    Ok(ProcessObservation { proxy_environment_matches: matches, observed_connections: connections, suspected_bypass: bypass })
}

fn suspected_remote(remote: &str, profile: &ProxyProfile) -> bool {
    let Ok(addr) = remote.parse::<std::net::SocketAddr>() else { return false };
    if addr.ip().is_loopback() { return false; }
    if let Ok(proxy_ip) = profile.host.trim_matches(['[', ']']).parse::<std::net::IpAddr>() {
        if addr.ip() == proxy_ip && addr.port() == profile.port { return false; }
    }
    // Conservative: flag non-loopback TCP endpoints, not proven public IP leaks.
    true
}

#[cfg(not(target_os = "macos"))]
pub fn observe(_: i32, _: &crate::model::AppEntry, _: &ProxyProfile) -> Result<ProcessObservation, String> {
    Err("Process observation requires macOS.".into())
}

#[cfg(test)]
mod observation_tests {
    use super::*;
    #[test]
    fn distinguishes_loopback_from_possible_bypass() {
        let profile = crate::model::AppState::default().profiles.remove(0);
        assert!(!suspected_remote("127.0.0.1:7890", &profile));
        assert!(!suspected_remote("[::1]:7890", &profile));
        assert!(suspected_remote("192.0.2.1:443", &profile));
        assert!(!suspected_remote("unknown", &profile));
    }
}
