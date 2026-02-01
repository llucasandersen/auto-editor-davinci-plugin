# Auto-Editor Workflow Integration Plugin for DaVinci Resolve Studio 20

This repository ships a **Workflow Integration plugin** that adds Auto-Editor as a dedicated tab inside DaVinci Resolve Studio 20. It runs the Auto-Editor CLI in the background, then imports the generated Resolve timeline straight into your project.

## Why this plugin

- **GUI-first**: no command line required once installed
- **Full Auto-Editor coverage**: every CLI feature mapped into buttons, toggles, and guided fields
- **Workflow modes**: Resolve timeline import or export-only runs
- **Utilities tab**: info, desc, levels, subdump, whisper, and cache tools
- **Fast iteration**: command preview + copy button + timeline import
- **Resolve-native workflow**: appears under **Workspace -> Workflow Integrations**

## Requirements

- DaVinci Resolve **Studio 20** (Workflow Integrations are Studio-only)
- Auto-Editor installed and available on your PATH (or set a custom executable path in the UI)

## Quick install (Windows)

1. Extract `plugin/dist/com.autoeditor.workflowintegration-win.zip`.
2. Copy the extracted `com.autoeditor.workflowintegration` folder to:

```
C:\ProgramData\Blackmagic Design\DaVinci Resolve\Support\Workflow Integration Plugins\
```

3. Restart Resolve Studio.
4. Open **Workspace -> Workflow Integrations -> Auto-Editor**.

## Quick install (macOS)

Copy the built folder to:

```
/Library/Application Support/Blackmagic Design/DaVinci Resolve/Workflow Integration Plugins/
```

Restart Resolve Studio and open **Workspace -> Workflow Integrations -> Auto-Editor**.

## Usage

1. Select a Media Pool clip, choose a workflow mode, and name your timeline.
2. Build an edit strategy with the rule builder (single, combined, or manual expression).
3. Configure pacing, actions, and manual ranges in the Edit tab.
4. Use the **Advanced** tab for codecs, streams, downloads, and diagnostics.
5. Click **Create Timeline** (Resolve mode) or **Run Export** (export-only mode).
6. For analysis and utility commands, switch to the **Utilities** tab.

## Build & package (Windows)

```bash
cd plugin
node scripts/build.js
node scripts/package.js
```

The Windows zip is created at:

```
plugin/dist/com.autoeditor.workflowintegration-win.zip
```

## Scripted GUI (optional)

If you cannot use Workflow Integrations, a lightweight **Resolve script** is also included at `resources/resolve-plugin/AutoEditor.lua`. It provides a minimal GUI via Resolve's scripting menu. See `docs/resolve-plugin.md` for details.

## Troubleshooting

- **Plugin not showing**: Confirm Resolve Studio is installed and the plugin folder is in the Workflow Integration Plugins directory.
- **Auto-Editor fails to run**: Check that `auto-editor` is on your PATH, or set the executable path in the plugin UI.
- **No clips listed**: Ensure a project is open and clips exist in the Media Pool.
- **Bridge errors**: Workflow Integrations must be enabled and supported by Resolve Studio 20.
