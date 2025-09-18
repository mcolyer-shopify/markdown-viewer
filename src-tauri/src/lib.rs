#[tauri::command]
async fn read_file(path: String) -> Result<String, String> {
    match std::fs::read_to_string(&path) {
        Ok(contents) => Ok(contents),
        Err(e) => Err(format!("Failed to read file: {}", e)),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![read_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
