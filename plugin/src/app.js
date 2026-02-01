import {
  listMediaPoolClips,
  getClipFilePath,
  importTimeline,
  getCurrentTimelineInfo,
  renderCurrentTimeline,
  executeCommand,
  getTempFilePath,
  closePlugin,
} from "./bridge/resolveBridge.js";
import {
  buildAutoEditorArgs,
  buildAutoEditorCommand,
  buildPreviewCommand,
} from "./logic/autoEditor.js";

const elements = {
  clip: document.getElementById("clip"),
  timeline: document.getElementById("timeline"),
  edit: document.getElementById("edit"),
  margin: document.getElementById("margin"),
  whenSilent: document.getElementById("whenSilent"),
  whenNormal: document.getElementById("whenNormal"),
  cutOut: document.getElementById("cutOut"),
  addIn: document.getElementById("addIn"),
  args: document.getElementById("args"),
  preview: document.getElementById("preview"),
  status: document.getElementById("status"),
  refresh: document.getElementById("refresh"),
  copy: document.getElementById("copy"),
  run: document.getElementById("run"),
  cancel: document.getElementById("cancel"),
  readTimeline: document.getElementById("readTimeline"),
  renderTimeline: document.getElementById("renderTimeline"),
  tabBasic: document.getElementById("tab-basic"),
  tabAdvanced: document.getElementById("tab-advanced"),
  panelBasic: document.getElementById("panel-basic"),
  panelAdvanced: document.getElementById("panel-advanced"),
};

let clipEntries = [];

const setStatus = (message) => {
  elements.status.textContent = message;
};

const currentArgs = () =>
  buildAutoEditorArgs({
    edit: elements.edit.value.trim(),
    margin: elements.margin.value.trim(),
    whenSilent: elements.whenSilent.value.trim(),
    whenNormal: elements.whenNormal.value.trim(),
    cutOut: elements.cutOut.value.trim(),
    addIn: elements.addIn.value.trim(),
    extraArgs: elements.args.value.trim(),
  });

const updatePreview = () => {
  const args = currentArgs();
  const preview = buildPreviewCommand({
    clipLabel: elements.clip.value,
    timelineName: elements.timeline.value || "Auto-Editor Timeline",
    args,
  });
  elements.preview.value = preview;
};

const refreshClips = async () => {
  setStatus("Loading clips from the Media Pool...");
  try {
    clipEntries = listMediaPoolClips();
    elements.clip.innerHTML = "";
    clipEntries.forEach((entry) => {
      const option = document.createElement("option");
      option.value = entry.label;
      option.textContent = entry.label;
      elements.clip.appendChild(option);
    });
    if (clipEntries.length === 0) {
      setStatus("No clips found in the Media Pool.");
    } else {
      setStatus(`Loaded ${clipEntries.length} clips.`);
    }
    updatePreview();
  } catch (error) {
    setStatus(error.message);
  }
};

const findClipByLabel = (label) => clipEntries.find((entry) => entry.label === label);

const handleRun = async () => {
  setStatus("Preparing Auto-Editor command...");
  const selected = findClipByLabel(elements.clip.value);
  if (!selected) {
    setStatus("Please select a clip from the list.");
    return;
  }

  try {
    const clipPath = getClipFilePath(selected.clip);
    const args = currentArgs();
    const timelineName = elements.timeline.value || "Auto-Editor Timeline";
    const outputPath = await getTempFilePath("fcpxml");
    const command = buildAutoEditorCommand({
      clipPath,
      timelineName,
      outputPath,
      args,
    });

    setStatus("Running auto-editor...");
    await executeCommand(command);
    importTimeline(outputPath);
    setStatus("Timeline imported successfully.");
  } catch (error) {
    setStatus(error.message || "Auto-Editor failed. Check the console for details.");
  }
};

const handleCopy = async () => {
  updatePreview();
  try {
    await navigator.clipboard.writeText(elements.preview.value);
    setStatus("Command preview copied to clipboard.");
  } catch (error) {
    setStatus("Unable to copy. Use the preview field to copy manually.");
  }
};

const handleReadTimeline = () => {
  try {
    const info = getCurrentTimelineInfo();
    setStatus(`Current timeline: ${info.name} (${info.frameRate} fps, ${info.resolution}).`);
  } catch (error) {
    setStatus(error.message);
  }
};

const handleRenderTimeline = () => {
  try {
    renderCurrentTimeline();
    setStatus("Render job added. Check the Deliver page for progress.");
  } catch (error) {
    setStatus(error.message);
  }
};

const handleTabSwitch = (target) => {
  const isBasic = target === "basic";
  elements.tabBasic.classList.toggle("tab--active", isBasic);
  elements.tabBasic.setAttribute("aria-selected", String(isBasic));
  elements.panelBasic.classList.toggle("tabpanel--active", isBasic);

  elements.tabAdvanced.classList.toggle("tab--active", !isBasic);
  elements.tabAdvanced.setAttribute("aria-selected", String(!isBasic));
  elements.panelAdvanced.classList.toggle("tabpanel--active", !isBasic);
};

const bindEvents = () => {
  elements.refresh.addEventListener("click", refreshClips);
  elements.copy.addEventListener("click", handleCopy);
  elements.run.addEventListener("click", handleRun);
  elements.cancel.addEventListener("click", () => closePlugin());
  elements.readTimeline.addEventListener("click", handleReadTimeline);
  elements.renderTimeline.addEventListener("click", handleRenderTimeline);

  [
    elements.clip,
    elements.timeline,
    elements.edit,
    elements.margin,
    elements.whenSilent,
    elements.whenNormal,
    elements.cutOut,
    elements.addIn,
    elements.args,
  ].forEach((input) => input.addEventListener("input", updatePreview));

  elements.tabBasic.addEventListener("click", () => handleTabSwitch("basic"));
  elements.tabAdvanced.addEventListener("click", () => handleTabSwitch("advanced"));
};

bindEvents();
refreshClips();
updatePreview();
