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
  binary: document.getElementById("binary"),
  editPreset: document.getElementById("editPreset"),
  editThreshold: document.getElementById("editThreshold"),
  editStream: document.getElementById("editStream"),
  motionWidth: document.getElementById("motionWidth"),
  applyPreset: document.getElementById("applyPreset"),
  edit: document.getElementById("edit"),
  margin: document.getElementById("margin"),
  whenSilent: document.getElementById("whenSilent"),
  whenNormal: document.getElementById("whenNormal"),
  cutOut: document.getElementById("cutOut"),
  addIn: document.getElementById("addIn"),
  exportOverride: document.getElementById("exportOverride"),
  outputOverride: document.getElementById("outputOverride"),
  cliOptions: document.getElementById("cli-options"),
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
let cliOptionFields = [];
let savedClipLabel = null;

const storageKey = "autoEditorResolvePlugin.settings.v1";

const cliOptionSections = [
  {
    title: "Speed & timing",
    open: true,
    options: [
      { id: "silentSpeed", label: "Silent speed (--silent-speed)", flag: "--silent-speed", type: "value", placeholder: "8" },
      { id: "videoSpeed", label: "Video speed (--video-speed)", flag: "--video-speed", type: "value", placeholder: "1" },
      { id: "setSpeed", label: "Set speed for range (--set-speed-for-range)", flag: "--set-speed-for-range", type: "value", placeholder: "2,0,30" },
    ],
  },
  {
    title: "Timeline & layout",
    options: [
      { id: "frameRate", label: "Frame rate (--frame-rate)", flag: "--frame-rate", type: "value", placeholder: "24" },
      { id: "sampleRate", label: "Sample rate (--sample-rate)", flag: "--sample-rate", type: "value", placeholder: "48000" },
      { id: "resolution", label: "Resolution (--resolution)", flag: "--resolution", type: "value", placeholder: "1920,1080" },
      { id: "background", label: "Background (--background)", flag: "--background", type: "value", placeholder: "#000000" },
      { id: "scale", label: "Scale (--scale)", flag: "--scale", type: "value", placeholder: "0.5" },
    ],
  },
  {
    title: "Rendering & codecs",
    options: [
      { id: "videoCodec", label: "Video codec (--video-codec)", flag: "--video-codec", type: "value", placeholder: "h264" },
      { id: "videoBitrate", label: "Video bitrate (--video-bitrate)", flag: "--video-bitrate", type: "value", placeholder: "5M" },
      { id: "videoProfile", label: "Video profile (-vprofile)", flag: "-vprofile", type: "value", placeholder: "high" },
      { id: "noSeek", label: "No seek (--no-seek)", flag: "--no-seek", type: "boolean" },
      { id: "audioCodec", label: "Audio codec (--audio-codec)", flag: "--audio-codec", type: "value", placeholder: "aac" },
      { id: "audioLayout", label: "Audio layout (--audio-layout)", flag: "--audio-layout", type: "value", placeholder: "stereo" },
      { id: "audioBitrate", label: "Audio bitrate (--audio-bitrate)", flag: "--audio-bitrate", type: "value", placeholder: "192k" },
      { id: "audioNormalize", label: "Audio normalize (--audio-normalize)", flag: "--audio-normalize", type: "value", placeholder: "ebu:i=-16" },
      { id: "mixAudio", label: "Mix audio streams (--mix-audio-streams)", flag: "--mix-audio-streams", type: "boolean" },
      { id: "keepTracksSeparate", label: "Keep tracks separate (--keep-tracks-separate)", flag: "--keep-tracks-separate", type: "boolean" },
    ],
  },
  {
    title: "Container & files",
    options: [
      { id: "disableSubtitles", label: "Disable subtitles (-sn)", flag: "-sn", type: "boolean" },
      { id: "disableData", label: "Disable data streams (-dn)", flag: "-dn", type: "boolean" },
      { id: "faststart", label: "Faststart (--faststart)", flag: "--faststart", type: "boolean" },
      { id: "noFaststart", label: "No faststart (--no-faststart)", flag: "--no-faststart", type: "boolean" },
      { id: "fragmented", label: "Fragmented (--fragmented)", flag: "--fragmented", type: "boolean" },
      { id: "noFragmented", label: "No fragmented (--no-fragmented)", flag: "--no-fragmented", type: "boolean" },
      { id: "noOpen", label: "No open (--no-open)", flag: "--no-open", type: "boolean" },
      { id: "tempDir", label: "Temp dir (--temp-dir)", flag: "--temp-dir", type: "value", placeholder: "C:\\temp\\auto-editor" },
    ],
  },
  {
    title: "Download (yt-dlp)",
    options: [
      { id: "ytDlpLocation", label: "yt-dlp location (--yt-dlp-location)", flag: "--yt-dlp-location", type: "value", placeholder: "C:\\tools\\yt-dlp.exe" },
      { id: "downloadFormat", label: "Download format (--download-format)", flag: "--download-format", type: "value", placeholder: "bestvideo+bestaudio" },
      { id: "outputFormat", label: "Output format (--output-format)", flag: "--output-format", type: "value", placeholder: "%(title)s.%(ext)s" },
      { id: "ytDlpExtras", label: "yt-dlp extras (--yt-dlp-extras)", flag: "--yt-dlp-extras", type: "value", placeholder: "--cookies cookies.txt" },
    ],
  },
  {
    title: "Display & diagnostics",
    options: [
      {
        id: "progress",
        label: "Progress (--progress)",
        flag: "--progress",
        type: "select",
        placeholder: "default",
        choices: ["modern", "classic", "ascii", "machine", "none"],
      },
      { id: "debug", label: "Debug (--debug)", flag: "--debug", type: "boolean" },
      { id: "quiet", label: "Quiet (--quiet)", flag: "--quiet", type: "boolean" },
      { id: "preview", label: "Preview (--preview)", flag: "--preview", type: "boolean" },
    ],
  },
];

