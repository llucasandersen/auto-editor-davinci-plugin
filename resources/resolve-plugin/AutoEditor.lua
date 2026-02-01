-- Auto-Editor DaVinci Resolve Script
-- Installs as a Resolve script and calls auto-editor to generate a Resolve timeline.

local resolve = Resolve()
if not resolve then
  print("Auto-Editor: Unable to access Resolve scripting API.")
  return
end

local projectManager = resolve:GetProjectManager()
local project = projectManager:GetCurrentProject()
if not project then
  print("Auto-Editor: No active project. Please open a project and try again.")
  return
end

local mediaPool = project:GetMediaPool()
local rootFolder = mediaPool:GetRootFolder()

local function collect_clips(folder, prefix, result)
  local clips = folder:GetClipList() or {}
  for _, clip in ipairs(clips) do
    local name = clip:GetName() or "Untitled Clip"
    table.insert(result, {
      label = prefix .. name,
      clip = clip,
    })
  end

  local subfolders = folder:GetSubFolderList() or {}
  for _, subfolder in ipairs(subfolders) do
    local subname = subfolder:GetName() or "Folder"
    collect_clips(subfolder, prefix .. subname .. " / ", result)
  end
end

local clipEntries = {}
collect_clips(rootFolder, "", clipEntries)
if #clipEntries == 0 then
  print("Auto-Editor: No clips found in the Media Pool.")
  return
end

local fusion = resolve:GetFusion()
local ui = fusion.UIManager
local dispatcher = bmd.UIDispatcher(ui)

local window = dispatcher:AddWindow({
  ID = "AutoEditorWindow",
  WindowTitle = "Auto-Editor",
  Geometry = {100, 100, 720, 460},
},
ui:VGroup({
  ID = "root",
  ui:Label({Text = "Select a clip and configure Auto-Editor options."}),
  ui:HGroup({
    ui:Label({Text = "Clip", Weight = 0.3}),
    ui:ComboBox({ID = "clip", Weight = 0.7}),
  }),
  ui:TabBar({
    ID = "tabs",
    ui:TabPage({
      Text = "Basic",
      ui:VGroup({
        ui:HGroup({
          ui:Label({Text = "Timeline name", Weight = 0.3}),
          ui:LineEdit({ID = "timeline", Text = "Auto-Editor Timeline"}),
        }),
        ui:HGroup({
          ui:Label({Text = "Edit method", Weight = 0.3}),
          ui:LineEdit({ID = "edit", PlaceholderText = "audio:threshold=0.04"}),
        }),
        ui:HGroup({
          ui:Label({Text = "Margin (before,after)", Weight = 0.3}),
          ui:LineEdit({ID = "margin", PlaceholderText = "0.2s,0.2s"}),
        }),
        ui:HGroup({
          ui:Label({Text = "When silent", Weight = 0.3}),
          ui:LineEdit({ID = "whenSilent", PlaceholderText = "cut"}),
        }),
        ui:HGroup({
          ui:Label({Text = "When normal", Weight = 0.3}),
          ui:LineEdit({ID = "whenNormal", PlaceholderText = "keep"}),
        }),
        ui:HGroup({
          ui:Label({Text = "Cut out (time ranges)", Weight = 0.3}),
          ui:LineEdit({ID = "cutOut", PlaceholderText = "0,5sec 10sec,12sec"}),
        }),
        ui:HGroup({
          ui:Label({Text = "Add in (time ranges)", Weight = 0.3}),
          ui:LineEdit({ID = "addIn", PlaceholderText = "0,5sec"}),
        }),
      }),
    }),
    ui:TabPage({
      Text = "Advanced",
      ui:VGroup({
        ui:Label({Text = "Any CLI arguments are supported here. These are appended to the basic options."}),
        ui:HGroup({
          ui:Label({Text = "Extra CLI args", Weight = 0.3}),
          ui:LineEdit({ID = "args", PlaceholderText = "--export resolve --edit motion:threshold=0.02"}),
        }),
        ui:HGroup({
          ui:Label({Text = "Command preview", Weight = 0.3}),
          ui:LineEdit({ID = "preview", ReadOnly = true}),
        }),
      }),
    }),
  }),
  ui:HGroup({
    ui:Button({ID = "refresh", Text = "Refresh Clips", Weight = 0.2}),
    ui:Button({ID = "copy", Text = "Copy Command", Weight = 0.2}),
    ui:Button({ID = "run", Text = "Create Timeline", Weight = 0.3}),
    ui:Button({ID = "cancel", Text = "Cancel", Weight = 0.3}),
  }),
}))

