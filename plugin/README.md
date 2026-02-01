# Auto-Editor Workflow Integration Plugin (DaVinci Resolve)

This folder contains the source for an **official Workflow Integration plugin** for DaVinci Resolve Studio. The plugin is **fully GUI-based and intended to be intuitive to use inside Resolve**, while it runs the Auto-Editor CLI in the background and imports the generated Resolve timeline via the Workflow Integration bridge.

## Prerequisites

- DaVinci Resolve **Studio** (Workflow Integrations require Studio).
- Auto-Editor installed and available on your PATH.

## Build

```bash
cd plugin
npm run build
```

## Package

```bash
npm run package
```

This creates `plugin/dist/com.autoeditor.workflowintegration-win.zip`.

## Install

Copy the built plugin folder to the Workflow Integration Plugins directory:

- **Windows**: `C:\ProgramData\Blackmagic Design\DaVinci Resolve\Support\Workflow Integration Plugins\`
- **macOS**: `/Library/Application Support/Blackmagic Design/DaVinci Resolve/Workflow Integration Plugins/`

Resulting path example:

```
.../Workflow Integration Plugins/com.autoeditor.workflowintegration/
```

Restart Resolve Studio, then open **Workspace → Workflow Integrations → Auto-Editor** to launch the plugin GUI.

## User Experience

- **Intuitive, GUI-first workflow**: All controls are presented in the Resolve UI; no manual command-line steps are required during use.
- **Launchable in Resolve Studio**: The plugin appears under **Workspace → Workflow Integrations** once installed, and runs entirely inside Resolve Studio.

## Troubleshooting

- **Plugin not showing**: Confirm Resolve Studio is installed, and the plugin folder is inside the correct Workflow Integration Plugins directory. Ensure the `manifest.xml` exists in the plugin folder.
- **Permissions errors**: On macOS, grant Resolve full disk access if Auto-Editor cannot read files.
- **Auto-Editor fails to run**: Confirm `auto-editor` is on your PATH and accessible from Resolve. Try running the command printed in the command preview.
- **Bridge errors**: The JS bridge expects Resolve Studio to inject `resolve` and `workflowIntegration` objects. Verify that Workflow Integrations are enabled and compatible with your Resolve version.

## Source Layout

```
plugin/
  src/              # Auto-Editor UI + JS logic
  dist/             # Built plugin output (com.autoeditor.workflowintegration)
  scripts/          # Build/package helpers
```
