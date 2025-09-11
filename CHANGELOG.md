# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2025-09-05

### Added
- Full-text search functionality with find bar interface
- Search highlighting with distinct current match indicator
- Navigation between search matches with previous/next buttons
- Case-sensitive search toggle option
- Comprehensive keyboard shortcuts for find operations:
  - Cmd/Ctrl+F: Open/close find bar
  - Enter/F3: Navigate to next match
  - Shift+Enter/Shift+F3: Navigate to previous match
  - Cmd/Ctrl+G: Find next (when bar is open)
  - Cmd/Ctrl+Shift+G: Find previous (when bar is open)
  - Escape: Close find bar
- Per-tab search state preservation
- Smooth scrolling to center matches in viewport
- Match counter display ("X of Y matches")
- Dark mode support for find bar and search highlights

### Changed
- Enhanced tab management with tabbed interface and persistent state
- Added keyboard shortcuts for tab operations (Cmd/Ctrl+T, Cmd/Ctrl+W, Cmd/Ctrl+1-9)
- Improved link handling to distinguish between URLs and file paths
- Updated UI layout to accommodate find bar positioning

### Technical Improvements
- Implemented FindManager class for search state management
- Added TreeWalker API for efficient text node traversal
- Integrated search functionality with existing tab system
- Enhanced keyboard event handling for comprehensive shortcut support
- Added proper highlight cleanup and DOM manipulation
- Implemented regex-based text matching with escape handling

## [0.2.2] - 2025-09-05

### Added
- Biome linter and formatter for consistent code style and formatting
- JavaScript/CSS linting rules with single quotes and semicolons
- Automated code formatting and style checking

### Fixed
- CI pipeline build failures by adding required Tauri system dependencies for Linux builds
- JavaScript linting issues with template literals and unused variables
- GitHub Actions workflow configuration for proper Tauri builds

### Technical
- Added `biome.json` configuration with formatting and linting rules
- Updated CI workflow to include libgtk-3-dev, libwebkit2gtk-4.1-dev, and other required packages
- Configured Biome to ignore third-party CSS files while maintaining code quality standards
- Enhanced development workflow with lint and format scripts in package.json

## [0.2.1] - 2025-09-04

### Fixed
- Reorganized GitHub workflows to proper `.github/workflows/` directory structure
- Updated Claude Code configuration settings for better development workflow
- Improved project organization and repository structure

### Technical
- Ensured all release artifacts are properly committed and synchronized
- Updated project metadata and configuration files
- Enhanced repository maintainability and CI/CD workflow organization

## [0.2.0] - 2025-09-04

### Added
- File restoration: Remember and restore last opened file on app launch
- Cmd+R keyboard shortcut for reloading current file
- External link handling: Links now open in system browser automatically
- Enhanced table styling with subtle row borders and improved cell padding
- Improved content layout with wider text areas and better space utilization

### Changed
- Optimized placeholder centering using fixed positioning for better visual alignment
- Extended paragraph and list widths to 80% with 1000px maximum for better readability
- Increased table width to 90% for improved data display
- Reduced right body padding to 5% to maximize content area
- Added border-collapse to tables for proper border rendering

### Technical Improvements
- Integrated Tauri opener plugin for system browser link handling
- Enhanced CSS specificity with !important rules for consistent styling
- Added localStorage support for file path persistence
- Improved error handling for file operations and link opening
- Added graceful fallback for missing files on app startup

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