const setStatus = (message, tone = "info") => {
  elements.status.textContent = message;
  elements.status.dataset.tone = tone;
};

const setBusy = (busy) => {
  [
    elements.refresh,
    elements.copy,
    elements.run,
    elements.readTimeline,
    elements.renderTimeline,
  ].forEach((button) => {
    if (button) {
      button.disabled = busy;
    }
  });
};

const renderCliOptions = () => {
  elements.cliOptions.innerHTML = "";
  cliOptionFields = [];

  cliOptionSections.forEach((section) => {
    const sectionWrapper = document.createElement("details");
    sectionWrapper.className = "option-section";
    if (section.open) {
      sectionWrapper.open = true;
    }

    const summary = document.createElement("summary");
    const heading = document.createElement("h3");
    heading.textContent = section.title;
    heading.className = "option-section__title";
    summary.appendChild(heading);
    sectionWrapper.appendChild(summary);

    const grid = document.createElement("div");
    grid.className = "option-grid";

    section.options.forEach((option) => {
      const label = document.createElement("label");
      label.className = option.type === "boolean" ? "field field--checkbox" : "field";

      const span = document.createElement("span");
      span.textContent = option.label;
      label.appendChild(span);

      let input;
      if (option.type === "select") {
        input = document.createElement("select");
        if (option.placeholder) {
          const placeholder = document.createElement("option");
          placeholder.value = "";
          placeholder.textContent = option.placeholder;
          input.appendChild(placeholder);
        }
        option.choices.forEach((choice) => {
          const opt = document.createElement("option");
          opt.value = choice;
          opt.textContent = choice;
          input.appendChild(opt);
        });
      } else {
        input = document.createElement("input");
        input.type = option.type === "boolean" ? "checkbox" : "text";
        if (option.placeholder) {
          input.placeholder = option.placeholder;
        }
      }

      input.id = `cli-${option.id}`;
      label.appendChild(input);

      grid.appendChild(label);
      cliOptionFields.push({ option, input });
    });

    sectionWrapper.appendChild(grid);
    elements.cliOptions.appendChild(sectionWrapper);
  });
};

const collectAdvancedOptions = () =>
  cliOptionFields
    .map(({ option, input }) => {
      if (option.type === "boolean") {
        return input.checked ? { flag: option.flag, hasValue: false } : null;
      }
      const value = input.value.trim();
      return value ? { flag: option.flag, value, hasValue: true } : null;
    })
    .filter(Boolean);

