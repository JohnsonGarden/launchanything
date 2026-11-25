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
