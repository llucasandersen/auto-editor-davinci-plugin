# Auto-Editor Workflow Integration Plugin (Windows)

This is the **Workflow Integration** plugin for DaVinci Resolve Studio 20. It appears as a dedicated Auto-Editor tab inside Resolve Studio.

## Build

```bash
cd plugin
node scripts/build.js
```

## Package

```bash
cd plugin
node scripts/package.js
```

This creates `plugin/dist/com.autoeditor.workflowintegration-win.zip`.

## Install

Copy the built plugin folder to:

```
C:\ProgramData\Blackmagic Design\DaVinci Resolve\Support\Workflow Integration Plugins\com.autoeditor.workflowintegration
```

Restart Resolve Studio, then open **Workspace -> Workflow Integrations -> Auto-Editor**.

## Troubleshooting

- **Plugin not showing**: Confirm the folder name matches `com.autoeditor.workflowintegration`, the `manifest.xml` exists, and Resolve Studio was restarted.
- **Auto-Editor not found**: Ensure `auto-editor` is on your PATH, or set the executable path in the plugin UI.