const currentArgs = () =>
  buildAutoEditorArgs({
    edit: elements.edit.value.trim(),
    margin: elements.margin.value.trim(),
    whenSilent: elements.whenSilent.value.trim(),
    whenNormal: elements.whenNormal.value.trim(),
    cutOut: elements.cutOut.value.trim(),
    addIn: elements.addIn.value.trim(),
    advancedOptions: collectAdvancedOptions(),
    extraArgs: elements.args.value.trim(),
  });

const updatePreview = () => {
  const args = currentArgs();
  const preview = buildPreviewCommand({
    binary: elements.binary.value.trim(),
    clipLabel: elements.clip.value,
    timelineName: elements.timeline.value || "Auto-Editor Timeline",
    exportOverride: elements.exportOverride.value.trim(),
    outputOverride: elements.outputOverride.value.trim(),
    args,
  });
  elements.preview.value = preview;
};

const refreshClips = async () => {
  setBusy(true);
  setStatus("Loading clips from the Media Pool...", "info");
  try {
    clipEntries = listMediaPoolClips();
    elements.clip.innerHTML = "";
    clipEntries.forEach((entry) => {
      const option = document.createElement("option");
      option.value = entry.label;
      option.textContent = entry.label;
      elements.clip.appendChild(option);
    });
    if (savedClipLabel && clipEntries.some((entry) => entry.label === savedClipLabel)) {
      elements.clip.value = savedClipLabel;
    }
    if (clipEntries.length === 0) {
      setStatus("No clips found in the Media Pool.", "error");
    } else {
      setStatus(`Loaded ${clipEntries.length} clips.`, "success");
    }
    updatePreview();
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setBusy(false);
  }
};

const findClipByLabel = (label) => clipEntries.find((entry) => entry.label === label);

const buildEditPresetExpression = () => {
  const preset = elements.editPreset.value;
  const threshold = elements.editThreshold.value.trim();
  const stream = elements.editStream.value.trim();
  const motionWidth = elements.motionWidth.value.trim();

  if (preset === "audio") {
    const thresholdValue = threshold || "0.04";
    const parts = [`threshold=${thresholdValue}`];
    if (stream) {
      parts.push(`stream=${stream}`);
    }
    return `audio:${parts.join(",")}`;
  }

  if (preset === "motion") {
    const thresholdValue = threshold || "0.02";
    const parts = [`threshold=${thresholdValue}`];
    if (motionWidth) {
      parts.push(`width=${motionWidth}`);
    }
    return `motion:${parts.join(",")}`;
  }

  if (preset === "none") {
    return "none";
  }

  if (preset === "all") {
    return "all/e";
  }

  return "";
};

const applyPresetToEdit = () => {
  const expression = buildEditPresetExpression();
  if (!expression) {
    setStatus("Edit preset is set to custom. Type an expression manually.", "info");
    return;
  }
  elements.edit.value = expression;
  updatePreview();
  saveState();
  setStatus("Edit expression updated from preset.", "success");
};

const handleRun = async () => {
  setStatus("Preparing Auto-Editor command...", "info");
  const selected = findClipByLabel(elements.clip.value);
  if (!selected) {
    setStatus("Please select a clip from the list.", "error");
    return;
  }

  setBusy(true);
  try {
    const clipPath = getClipFilePath(selected.clip);
    const args = currentArgs();
    const timelineName = elements.timeline.value || "Auto-Editor Timeline";
    const outputOverride = elements.outputOverride.value.trim();
    const outputPath = outputOverride || (await getTempFilePath("fcpxml"));
    const command = buildAutoEditorCommand({
      binary: elements.binary.value.trim(),
      clipPath,
      timelineName,
      outputPath,
      exportOverride: elements.exportOverride.value.trim(),
      args,
    });

    setStatus("Running auto-editor...", "info");
    await executeCommand(command);
    importTimeline(outputPath);
    setStatus("Timeline imported successfully.", "success");
  } catch (error) {
    setStatus(error.message || "Auto-Editor failed. Check the console for details.", "error");
  } finally {
    setBusy(false);
  }
};

const handleCopy = async () => {
  updatePreview();
  try {
    await navigator.clipboard.writeText(elements.preview.value);
    setStatus("Command preview copied to clipboard.", "success");
  } catch (error) {
    setStatus("Unable to copy. Use the preview field to copy manually.", "error");
  }
};

