# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a desktop markdown viewer application built with Tauri 2.0. It provides a clean, distraction-free reading experience with beautiful Tufte CSS typography. The app allows users to open and view markdown files with native system integration.

## Project Architecture

This is a Tauri desktop application that combines a Rust backend with a vanilla HTML/CSS/JavaScript frontend:

- **Frontend**: Located in `src/` - vanilla HTML, CSS, and JavaScript with ES modules
- **Backend**: Located in `src-tauri/` - Rust code using Tauri framework
- **Styling**: Uses Tufte CSS (`src/tufte.css`) with custom overrides in `src/styles.css`
- **Markdown Processing**: Uses marked.js imported from CDN for rendering
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
- File operations use `read_file` command defined in `lib.rs`
- Uses Tauri plugins: `tauri-plugin-dialog` and `tauri-plugin-fs`
- Markdown rendering via marked.js loaded from `https://cdn.jsdelivr.net/npm/marked@16.2.1/+esm`
- System menu integration attempts to use `window.__TAURI__.menu` (may fallback to keyboard shortcuts)
- Keyboard shortcut: Cmd+O (macOS) / Ctrl+O (Windows/Linux) for opening files
- File dialog filters: `.md`, `.markdown`, `.txt` files
- Typography optimized with Tufte CSS and custom spacing overrides
- Dark mode support via CSS `@media (prefers-color-scheme: dark)`

## Important Development Guidelines

### Documentation Maintenance
When making changes to this project, **ALWAYS** update the following files:

1. **CHANGELOG.md**: Add entries following [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format
   - Use semantic versioning (MAJOR.MINOR.PATCH)
   - Document all Added, Changed, Deprecated, Removed, Fixed, and Security updates
   - Include both user-facing features and technical details

2. **README.md**: Keep the README current with:
   - Feature descriptions that match actual functionality
   - Usage instructions that reflect current UI/UX
   - Development setup steps that work
   - Architecture overview that matches current implementation

### When to Update Documentation
- **New features**: Add to README Features section and CHANGELOG Added section
- **UI changes**: Update README Usage section and add to CHANGELOG Changed section  
- **Bug fixes**: Document in CHANGELOG Fixed section
- **Dependencies**: Note in CHANGELOG and verify README prerequisites are current
- **Breaking changes**: Clearly mark in CHANGELOG and update README accordingly

### Code Style and Patterns
- Maintain the clean, minimal aesthetic - avoid UI clutter
- Use Tufte CSS for typography, custom CSS only for layout/spacing overrides
- Keep error handling user-friendly with clear messages
- Prefer system integration (native dialogs, menus) over custom UI components
- Test both keyboard shortcuts and menu actions for file operations