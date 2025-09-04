# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-09-04

### Added
- Initial release of Markdown Viewer
- Clean, distraction-free markdown viewing experience
- File dialog integration for opening markdown files (.md, .markdown, .txt)
- Tufte CSS typography for beautiful, academic-style text rendering
- Keyboard shortcut (Cmd+O) for quick file opening
- System menu integration with File → Open functionality
- Dark mode support that respects system preferences
- Responsive design optimized for readability
- Error handling with user-friendly messages
- Minimal, focused interface with no UI clutter

### Technical Details
- Built with Tauri 2.0 for native desktop performance
- Uses marked.js for fast markdown parsing and rendering
- Implements Tauri file dialog and filesystem plugins
- Leverages Tufte CSS with custom spacing optimizations
- Supports ES modules with CDN imports for marked.js

### Features
- **File Support**: Opens .md, .markdown, and .txt files
- **Typography**: Beautiful Tufte CSS styling for optimal readability
- **Shortcuts**: Cmd+O keyboard shortcut for opening files
- **Themes**: Automatic light/dark mode switching
- **Interface**: Clean, minimalist design focused on content