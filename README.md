# Markdown Viewer

A clean, beautiful desktop markdown viewer built with Tauri 2.0 and styled with Tufte CSS for optimal readability.

## Features

- **Clean Interface**: Distraction-free reading experience focused purely on content
- **Beautiful Typography**: Tufte CSS styling for academic-quality text rendering
- **File Support**: Open `.md`, `.markdown`, and `.txt` files via native file dialogs
- **Keyboard Shortcuts**: Quick access with `Cmd+O` (macOS) or `Ctrl+O` (Windows/Linux)
- **System Integration**: Native menu bar with File → Open functionality
- **Dark Mode**: Automatic theme switching based on system preferences
- **Fast Rendering**: Powered by marked.js for quick markdown parsing
- **Native Performance**: Built with Tauri for lightweight, native desktop app experience

## Usage

1. **Opening Files**: 
   - Use `Cmd+O` (macOS) or `Ctrl+O` (Windows/Linux)
   - Or access File → Open from the menu bar
   
2. **Supported Formats**: 
   - Markdown files (`.md`, `.markdown`)
   - Plain text files (`.txt`)

3. **Reading Experience**: 
   - Clean typography optimized for long-form reading
   - Automatic light/dark mode switching
   - Minimal interface that gets out of your way

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Rust](https://rustup.rs/) (latest stable)
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites)

### Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Run in development mode:
   ```bash
   npm run tauri dev
   ```

4. Build for production:
   ```bash
   npm run tauri build
   ```

## Architecture

- **Frontend**: Vanilla HTML, CSS, and JavaScript with ES modules
- **Styling**: Tufte CSS for typography with custom spacing optimizations
- **Markdown Processing**: marked.js for fast parsing and rendering
- **Backend**: Rust with Tauri for file system access and native dialogs
- **Plugins**: Uses Tauri's dialog and filesystem plugins

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
