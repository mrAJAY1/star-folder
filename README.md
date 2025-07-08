# Folder Star ⭐

A VSCode extension that allows you to star your favorite folders for quick access from the Explorer sidebar.

## Features

- ⭐ **Star folders** from the file explorer context menu
- 📁 **Quick access** to starred folders in a dedicated sidebar panel
- 🔍 **Smart folder detection** - shows relative paths and workspace context
- 🗑️ **Easy management** - remove individual starred folders or clear all
- 💾 **Persistent** - starred folders are saved per workspace
- 🔄 **Auto-refresh** - automatically updates when folders are deleted

## How to Use

### Starring Folders

1. Right-click on any folder in the Explorer
2. Select "⭐ Star Folder" from the context menu
3. The folder will appear in the "Starred Folders" panel

### Accessing Starred Folders

1. Look for the "Starred Folders" panel in the Explorer sidebar
2. Click on any starred folder to navigate to it
3. Use the folder icons to open folders or the trash icon to remove them

### Managing Starred Folders

- **Remove individual folder**: Click the trash icon next to a starred folder
- **Clear all starred folders**: Click the "Clear All" button in the panel header
- **Refresh panel**: Click the refresh button if folders seem out of sync

## Commands

| Command                          | Description                       |
| -------------------------------- | --------------------------------- |
| `folderStar.starFolder`          | Star the selected folder          |
| `folderStar.unstarFolder`        | Unstar the selected folder        |
| `folderStar.openFolder`          | Open/navigate to starred folder   |
| `folderStar.removeStarredFolder` | Remove folder from starred list   |
| `folderStar.clearAllStarred`     | Clear all starred folders         |
| `folderStar.refreshStarred`      | Refresh the starred folders panel |

## Context Menu

The extension adds context menu items to folders in the Explorer:

- **⭐ Star Folder** - appears when folder is not starred
- **⭐ Unstar Folder** - appears when folder is already starred

## Installation

### From VSIX (Development)

1. Clone or download this repository
2. Open terminal in the extension directory
3. Run `npm install` to install dependencies
4. Run `npm run compile` to build the extension
5. Press `F5` to launch a new Extension Development Host window
6. Or package with `vsce package` and install the `.vsix` file

### From Marketplace

_(When published)_
Search for "Folder Star" in the VSCode Extensions marketplace.

## Development

### Prerequisites

- Node.js (v16 or higher)
- VSCode
- TypeScript

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd folder-star-vscode-extension

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes during development
npm run watch
```

### Testing

1. Press `F5` to launch Extension Development Host
2. Open a folder/workspace in the new window
3. Right-click on folders to test starring functionality

### Building

```bash
# Compile for production
npm run vscode:prepublish

# Package extension (requires vsce)
npm install -g vsce
vsce package
```

## Project Structure

```
folder-star/
├── src/
│   └── extension.ts          # Main extension code
├── package.json              # Extension manifest
├── tsconfig.json            # TypeScript configuration
├── README.md                # This file
└── out/                     # Compiled JavaScript (generated)
    └── extension.js
```

## Features in Detail

### Smart Path Display

- Shows relative paths within workspace folders
- Displays workspace name for context
- Handles multi-root workspaces correctly

### Folder State Management

- Detects when starred folders are deleted
- Shows warning icons for missing folders
- Offers to remove non-existent folders from starred list

### Persistence

- Starred folders are stored per workspace using VSCode's `workspaceState`
- Survives VSCode restarts and workspace reopening
- Each workspace maintains its own starred folders list

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Known Issues

- Folder icons might not update immediately after filesystem changes
- Context menu items might briefly show incorrect state during rapid folder operations

## Changelog

### 1.0.0

- Initial release
- Basic starring and unstarring functionality
- Starred folders sidebar panel
- Context menu integration
- Workspace-specific persistence

## License

MIT License - see LICENSE file for details

## Feedback

If you encounter any issues or have suggestions for improvements, please create an issue on the GitHub repository.

## Tips

- Use starred folders for frequently accessed project directories
- Great for large codebases with deep folder structures
- Starred folders persist across VSCode sessions
- Works with multi-root workspaces
