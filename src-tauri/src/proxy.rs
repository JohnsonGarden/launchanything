use std::{collections::BTreeMap, net::{TcpStream, ToSocketAddrs}, time::{Duration, Instant}};
use serde::Serialize;

use crate::model::{LaunchMode, ProxyProfile, ProxyScheme, validate_profile};

#[derive(Debug)]
pub struct LaunchPlan {
    pub environment: BTreeMap<String, String>,
    pub arguments: Vec<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProxyCheck {
    pub reachable: bool,
    pub latency_ms: Option<u128>,
    pub message: String,
}

fn host_for_url(host: &str) -> String {
    let host = host.trim();
    if host.contains(':') && !host.starts_with('[') {
        format!("[{host}]")
    } else {
        host.to_owned()
    }
}

pub fn build_launch_plan(profile: &ProxyProfile, mode: &LaunchMode) -> Result<LaunchPlan, String> {
    validate_profile(profile)?;
    let mut environment = BTreeMap::new();
    let mut arguments = Vec::new();
    let host = host_for_url(&profile.host);
    let address = format!("{host}:{}", profile.port);

    if matches!(mode, LaunchMode::Environment | LaunchMode::Combined) {
        // socks5h requests remote DNS resolution for clients that honor ALL_PROXY.
        let scheme = match profile.scheme { ProxyScheme::Http => "http", ProxyScheme::Socks5 => "socks5h" };
        let url = format!("{scheme}://{address}");
        for key in ["HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY", "http_proxy", "https_proxy", "all_proxy"] {
            environment.insert(key.to_string(), url.clone());
        }
        if !profile.bypass.is_empty() {
            let bypass = profile.bypass.join(",");
            environment.insert("NO_PROXY".into(), bypass.clone());
            environment.insert("no_proxy".into(), bypass);
        }
    }
    if matches!(mode, LaunchMode::Chromium | LaunchMode::Combined) {
        let scheme = match profile.scheme { ProxyScheme::Http => "http", ProxyScheme::Socks5 => "socks5" };
        arguments.push(format!("--proxy-server={scheme}://{address}"));
        if !profile.bypass.is_empty() {
            arguments.push(format!("--proxy-bypass-list={}", profile.bypass.join(";")));
        }
    }
    Ok(LaunchPlan { environment, arguments })
}

pub fn check_proxy(profile: &ProxyProfile) -> Result<ProxyCheck, String> {
    validate_profile(profile)?;
    let host = profile.host.trim().trim_start_matches('[').trim_end_matches(']');
    let addresses = (host, profile.port).to_socket_addrs()
        .map_err(|e| format!("Could not resolve proxy hostname: {e}"))?;
    let started = Instant::now();
    for address in addresses {
        if TcpStream::connect_timeout(&address, Duration::from_millis(800)).is_ok() {
            return Ok(ProxyCheck {
                reachable: true,
                latency_ms: Some(started.elapsed().as_millis()),
                message: "TCP port reachable. This does not verify proxy authentication, routing or exit IP.".into(),
            });
        }
    }
    Ok(ProxyCheck {
        reachable: false,
        latency_ms: None,
        message: "Could not reach this TCP port. Confirm your proxy client is running and listening.".into(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::model::AppState;

    fn profile() -> ProxyProfile { AppState::default().profiles.remove(0) }

    #[test]
    fn http_environment_exports_both_cases_and_bypass() {
        let plan = build_launch_plan(&profile(), &LaunchMode::Environment).unwrap();
        assert_eq!(plan.environment["HTTPS_PROXY"], "http://127.0.0.1:7890");
        assert_eq!(plan.environment["all_proxy"], "http://127.0.0.1:7890");
        assert!(plan.environment["NO_PROXY"].contains("localhost"));
        assert!(plan.arguments.is_empty());
    }

    #[test]
    fn socks5_uses_remote_dns_for_environment_and_chromium_flags() {
        let mut profile = profile();
        profile.scheme = ProxyScheme::Socks5;
        profile.host = "::1".into();
        let plan = build_launch_plan(&profile, &LaunchMode::Combined).unwrap();
        assert_eq!(plan.environment["ALL_PROXY"], "socks5h://[::1]:7890");
        assert_eq!(plan.arguments[0], "--proxy-server=socks5://[::1]:7890");
        assert!(plan.arguments[1].starts_with("--proxy-bypass-list="));
    }

    #[test]
    fn chromium_mode_does_not_export_environment() {
        let plan = build_launch_plan(&profile(), &LaunchMode::Chromium).unwrap();
        assert!(plan.environment.is_empty());
        assert_eq!(plan.arguments[0], "--proxy-server=http://127.0.0.1:7890");
    }
}
