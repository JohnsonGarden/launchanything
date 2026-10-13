use std::{fs, path::PathBuf, sync::Mutex};

use crate::model::AppState;

pub struct AppStore {
    path: PathBuf,
    state: Mutex<AppState>,
}

impl AppStore {
    pub fn new(config_dir: PathBuf) -> Result<Self, String> {
        let path = config_dir.join("state.json");
        let state = if path.exists() {
            let raw = fs::read_to_string(&path).map_err(|e| format!("Cannot read settings: {e}"))?;
            let loaded: AppState = serde_json::from_str(&raw)
                .map_err(|e| format!("Settings are damaged; original file was preserved: {e}"))?;
            if loaded.schema_version != 1 {
                return Err("Unsupported settings format. Your settings were not changed.".into());
            }
            loaded
        } else {
            AppState::default()
        };
        Ok(Self { path, state: Mutex::new(state) })
    }

    pub fn snapshot(&self) -> Result<AppState, String> {
        self.state.lock().map(|guard| guard.clone()).map_err(|_| "Settings lock failed.".into())
    }

    pub fn update(&self, edit: impl FnOnce(&mut AppState) -> Result<(), String>) -> Result<AppState, String> {
        let mut guard = self.state.lock().map_err(|_| "Settings lock failed.".to_string())?;
        let mut next = guard.clone();
        edit(&mut next)?;
        let bytes = serde_json::to_vec_pretty(&next).map_err(|e| e.to_string())?;
        if let Some(parent) = self.path.parent() {
            fs::create_dir_all(parent).map_err(|e| format!("Cannot create settings directory: {e}"))?;
        }
        let temp = self.path.with_extension("json.tmp");
        fs::write(&temp, &bytes).map_err(|e| format!("Cannot save settings: {e}"))?;
        fs::rename(&temp, &self.path).map_err(|e| format!("Cannot commit settings: {e}"))?;
        *guard = next.clone();
        Ok(next)
    }
}
