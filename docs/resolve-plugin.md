# DaVinci Resolve Studio 20 Scripted GUI

This repository includes a Resolve **script** (not a compiled plugin bundle) that wraps the Auto-Editor CLI with a small GUI. The script lets you select a Media Pool clip, configure Auto-Editor arguments, and import the generated Resolve timeline back into your project.

## Install the Script Manually

1. Locate your Resolve scripts folder:
   - **macOS**: `~/Library/Application Support/Blackmagic Design/DaVinci Resolve/Fusion/Scripts/Utility/`
   - **Windows**: `%APPDATA%\Blackmagic Design\DaVinci Resolve\Fusion\Scripts\Utility\`
   - **Linux**: `~/.local/share/DaVinci Resolve/Fusion/Scripts/Utility/`
2. Copy `resources/resolve-plugin/AutoEditor.lua` into that folder.
3. Restart DaVinci Resolve.

## Usage

1. Open a project and ensure the target clip is in the Media Pool root.
2. Run **Workspace -> Scripts -> Utility -> AutoEditor**.
3. Use the **Basic** tab for common options (edit method, margin, add-in/cut-out, etc.).
4. Use the **Advanced** tab to append any additional Auto-Editor CLI flags (full CLI coverage).
5. Click **Create Timeline** to generate and import the timeline.

## Build a Release Zip

Use the build script to create a zip for distribution:

```bash
./scripts/build-resolve-plugin.sh
```

The zip will be created at `dist/auto-editor-resolve-plugin.zip` by default.

## Notes

- The **Advanced** tab supports every CLI flag because it is appended verbatim to the command.
- The script expects `auto-editor` to be available on your `PATH`.
- The script generates a temporary Resolve-compatible FCPXML file and imports it automatically.