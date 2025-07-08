// src/extension.ts
import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

interface StarredFolder {
  name: string;
  path: string;
  workspaceFolder?: string;
}

class StarredFoldersProvider implements vscode.TreeDataProvider<StarredFolder> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    StarredFolder | undefined | null | void
  > = new vscode.EventEmitter<StarredFolder | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    StarredFolder | undefined | null | void
  > = this._onDidChangeTreeData.event;

  constructor(private context: vscode.ExtensionContext) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: StarredFolder): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(
      element.name,
      vscode.TreeItemCollapsibleState.None
    );

    treeItem.tooltip = element.path;
    treeItem.description = this.getRelativePath(element.path);
    treeItem.contextValue = "starredFolder";
    treeItem.resourceUri = vscode.Uri.file(element.path);

    // Set icon based on folder existence
    if (fs.existsSync(element.path)) {
      treeItem.iconPath = new vscode.ThemeIcon(
        "folder",
        new vscode.ThemeColor("charts.yellow")
      );
      treeItem.command = {
        command: "folderStar.openFolder",
        title: "Open Folder",
        arguments: [element],
      };
    } else {
      treeItem.iconPath = new vscode.ThemeIcon(
        "warning",
        new vscode.ThemeColor("errorForeground")
      );
      treeItem.tooltip = `${element.path} (Folder not found)`;
      treeItem.description = "Not found";
    }

    return treeItem;
  }

  getChildren(element?: StarredFolder): Thenable<StarredFolder[]> {
    if (!element) {
      return Promise.resolve(this.getStarredFolders());
    }
    return Promise.resolve([]);
  }

  private getStarredFolders(): StarredFolder[] {
    const starredFolders = this.context.workspaceState.get<StarredFolder[]>(
      "starredFolders",
      []
    );

    // Sort starred folders by name
    return starredFolders.sort((a, b) => a.name.localeCompare(b.name));
  }

  private getRelativePath(folderPath: string): string {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      return folderPath;
    }

    for (const workspaceFolder of workspaceFolders) {
      const workspacePath = workspaceFolder.uri.fsPath;
      if (folderPath.startsWith(workspacePath)) {
        const relativePath = path.relative(workspacePath, folderPath);
        return relativePath || workspaceFolder.name;
      }
    }

    return folderPath;
  }

  async addStarredFolder(folderUri: vscode.Uri): Promise<void> {
    const starredFolders = this.getStarredFolders();
    const folderPath = folderUri.fsPath;

    // Check if folder is already starred
    if (starredFolders.some((folder) => folder.path === folderPath)) {
      vscode.window.showInformationMessage("Folder is already starred!");
      return;
    }

    const folderName = path.basename(folderPath);
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(folderUri);

    const newStarredFolder: StarredFolder = {
      name: folderName,
      path: folderPath,
      workspaceFolder: workspaceFolder?.name,
    };

    starredFolders.push(newStarredFolder);
    await this.context.workspaceState.update("starredFolders", starredFolders);

    this.refresh();
    this.updateContext();

    vscode.window.showInformationMessage(`⭐ Starred folder: ${folderName}`);
  }

  async removeStarredFolder(folderPath: string): Promise<void> {
    const starredFolders = this.getStarredFolders();
    const updatedFolders = starredFolders.filter(
      (folder) => folder.path !== folderPath
    );

    await this.context.workspaceState.update("starredFolders", updatedFolders);
    this.refresh();
    this.updateContext();

    const folderName = path.basename(folderPath);
    vscode.window.showInformationMessage(
      `Removed starred folder: ${folderName}`
    );
  }

  async clearAllStarredFolders(): Promise<void> {
    const result = await vscode.window.showWarningMessage(
      "Are you sure you want to clear all starred folders?",
      { modal: true },
      "Yes",
      "No"
    );

    if (result === "Yes") {
      await this.context.workspaceState.update("starredFolders", []);
      this.refresh();
      this.updateContext();
      vscode.window.showInformationMessage("All starred folders cleared!");
    }
  }

  isFolderStarred(folderPath: string): boolean {
    const starredFolders = this.getStarredFolders();
    return starredFolders.some((folder) => folder.path === folderPath);
  }

  updateContext(): void {
    const hasStarredFolders = this.getStarredFolders().length > 0;
    vscode.commands.executeCommand(
      "setContext",
      "folderStar.hasStarredFolders",
      hasStarredFolders
    );
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log("Folder Star extension is now active!");

  const provider = new StarredFoldersProvider(context);

  // Register tree data provider
  vscode.window.registerTreeDataProvider("starredFolders", provider);

  // Update context immediately
  provider.updateContext();

  // Command: Star Folder
  const starFolderCommand = vscode.commands.registerCommand(
    "folderStar.starFolder",
    async (uri: vscode.Uri) => {
      if (uri && uri.scheme === "file") {
        await provider.addStarredFolder(uri);
      }
    }
  );

  // Command: Unstar Folder
  const unstarFolderCommand = vscode.commands.registerCommand(
    "folderStar.unstarFolder",
    async (uri: vscode.Uri) => {
      if (uri && uri.scheme === "file") {
        await provider.removeStarredFolder(uri.fsPath);
      }
    }
  );

  // Command: Open Folder
  const openFolderCommand = vscode.commands.registerCommand(
    "folderStar.openFolder",
    async (starredFolder: StarredFolder) => {
      const folderUri = vscode.Uri.file(starredFolder.path);

      // Check if folder exists
      if (!fs.existsSync(starredFolder.path)) {
        const result = await vscode.window.showErrorMessage(
          `Folder "${starredFolder.name}" not found. Remove from starred folders?`,
          "Remove",
          "Cancel"
        );

        if (result === "Remove") {
          await provider.removeStarredFolder(starredFolder.path);
        }
        return;
      }

      // Reveal folder in explorer
      try {
        await vscode.commands.executeCommand("revealInExplorer", folderUri);
      } catch (error) {
        // Fallback: open folder in new window
        const result = await vscode.window.showInformationMessage(
          `Open "${starredFolder.name}" in new window?`,
          "Open",
          "Cancel"
        );

        if (result === "Open") {
          await vscode.commands.executeCommand("vscode.openFolder", folderUri, {
            forceNewWindow: true,
          });
        }
      }
    }
  );

  // Command: Remove Starred Folder
  const removeStarredFolderCommand = vscode.commands.registerCommand(
    "folderStar.removeStarredFolder",
    async (starredFolder: StarredFolder) => {
      await provider.removeStarredFolder(starredFolder.path);
    }
  );

  // Command: Clear All Starred Folders
  const clearAllStarredCommand = vscode.commands.registerCommand(
    "folderStar.clearAllStarred",
    async () => {
      await provider.clearAllStarredFolders();
    }
  );

  // Command: Refresh Starred Folders
  const refreshCommand = vscode.commands.registerCommand(
    "folderStar.refreshStarred",
    () => {
      provider.refresh();
      vscode.window.showInformationMessage("Starred folders refreshed!");
    }
  );

  // Context menu visibility based on starred status
  const updateContextMenu = (uri?: vscode.Uri) => {
    if (uri && uri.scheme === "file") {
      const isStarred = provider.isFolderStarred(uri.fsPath);
      vscode.commands.executeCommand(
        "setContext",
        "folderStar.isStarred",
        isStarred
      );
    }
  };

  // Listen for explorer selection changes to update context
  const onDidChangeActiveTextEditor = vscode.window.onDidChangeActiveTextEditor(
    () => {
      updateContextMenu();
    }
  );

  // Watch for file system changes to refresh starred folders
  const fileWatcher = vscode.workspace.createFileSystemWatcher(
    "**/*",
    false,
    true,
    false
  );

  fileWatcher.onDidDelete((uri) => {
    // If a starred folder is deleted, refresh the view
    if (provider.isFolderStarred(uri.fsPath)) {
      provider.refresh();
    }
  });

  // Register disposables
  context.subscriptions.push(
    starFolderCommand,
    unstarFolderCommand,
    openFolderCommand,
    removeStarredFolderCommand,
    clearAllStarredCommand,
    refreshCommand,
    onDidChangeActiveTextEditor,
    fileWatcher
  );

  // Show welcome message on first activation
  const isFirstTime = context.globalState.get("folderStar.firstTime", true);
  if (isFirstTime) {
    vscode.window.showInformationMessage(
      "⭐ Folder Star extension activated! Right-click on any folder to star it.",
      "Got it!"
    );
    context.globalState.update("folderStar.firstTime", false);
  }
}

export function deactivate() {
  console.log("Folder Star extension is now deactivated!");
}