const handleReadTimeline = () => {
  try {
    const info = getCurrentTimelineInfo();
    setStatus(`Current timeline: ${info.name} (${info.frameRate} fps, ${info.resolution}).`, "info");
  } catch (error) {
    setStatus(error.message, "error");
  }
};

const handleRenderTimeline = () => {
  try {
    renderCurrentTimeline();
    setStatus("Render job added. Check the Deliver page for progress.", "success");
  } catch (error) {
    setStatus(error.message, "error");
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

const getFormState = () => ({
  clipLabel: elements.clip.value,
  timeline: elements.timeline.value,
  binary: elements.binary.value,
  editPreset: elements.editPreset.value,
  editThreshold: elements.editThreshold.value,
  editStream: elements.editStream.value,
  motionWidth: elements.motionWidth.value,
  edit: elements.edit.value,
  margin: elements.margin.value,
  whenSilent: elements.whenSilent.value,
  whenNormal: elements.whenNormal.value,
  cutOut: elements.cutOut.value,
  addIn: elements.addIn.value,
  exportOverride: elements.exportOverride.value,
  outputOverride: elements.outputOverride.value,
  args: elements.args.value,
  cliOptions: Object.fromEntries(
    cliOptionFields.map(({ option, input }) => [
      option.id,
      option.type === "boolean" ? input.checked : input.value,
    ]),
  ),
});

const applyFormState = (state) => {
  if (!state) {
    return;
  }
  elements.timeline.value = state.timeline || elements.timeline.value;
  elements.binary.value = state.binary || "";
  elements.editPreset.value = state.editPreset || "custom";
  elements.editThreshold.value = state.editThreshold || "";
  elements.editStream.value = state.editStream || "";
  elements.motionWidth.value = state.motionWidth || "";
  elements.edit.value = state.edit || "";
  elements.margin.value = state.margin || "";
  elements.whenSilent.value = state.whenSilent || "";
  elements.whenNormal.value = state.whenNormal || "";
  elements.cutOut.value = state.cutOut || "";
  elements.addIn.value = state.addIn || "";
  elements.exportOverride.value = state.exportOverride || "";
  elements.outputOverride.value = state.outputOverride || "";
  elements.args.value = state.args || "";

  if (state.cliOptions) {
    cliOptionFields.forEach(({ option, input }) => {
      const value = state.cliOptions[option.id];
      if (option.type === "boolean") {
        input.checked = Boolean(value);
      } else if (value) {
        input.value = value;
      }
    });
  }

  savedClipLabel = state.clipLabel || null;
};

const saveState = () => {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(getFormState()));
  } catch (error) {
    // Ignore storage errors in restricted environments.
  }
};

const loadState = () => {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return;
    }
    applyFormState(JSON.parse(raw));
  } catch (error) {
    // Ignore malformed state.
  }
};

const bindEvents = () => {
  elements.refresh.addEventListener("click", refreshClips);
  elements.copy.addEventListener("click", handleCopy);
  elements.run.addEventListener("click", handleRun);
  elements.cancel.addEventListener("click", () => closePlugin());
  elements.readTimeline.addEventListener("click", handleReadTimeline);
  elements.renderTimeline.addEventListener("click", handleRenderTimeline);
  elements.applyPreset.addEventListener("click", applyPresetToEdit);

  const inputs = [
    elements.clip,
    elements.timeline,
    elements.binary,
    elements.editPreset,
    elements.editThreshold,
    elements.editStream,
    elements.motionWidth,
    elements.edit,
    elements.margin,
    elements.whenSilent,
    elements.whenNormal,
    elements.cutOut,
    elements.addIn,
    elements.exportOverride,
    elements.outputOverride,
    elements.args,
    ...cliOptionFields.map(({ input }) => input),
  ];

  const handleInputChange = () => {
    updatePreview();
    saveState();
  };

  inputs.forEach((input) => {
    input.addEventListener("input", handleInputChange);
    input.addEventListener("change", handleInputChange);
  });

  elements.tabBasic.addEventListener("click", () => handleTabSwitch("basic"));
  elements.tabAdvanced.addEventListener("click", () => handleTabSwitch("advanced"));
};

renderCliOptions();
loadState();
bindEvents();
refreshClips();
updatePreview();
