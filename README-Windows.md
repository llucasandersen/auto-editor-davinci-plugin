# Auto-Editor DaVinci Resolve Workflow Integration (Windows)

This Workflow Integration plugin requires **DaVinci Resolve Studio**.

## Build

```bash
cd plugin
npm run build
```

## Package

```bash
cd plugin
npm run package
```

This creates `plugin/dist/com.autoeditor.workflowintegration-win.zip`.

## Install

```bash
cd plugin
npm run install:resolve
```

The plugin is installed to:

```
%ProgramData%\Blackmagic Design\DaVinci Resolve\Support\Workflow Integration Plugins\com.autoeditor.workflowintegration
```

Restart Resolve, then open **Workspace → Workflow Integrations → Auto-Editor**.

## Troubleshooting

- **Plugin not showing**: Confirm the folder name matches `com.autoeditor.workflowintegration`, the `manifest.xml` exists, and Resolve Studio was restarted.
