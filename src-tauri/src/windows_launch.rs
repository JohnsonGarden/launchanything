#![cfg(target_os = "windows")]

use std::{
    ffi::OsString,
    mem::{size_of, zeroed},
    os::windows::{ffi::OsStringExt, process::CommandExt},
    path::Path,
    process::{Command, Stdio},
};
use windows_sys::Win32::{
    Foundation::{CloseHandle, INVALID_HANDLE_VALUE},
    System::{
        Diagnostics::ToolHelp::{
            CreateToolhelp32Snapshot, Process32FirstW, Process32NextW,
            PROCESSENTRY32W, TH32CS_SNAPPROCESS,
        },
        Threading::{
            OpenProcess, QueryFullProcessImageNameW, CREATE_NEW_PROCESS_GROUP,
            PROCESS_QUERY_LIMITED_INFORMATION,
        },
    },
};

use crate::{launch::LaunchResult, proxy::LaunchPlan};

const PROXY_VARIABLES: [&str; 8] = [
    "HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY", "NO_PROXY",
    "http_proxy", "https_proxy", "all_proxy", "no_proxy",
];

struct Snapshot(windows_sys::Win32::Foundation::HANDLE);
impl Drop for Snapshot {
    fn drop(&mut self) {
        unsafe { CloseHandle(self.0); }
    }
}

fn normalize_image_path(path: &Path) -> String {
    let canonical = std::fs::canonicalize(path).unwrap_or_else(|_| path.to_path_buf());
    canonical.to_string_lossy().trim_start_matches(r"\\?\")
        .replace('/', r"\").to_lowercase()
}

/// Guard against silently reusing a running GUI instance. If a process shares
/// the executable basename but its full path cannot be read, reject the launch.
fn already_running(target: &Path) -> Result<bool, String> {
    let expected_name = target.file_name().ok_or("Executable has no name.")?
        .to_string_lossy().into_owned();
    let expected_path = normalize_image_path(target);
    unsafe {
        let raw = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
        if raw == INVALID_HANDLE_VALUE {
            return Err("Cannot inspect running Windows processes. Launch cancelled.".into());
        }
        let snapshot = Snapshot(raw);
        let mut entry: PROCESSENTRY32W = zeroed();
        entry.dwSize = size_of::<PROCESSENTRY32W>() as u32;
        if Process32FirstW(snapshot.0, &mut entry) == 0 {
            return Err("Cannot enumerate Windows processes. Launch cancelled.".into());
        }
        loop {
            let end = entry.szExeFile.iter().position(|&c| c == 0)
                .unwrap_or(entry.szExeFile.len());
            let filename = OsString::from_wide(&entry.szExeFile[..end])
                .to_string_lossy().into_owned();
            if filename.eq_ignore_ascii_case(&expected_name) {
                let handle = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, 0, entry.th32ProcessID);
                if handle.is_null() {
                    return Err(format!("Cannot inspect an existing {expected_name} process. Quit it before launching."));
                }
                let mut buf = vec![0u16; 32768];
                let mut len = buf.len() as u32;
                let ok = QueryFullProcessImageNameW(handle, 0, buf.as_mut_ptr(), &mut len);
                CloseHandle(handle);
                if ok == 0 {
                    return Err(format!("Cannot read an existing {expected_name} process path. Launch cancelled."));
                }
                let image = OsString::from_wide(&buf[..len as usize]);
                if normalize_image_path(Path::new(&image)) == expected_path {
                    return Ok(true);
                }
            }
            if Process32NextW(snapshot.0, &mut entry) == 0 {
                break;
            }
        }
        Ok(false)
    }
}

pub fn launch_windows(path: &Path, plan: LaunchPlan) -> Result<LaunchResult, String> {
    if already_running(path)? {
        return Err("This application is already running. Exit it completely before launching with proxy settings.".into());
    }

    // Command uses CreateProcessW and Windows argument quoting, never cmd.exe.
    let mut command = Command::new(path);
    command.args(&plan.arguments);
    if let Some(parent) = path.parent() {
        command.current_dir(parent);
    }
    for key in PROXY_VARIABLES {
        command.env_remove(key);
    }
    for (key, value) in plan.environment {
        command.env(key, value);
    }
    command.stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .creation_flags(CREATE_NEW_PROCESS_GROUP);
    let child = command.spawn().map_err(|e| format!("Windows could not start the executable: {e}"))?;
    let pid = i32::try_from(child.id())
        .map_err(|_| "Launched process returned a PID outside the supported range.".to_string())?;
    Ok(LaunchResult {
        pid,
        message: "Windows confirmed new process creation. Proxy settings are best effort; verify network behavior in the target application.".into(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn detects_own_running_executable() {
        let own_exe = std::env::current_exe().expect("test executable");
        assert!(already_running(&own_exe).expect("process enumeration must work"));
    }
    #[test]
    fn proxy_variable_clear_list_contains_both_cases_and_bypass() {
        assert_eq!(PROXY_VARIABLES.len(), 8);
        assert!(PROXY_VARIABLES.contains(&"HTTPS_PROXY"));
        assert!(PROXY_VARIABLES.contains(&"no_proxy"));
    }
}
