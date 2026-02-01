# Auto-Editor DaVinci Resolve Script

This script (installed via Resolve's scripting folder) lets you run Auto-Editor directly from DaVinci Resolve, selecting a clip from the Media Pool and generating a Resolve timeline from the command-line output.

## Install

1. Locate your Resolve scripts folder:
   - **macOS**: `~/Library/Application Support/Blackmagic Design/DaVinci Resolve/Fusion/Scripts/Utility/`
   - **Windows**: `%APPDATA%\Blackmagic Design\DaVinci Resolve\Fusion\Scripts\Utility\`
   - **Linux**: `~/.local/share/DaVinci Resolve/Fusion/Scripts/Utility/`
2. Copy `AutoEditor.lua` into that folder.
3. Restart DaVinci Resolve.

## Usage

1. Open a project in Resolve and make sure the clip you want to edit is in the Media Pool.
2. Go to **Workspace -> Scripts -> Utility -> AutoEditor**.
3. Choose a clip, configure options in the **Basic** tab, add any extra CLI flags in **Advanced**, and click **Create Timeline**.

## Requirements

- Auto-Editor must be installed and available on your `PATH`.
- DaVinci Resolve Studio 20 with scripting enabled.