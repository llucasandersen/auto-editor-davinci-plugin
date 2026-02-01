# Auto-Editor Workflow Integration Plugin (DaVinci Resolve)

This folder contains the source for an **official Workflow Integration plugin** for DaVinci Resolve Studio, built with the Blackmagic Design Workflow Integration SDK. The plugin is **fully GUI-based and intended to be intuitive to use inside Resolve**, while it runs the Auto-Editor CLI in the background and imports the generated Resolve timeline via the Workflow Integration bridge.

> **SDK Required**: The Blackmagic DaVinci Resolve Studio Developer/Workflow Integration SDK is not included in this repo. Download it from Blackmagic Design and point this project at the SDK using environment variables as described below.

## Prerequisites

- DaVinci Resolve **Studio** (Workflow Integrations require Studio).
- The Workflow Integration SDK from Blackmagic Design.
- Auto-Editor installed and available on your PATH.

## SDK Setup

Set one of the following environment variables to point at the SDK:

- `RESOLVE_SDK_DIR`: Path to the SDK root.
- `RESOLVE_SDK_SAMPLE_DIR`: Path to the **Workflow Integration sample plugin** directory (preferred).

The build script will copy the official sample structure into `plugin/dist/com.autoeditor.workflowintegration/` and then overlay the Auto-Editor UI/logic from `plugin/src/`.

> The build intentionally **skips SDK headers and binaries** (`.h`, `.lib`, `.dll`, `.dylib`, etc.) to avoid committing SDK artifacts.
> The `PluginInfo.json` in `plugin/src/` is a placeholder and should be replaced/overwritten by the SDK sample manifest if it differs.

## Build

```bash
cd plugin
npm install
npm run build
```

If the SDK sample is not found, the build will still succeed but only Auto-Editor files will be copied. Provide `RESOLVE_SDK_DIR` or `RESOLVE_SDK_SAMPLE_DIR` to include the official template files.

## Package

```bash
npm run package
```

This creates `plugin/dist/auto-editor-workflow-plugin.zip`.

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

- **Plugin not showing**: Confirm Resolve Studio is installed, and the plugin folder is inside the correct Workflow Integration Plugins directory. Ensure the SDK sample files are present (manifest, plugin info, etc.).
- **Permissions errors**: On macOS, grant Resolve full disk access if Auto-Editor cannot read files.
- **Auto-Editor fails to run**: Confirm `auto-editor` is on your PATH and accessible from Resolve. Try running the command printed in the command preview.
- **Bridge errors**: The JS bridge expects the SDK to inject `resolve` and `workflowIntegration` objects. Verify that the official sample files are present and compatible with your Resolve version.

## Source Layout

```
plugin/
  src/              # Auto-Editor UI + JS logic
  dist/             # Built plugin output (com.autoeditor.workflowintegration)
  scripts/          # Build/package helpers
```
