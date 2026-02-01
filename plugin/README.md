# Auto-Editor Workflow Integration Plugin (DaVinci Resolve Studio 20)

This folder contains the **Workflow Integration plugin** that adds a dedicated Auto-Editor tab inside DaVinci Resolve Studio 20. The plugin runs the Auto-Editor CLI behind the scenes, then imports the generated Resolve timeline directly into your project.

## Highlights

- **GUI-first workflow** with a guided edit builder + advanced options
- **Full CLI coverage** via the Advanced tab and extra-args field
- **Command preview** to audit exactly what will run
- **Timeline import + render helper** buttons built in

## Requirements

- DaVinci Resolve **Studio 20** (Workflow Integrations are Studio-only)
- Auto-Editor installed and available on your PATH (or set a custom executable path in the UI)

## Build

```bash
cd plugin
node scripts/build.js
```

## Package (Windows zip)

```bash
cd plugin
node scripts/package.js
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

Restart Resolve Studio, then open **Workspace -> Workflow Integrations -> Auto-Editor** to launch the plugin GUI.

## Troubleshooting

- **Plugin not showing**: Confirm Resolve Studio is installed, and the plugin folder is inside the correct Workflow Integration Plugins directory. Ensure the `manifest.xml` exists in the plugin folder.
- **Auto-Editor fails to run**: Confirm `auto-editor` is on your PATH, or set the executable path in the Source & Output section.
- **Bridge errors**: Resolve Studio must inject `resolve` and `workflowIntegration` objects. Verify Workflow Integrations are enabled in Resolve Studio 20.