# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a Tauri desktop application that combines a Rust backend with a vanilla HTML/CSS/JavaScript frontend. The project structure follows Tauri conventions:

- **Frontend**: Located in `src/` - vanilla HTML, CSS, and JavaScript
- **Backend**: Located in `src-tauri/` - Rust code using Tauri framework
- **Main entry**: `src-tauri/src/main.rs` calls into `lib.rs`
- **Tauri commands**: Defined in `src-tauri/src/lib.rs` and invoked from frontend JavaScript
- **Configuration**: `src-tauri/tauri.conf.json` controls app settings, window properties, and build configuration

## Development Commands

**Development server** (runs app in development mode):
```bash
npm run tauri dev
```

**Build application** (creates distributable):
```bash
npm run tauri build
```

**Rust development** (for backend changes):
```bash
cd src-tauri
cargo check     # Fast compile check
cargo build     # Build without running
cargo test      # Run tests
```

## Key Technical Details

- Frontend communicates with Rust backend via `window.__TAURI__.core.invoke()` 
- Tauri commands are defined with `#[tauri::command]` attribute in `lib.rs`
- App uses `tauri-plugin-opener` for opening external links/files
- Window configuration: 800x600px default size
- Bundle targets: "all" (cross-platform builds available)