local itm = window:GetItems()
local function refresh_clips()
  itm.clip:Clear()
  for _, entry in ipairs(clipEntries) do
    itm.clip:AddItem(entry.label)
  end
  itm.clip.CurrentIndex = 0
end
refresh_clips()

local function escape_arg(value)
  return '"' .. string.gsub(value, '"', '\\"') .. '"'
end

local function find_clip_by_label(label)
  for _, entry in ipairs(clipEntries) do
    if entry.label == label then
      return entry.clip
    end
  end
  return nil
end

local function build_cli_args()
  local args = {}

  if itm.edit.Text and itm.edit.Text ~= "" then
    table.insert(args, "--edit " .. itm.edit.Text)
  end
  if itm.margin.Text and itm.margin.Text ~= "" then
    table.insert(args, "--margin " .. itm.margin.Text)
  end
  if itm.whenSilent.Text and itm.whenSilent.Text ~= "" then
    table.insert(args, "--when-silent " .. itm.whenSilent.Text)
  end
  if itm.whenNormal.Text and itm.whenNormal.Text ~= "" then
    table.insert(args, "--when-normal " .. itm.whenNormal.Text)
  end
  if itm.cutOut.Text and itm.cutOut.Text ~= "" then
    table.insert(args, "--cut-out " .. itm.cutOut.Text)
  end
  if itm.addIn.Text and itm.addIn.Text ~= "" then
    table.insert(args, "--add-in " .. itm.addIn.Text)
  end
  if itm.args.Text and itm.args.Text ~= "" then
    table.insert(args, itm.args.Text)
  end

  return table.concat(args, " ")
end

local function run_auto_editor()
  local clipName = itm.clip.CurrentText or ""
  local timelineName = itm.timeline.Text or "Auto-Editor Timeline"

  local clip = find_clip_by_label(clipName)
  if not clip then
    print("Auto-Editor: Could not find clip: " .. clipName)
    return
  end

  local path = clip:GetClipProperty("File Path")
  if not path or path == "" then
    print("Auto-Editor: Unable to determine file path for clip: " .. clipName)
    return
  end

  local xmlPath = os.tmpname() .. ".fcpxml"
  local command = "auto-editor " .. escape_arg(path) .. " --export resolve:name=" .. escape_arg(timelineName)
  local extraArgs = build_cli_args()
  if extraArgs ~= "" then
    command = command .. " " .. extraArgs
  end
  command = command .. " --output " .. escape_arg(xmlPath)

  print("Auto-Editor: Running command: " .. command)
  local result = os.execute(command)
  if result ~= 0 then
    print("Auto-Editor: auto-editor command failed. Please check your args and try again.")
    return
  end

  local ok = mediaPool:ImportTimelineFromFile(xmlPath)
  if not ok then
    print("Auto-Editor: Failed to import timeline. Check the generated XML at: " .. xmlPath)
    return
  end

  print("Auto-Editor: Timeline imported successfully.")
end

local function update_preview()
  local clipName = itm.clip.CurrentText or ""
  local timelineName = itm.timeline.Text or "Auto-Editor Timeline"
  local extraArgs = build_cli_args()
  local preview = "auto-editor <clip> --export resolve:name=" .. escape_arg(timelineName)
  if clipName ~= "" then
    preview = "auto-editor " .. escape_arg(clipName) .. " --export resolve:name=" .. escape_arg(timelineName)
  end
  if extraArgs ~= "" then
    preview = preview .. " " .. extraArgs
  end
  preview = preview .. " --output <path>.fcpxml"
  itm.preview.Text = preview
end

function window.On.run.Clicked(ev)
  run_auto_editor()
  dispatcher:ExitLoop()
end

function window.On.refresh.Clicked(ev)
  clipEntries = {}
  collect_clips(rootFolder, "", clipEntries)
  refresh_clips()
  update_preview()
end

function window.On.copy.Clicked(ev)
  update_preview()
  print("Auto-Editor: Command preview copied to console.")
end

function window.On.cancel.Clicked(ev)
  dispatcher:ExitLoop()
end

function window.On.clip.CurrentIndexChanged(ev)
  update_preview()
end

function window.On.timeline.TextChanged(ev)
  update_preview()
end

function window.On.args.TextChanged(ev)
  update_preview()
end

function window.On.edit.TextChanged(ev)
  update_preview()
end

function window.On.margin.TextChanged(ev)
  update_preview()
end

function window.On.whenSilent.TextChanged(ev)
  update_preview()
end

function window.On.whenNormal.TextChanged(ev)
  update_preview()
end

function window.On.cutOut.TextChanged(ev)
  update_preview()
end

function window.On.addIn.TextChanged(ev)
  update_preview()
end

window:Show()
update_preview()
dispatcher:RunLoop()
window:Hide()
