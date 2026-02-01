
import {
  listMediaPoolClips,
  getClipFilePath,
  importTimeline,
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
  runMode: document.getElementById("runMode"),
  exportTarget: document.getElementById("exportTarget"),
  exportAttrs: document.getElementById("exportAttrs"),
  exportCustom: document.getElementById("exportCustom"),
  exportCustomField: document.getElementById("exportCustomField"),
  outputOverride: document.getElementById("outputOverride"),
  editMode: document.getElementById("editMode"),
  editSingle: document.getElementById("editSingle"),
  editCombine: document.getElementById("editCombine"),
  editManual: document.getElementById("editManual"),
  singleRuleContainer: document.getElementById("singleRuleContainer"),
  combineOperator: document.getElementById("combineOperator"),
  ruleList: document.getElementById("ruleList"),
  addRule: document.getElementById("addRule"),
  editManualExpression: document.getElementById("editManualExpression"),
  margin: document.getElementById("margin"),
  silentCut: document.getElementById("silentCut"),
  silentSpeedEnabled: document.getElementById("silentSpeedEnabled"),
  silentSpeed: document.getElementById("silentSpeed"),
  silentVarispeedEnabled: document.getElementById("silentVarispeedEnabled"),
  silentVarispeed: document.getElementById("silentVarispeed"),
  silentVolumeEnabled: document.getElementById("silentVolumeEnabled"),
  silentVolume: document.getElementById("silentVolume"),
  normalCut: document.getElementById("normalCut"),
  normalSpeedEnabled: document.getElementById("normalSpeedEnabled"),
  normalSpeed: document.getElementById("normalSpeed"),
  normalVarispeedEnabled: document.getElementById("normalVarispeedEnabled"),
  normalVarispeed: document.getElementById("normalVarispeed"),
  normalVolumeEnabled: document.getElementById("normalVolumeEnabled"),
  normalVolume: document.getElementById("normalVolume"),
  cutRanges: document.getElementById("cutRanges"),
  addRanges: document.getElementById("addRanges"),
  speedRanges: document.getElementById("speedRanges"),
  addCutRange: document.getElementById("addCutRange"),
  addAddRange: document.getElementById("addAddRange"),
  addSpeedRange: document.getElementById("addSpeedRange"),
  frameRate: document.getElementById("frameRate"),
  sampleRate: document.getElementById("sampleRate"),
  resolutionWidth: document.getElementById("resolutionWidth"),
  resolutionHeight: document.getElementById("resolutionHeight"),
  backgroundColor: document.getElementById("backgroundColor"),
  scale: document.getElementById("scale"),
  videoCodec: document.getElementById("videoCodec"),
  videoBitrate: document.getElementById("videoBitrate"),
  videoProfile: document.getElementById("videoProfile"),
  audioCodec: document.getElementById("audioCodec"),
  audioLayout: document.getElementById("audioLayout"),
  audioBitrate: document.getElementById("audioBitrate"),
  audioMixMode: document.getElementById("audioMixMode"),
  audioNormalizeMode: document.getElementById("audioNormalizeMode"),
  audioNormalizePanel: document.getElementById("audioNormalizePanel"),
  ebuI: document.getElementById("ebuI"),
  ebuLra: document.getElementById("ebuLra"),
  ebuTp: document.getElementById("ebuTp"),
  ebuGain: document.getElementById("ebuGain"),
  peakPanel: document.getElementById("peakPanel"),
  peakTarget: document.getElementById("peakTarget"),
  disableVideo: document.getElementById("disableVideo"),
  disableAudio: document.getElementById("disableAudio"),
  disableSubtitles: document.getElementById("disableSubtitles"),
  disableData: document.getElementById("disableData"),
  faststartMode: document.getElementById("faststartMode"),
  fragmentedMode: document.getElementById("fragmentedMode"),
  noSeek: document.getElementById("noSeek"),
  noOpen: document.getElementById("noOpen"),
  ytDlpLocation: document.getElementById("ytDlpLocation"),
  downloadFormat: document.getElementById("downloadFormat"),
  outputFormat: document.getElementById("outputFormat"),
  ytDlpExtras: document.getElementById("ytDlpExtras"),
  tempDir: document.getElementById("tempDir"),
  progressStyle: document.getElementById("progressStyle"),
  debug: document.getElementById("debug"),
  quiet: document.getElementById("quiet"),
  previewStats: document.getElementById("previewStats"),
  showHelp: document.getElementById("showHelp"),
  showVersion: document.getElementById("showVersion"),
  utilityCommand: document.getElementById("utilityCommand"),
  utilityInputMode: document.getElementById("utilityInputMode"),
  utilityInputField: document.getElementById("utilityInputField"),
  utilityInputList: document.getElementById("utilityInputList"),
  infoJson: document.getElementById("infoJson"),
  levelsMethod: document.getElementById("levelsMethod"),
  levelsStream: document.getElementById("levelsStream"),
  levelsPattern: document.getElementById("levelsPattern"),
  levelsIgnoreCase: document.getElementById("levelsIgnoreCase"),
  levelsWidth: document.getElementById("levelsWidth"),
  levelsBlur: document.getElementById("levelsBlur"),
  levelsTimebase: document.getElementById("levelsTimebase"),
  levelsNoCache: document.getElementById("levelsNoCache"),
  whisperModel: document.getElementById("whisperModel"),
  whisperFormat: document.getElementById("whisperFormat"),
  whisperOutput: document.getElementById("whisperOutput"),
  whisperQueue: document.getElementById("whisperQueue"),
  whisperVad: document.getElementById("whisperVad"),
  whisperSplit: document.getElementById("whisperSplit"),
  whisperDebug: document.getElementById("whisperDebug"),
  cacheAction: document.getElementById("cacheAction"),
  preview: document.getElementById("preview"),
  status: document.getElementById("status"),
  refresh: document.getElementById("refresh"),
  copy: document.getElementById("copy"),
  run: document.getElementById("run"),
  cancel: document.getElementById("cancel"),
  tabEdit: document.getElementById("tab-edit"),
  tabAdvanced: document.getElementById("tab-advanced"),
  tabUtilities: document.getElementById("tab-utilities"),
  panelEdit: document.getElementById("panel-edit"),
  panelAdvanced: document.getElementById("panel-advanced"),
  panelUtilities: document.getElementById("panel-utilities"),
  ruleTemplate: document.getElementById("ruleTemplate"),
  rangeTemplate: document.getElementById("rangeTemplate"),
  speedRangeTemplate: document.getElementById("speedRangeTemplate"),
};

const storageKey = "autoEditorResolvePlugin.settings.v3";
const segmentedControls = new Map();

let clipEntries = [];
let activeTab = "edit";
let savedClipLabel = null;
let savedExportTarget = "resolve";

const quote = (value) => `"${String(value).replace(/"/g, '\\"')}"`;
const maybeQuote = (value) => {
  const trimmed = String(value);
  if (/^".*"$/.test(trimmed)) {
    return trimmed;
  }
  return /\s/.test(trimmed) ? quote(trimmed) : trimmed;
};

const normalizeBinary = (binary) => {
  const trimmed = String(binary || "").trim();
  if (!trimmed) {
    return "auto-editor";
  }
  return /\s/.test(trimmed) ? quote(trimmed) : trimmed;
};

const setStatus = (message, tone = "info") => {
  elements.status.textContent = message;
  elements.status.dataset.tone = tone;
};

const setBusy = (busy) => {
  [elements.refresh, elements.copy, elements.run, elements.showHelp, elements.showVersion].forEach((button) => {
    if (button) {
      button.disabled = busy;
    }
  });
};

const initSegmentedControl = (group) => {
  const targetId = group.dataset.target;
  if (!targetId) {
    return;
  }
  const target = document.getElementById(targetId);
  if (!target) {
    return;
  }
  const buttons = Array.from(group.querySelectorAll("button"));
  const setValue = (value, silent = false) => {
    target.value = value;
    buttons.forEach((button) => {
      const active = button.dataset.value === value;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
    if (!silent) {
      target.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };
  buttons.forEach((button) => {
    button.addEventListener("click", () => setValue(button.dataset.value));
  });
  const initial = target.value || buttons[0]?.dataset.value || "";
  if (initial) {
    setValue(initial, true);
  }
  segmentedControls.set(targetId, setValue);
};

const initSegmentedControls = () => {
  document.querySelectorAll(".segmented").forEach((group) => {
    if (group.dataset.target) {
      initSegmentedControl(group);
    }
  });
};

const setSegmentedValue = (targetId, value, silent = false) => {
  const setter = segmentedControls.get(targetId);
  if (setter) {
    setter(value, silent);
    return;
  }
  const target = document.getElementById(targetId);
  if (target) {
    target.value = value;
  }
};
const updateExportFields = () => {
  const isResolveMode = elements.runMode.value === "resolve";
  if (isResolveMode) {
    savedExportTarget = elements.exportTarget.value || savedExportTarget;
    elements.exportTarget.value = "resolve";
  } else if (savedExportTarget) {
    elements.exportTarget.value = savedExportTarget;
  }
  elements.exportTarget.disabled = isResolveMode;
  elements.exportAttrs.disabled = isResolveMode;

  const showCustom = !isResolveMode && elements.exportTarget.value === "custom";
  elements.exportCustomField.classList.toggle("is-hidden", !showCustom);
  elements.exportCustom.disabled = !showCustom;

  if (!isResolveMode) {
    savedExportTarget = elements.exportTarget.value;
  }
};

const updateEditMode = () => {
  const mode = elements.editMode.value;
  elements.editSingle.classList.toggle("is-hidden", mode !== "single");
  elements.editCombine.classList.toggle("is-hidden", mode !== "combine");
  elements.editManual.classList.toggle("is-hidden", mode !== "manual");
  ensureRuleCards();
};

const updateAudioNormalizePanel = () => {
  const mode = elements.audioNormalizeMode.value;
  const showPanel = mode !== "off";
  elements.audioNormalizePanel.classList.toggle("is-hidden", !showPanel);
  elements.peakPanel.classList.toggle("is-hidden", mode !== "peak");
};

const updateUtilityPanels = () => {
  const command = elements.utilityCommand.value;
  document.querySelectorAll(".utility-panel").forEach((panel) => {
    panel.classList.toggle("is-hidden", panel.dataset.utility !== command);
  });
};

const updateUtilityInputMode = () => {
  const mode = elements.utilityInputMode.value;
  elements.utilityInputField.classList.toggle("is-hidden", mode !== "manual");
};

const updateRunLabel = () => {
  if (activeTab === "utilities") {
    elements.run.textContent = "Run Utility";
    return;
  }
  elements.run.textContent =
    elements.runMode.value === "resolve" ? "Create Timeline" : "Run Export";
};

const setActiveTab = (target) => {
  activeTab = target;
  const isEdit = target === "edit";
  const isAdvanced = target === "advanced";
  const isUtilities = target === "utilities";

  elements.tabEdit.classList.toggle("tab--active", isEdit);
  elements.tabEdit.setAttribute("aria-selected", String(isEdit));
  elements.panelEdit.classList.toggle("tabpanel--active", isEdit);

  elements.tabAdvanced.classList.toggle("tab--active", isAdvanced);
  elements.tabAdvanced.setAttribute("aria-selected", String(isAdvanced));
  elements.panelAdvanced.classList.toggle("tabpanel--active", isAdvanced);

  elements.tabUtilities.classList.toggle("tab--active", isUtilities);
  elements.tabUtilities.setAttribute("aria-selected", String(isUtilities));
  elements.panelUtilities.classList.toggle("tabpanel--active", isUtilities);

  updateRunLabel();
  updatePreview();
  saveState();
};

const setRuleMethod = (card, method, silent = false) => {
  const group = card.querySelector(".segmented[data-role='method']");
  if (!group) {
    return;
  }
  card.dataset.method = method;
  group.querySelectorAll("button").forEach((button) => {
    const active = button.dataset.value === method;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
  card.querySelectorAll(".rule-panel").forEach((panel) => {
    panel.classList.toggle("is-hidden", panel.dataset.method !== method);
  });
  if (!silent) {
    handleInputChange();
  }
};

const applyRuleFields = (card, fields) => {
  if (!fields) {
    return;
  }
  card.querySelectorAll("[data-field]").forEach((input) => {
    const key = input.dataset.field;
    if (!Object.prototype.hasOwnProperty.call(fields, key)) {
      return;
    }
    if (input.type === "checkbox") {
      input.checked = Boolean(fields[key]);
    } else {
      input.value = fields[key];
    }
  });
};

const attachRuleCardEvents = (card, removable) => {
  const group = card.querySelector(".segmented[data-role='method']");
  if (group) {
    group.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => setRuleMethod(card, button.dataset.value));
    });
  }

  card.querySelectorAll("input, select, textarea").forEach((input) => {
    input.addEventListener("input", handleInputChange);
    input.addEventListener("change", handleInputChange);
  });

  const removeButton = card.querySelector("[data-action='remove']");
  if (removeButton) {
    if (!removable) {
      removeButton.classList.add("is-hidden");
      removeButton.disabled = true;
    } else {
      removeButton.addEventListener("click", () => {
        card.remove();
        handleInputChange();
      });
    }
  }
};

const createRuleCard = (rule = {}, { removable = true } = {}) => {
  const card = elements.ruleTemplate.content.firstElementChild.cloneNode(true);
  const fields = rule.fields || {};
  applyRuleFields(card, fields);
  const invertInput = card.querySelector("[data-field='invert']");
  if (invertInput && typeof rule.invert === "boolean") {
    invertInput.checked = rule.invert;
  }
  const method = rule.method || card.dataset.method || "audio";
  setRuleMethod(card, method, true);
  attachRuleCardEvents(card, removable);
  return card;
};

const setSingleRule = (rule) => {
  elements.singleRuleContainer.innerHTML = "";
  elements.singleRuleContainer.appendChild(
    createRuleCard(rule || { method: "audio" }, { removable: false }),
  );
};

const setCombineRules = (rules) => {
  elements.ruleList.innerHTML = "";
  if (rules && rules.length) {
    rules.forEach((rule) => {
      elements.ruleList.appendChild(createRuleCard(rule, { removable: true }));
    });
    return;
  }
  elements.ruleList.appendChild(createRuleCard({ method: "audio" }, { removable: true }));
};

const ensureRuleCards = () => {
  if (!elements.singleRuleContainer.querySelector(".rule-card")) {
    setSingleRule();
  }
  if (!elements.ruleList.querySelector(".rule-card")) {
    setCombineRules();
  }
};

const serializeRule = (card) => {
  const fields = {};
  card.querySelectorAll("[data-field]").forEach((input) => {
    if (input.type === "checkbox") {
      fields[input.dataset.field] = input.checked;
    } else {
      fields[input.dataset.field] = input.value;
    }
  });
  const invert = Boolean(fields.invert);
  delete fields.invert;
  return {
    method: card.dataset.method || "audio",
    invert,
    fields,
  };
};

const formatExprValue = (value) => {
  const text = String(value);
  if (/[\s,"]/.test(text)) {
    return quote(text);
  }
  return text;
};

const formatThreshold = (value, unit) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return "";
  }
  if (unit === "percent") {
    return `${trimmed}%`;
  }
  if (unit === "db") {
    return `${trimmed}dB`;
  }
  return trimmed;
};

const addParam = (params, key, value) => {
  if (typeof value === "boolean") {
    if (value) {
      params.push(`${key}=true`);
    }
    return;
  }
  if (value === "" || value === null || value === undefined) {
    return;
  }
  params.push(`${key}=${value}`);
};

const joinParams = (method, params) => {
  if (!params.length) {
    return method;
  }
  return `${method}:${params.join(",")}`;
};

const buildRuleExpression = (rule) => {
  if (!rule) {
    return "";
  }
  const method = rule.method || "audio";
  if (method === "none") {
    return "none";
  }
  if (method === "all") {
    return "all/e";
  }

  const fields = rule.fields || {};
  const params = [];

  if (method === "audio") {
    const threshold = formatThreshold(fields.audioThreshold, fields.audioThresholdUnit || "ratio");
    if (threshold) {
      addParam(params, "threshold", threshold);
    }
    if (fields.audioStreamMode === "index" && fields.audioStreamIndex !== "") {
      addParam(params, "stream", fields.audioStreamIndex);
    }
    if (fields.audioMinClip !== "") {
      addParam(params, "minclip", fields.audioMinClip);
    }
    if (fields.audioMinCut !== "") {
      addParam(params, "mincut", fields.audioMinCut);
    }
  }

  if (method === "motion") {
    const threshold = formatThreshold(fields.motionThreshold, fields.motionThresholdUnit || "ratio");
    if (threshold) {
      addParam(params, "threshold", threshold);
    }
    if (fields.motionStream !== "") {
      addParam(params, "stream", fields.motionStream);
    }
    if (fields.motionWidth !== "") {
      addParam(params, "width", fields.motionWidth);
    }
    if (fields.motionBlur !== "") {
      addParam(params, "blur", fields.motionBlur);
    }
  }

  if (method === "subtitle") {
    if (fields.subtitlePattern) {
      addParam(params, "pattern", formatExprValue(fields.subtitlePattern));
    }
    if (fields.subtitleStream !== "") {
      addParam(params, "stream", fields.subtitleStream);
    }
    addParam(params, "ignorecase", fields.subtitleIgnoreCase);
  }

  if (method === "word") {
    if (fields.wordValue) {
      addParam(params, "word", formatExprValue(fields.wordValue));
    }
    if (fields.wordStream !== "") {
      addParam(params, "stream", fields.wordStream);
    }
    addParam(params, "ignorecase", fields.wordIgnoreCase);
  }

  if (method === "regex") {
    if (fields.regexPattern) {
      addParam(params, "pattern", formatExprValue(fields.regexPattern));
    }
    if (fields.regexStream !== "") {
      addParam(params, "stream", fields.regexStream);
    }
    addParam(params, "ignorecase", fields.regexIgnoreCase);
  }

  const expression = joinParams(method, params);
  if (rule.invert) {
    return `not (${expression})`;
  }
  return expression;
};

const buildEditExpression = () => {
  const mode = elements.editMode.value;
  if (mode === "manual") {
    return elements.editManualExpression.value.trim();
  }
  if (mode === "combine") {
    const operator = elements.combineOperator.value || "or";
    const expressions = Array.from(elements.ruleList.querySelectorAll(".rule-card"))
      .map((card) => buildRuleExpression(serializeRule(card)))
      .filter(Boolean);
    if (!expressions.length) {
      return "";
    }
    if (expressions.length === 1) {
      return expressions[0];
    }
    return expressions.join(` ${operator} `);
  }
  const singleRule = elements.singleRuleContainer.querySelector(".rule-card");
  if (!singleRule) {
    return "";
  }
  return buildRuleExpression(serializeRule(singleRule));
};

const createRangeRow = (template, data = {}) => {
  const row = template.content.firstElementChild.cloneNode(true);
  row.querySelectorAll("[data-field]").forEach((input) => {
    const key = input.dataset.field;
    if (!Object.prototype.hasOwnProperty.call(data, key)) {
      return;
    }
    input.value = data[key];
  });
  row.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", handleInputChange);
    input.addEventListener("change", handleInputChange);
  });
  const removeButton = row.querySelector("[data-action='remove']");
  if (removeButton) {
    removeButton.addEventListener("click", () => {
      row.remove();
      handleInputChange();
    });
  }
  return row;
};

const collectRanges = (container, includeSpeed = false) =>
  Array.from(container.querySelectorAll(".range-row"))
    .map((row) => {
      const start = row.querySelector("[data-field='start']")?.value.trim() || "";
      const end = row.querySelector("[data-field='end']")?.value.trim() || "";
      const speed = includeSpeed
        ? row.querySelector("[data-field='speed']")?.value.trim() || ""
        : "";
      if (includeSpeed) {
        if (!speed || !start || !end) {
          return null;
        }
        return { speed, start, end };
      }
      if (!start || !end) {
        return null;
      }
      return { start, end };
    })
    .filter(Boolean);

const formatRangeList = (ranges) =>
  ranges.map((range) => `${range.start},${range.end}`).join(";");

const buildActionMode = (cutChecked, speedEnabled, varispeedEnabled, volumeEnabled) => {
  if (speedEnabled) {
    return "speed";
  }
  if (varispeedEnabled) {
    return "varispeed";
  }
  if (volumeEnabled) {
    return "volume";
  }
  return cutChecked ? "cut" : "keep";
};

const collectAdvancedOptions = () => {
  const options = [];
  const pushValue = (flag, value, { quoteValue = false } = {}) => {
    const trimmed = String(value || "").trim();
    if (!trimmed) {
      return;
    }
    options.push({
      flag,
      value: quoteValue ? maybeQuote(trimmed) : trimmed,
      hasValue: true,
    });
  };
  const pushFlag = (flag, enabled) => {
    if (enabled) {
      options.push({ flag, hasValue: false });
    }
  };

  const frameRate = elements.frameRate.value.trim();
  const sampleRate = elements.sampleRate.value.trim();
  const width = elements.resolutionWidth.value.trim();
  const height = elements.resolutionHeight.value.trim();
  const scale = elements.scale.value.trim();

  if (frameRate) {
    pushValue("--frame-rate", frameRate);
  }
  if (sampleRate) {
    pushValue("--sample-rate", sampleRate);
  }
  if (width && height) {
    pushValue("--resolution", `${width},${height}`);
  }
  if (elements.backgroundColor.value && elements.backgroundColor.value !== "#000000") {
    pushValue("--background", elements.backgroundColor.value);
  }
  if (scale) {
    pushValue("--scale", scale);
  }

  pushValue("--video-codec", elements.videoCodec.value.trim());
  pushValue("--video-bitrate", elements.videoBitrate.value.trim());
  pushValue("-vprofile", elements.videoProfile.value.trim());
  pushValue("--audio-codec", elements.audioCodec.value.trim());
  pushValue("--audio-layout", elements.audioLayout.value.trim());
  pushValue("--audio-bitrate", elements.audioBitrate.value.trim());

  if (elements.audioMixMode.value === "mix") {
    pushFlag("--mix-audio-streams", true);
  }

  const normalizeMode = elements.audioNormalizeMode.value;
  if (normalizeMode === "ebu") {
    const parts = [];
    if (elements.ebuI.value.trim()) {
      parts.push(`i=${elements.ebuI.value.trim()}`);
    }
    if (elements.ebuLra.value.trim()) {
      parts.push(`lra=${elements.ebuLra.value.trim()}`);
    }
    if (elements.ebuTp.value.trim()) {
      parts.push(`tp=${elements.ebuTp.value.trim()}`);
    }
    if (elements.ebuGain.value.trim()) {
      parts.push(`gain=${elements.ebuGain.value.trim()}`);
    }
    const value = parts.length ? `ebu:${parts.join(",")}` : "ebu";
    pushValue("--audio-normalize", value);
  }
  if (normalizeMode === "peak") {
    const target = elements.peakTarget.value.trim();
    const value = target ? `peak:target=${target}` : "peak";
    pushValue("--audio-normalize", value);
  }

  pushFlag("-vn", elements.disableVideo.checked);
  pushFlag("-an", elements.disableAudio.checked);
  pushFlag("-sn", elements.disableSubtitles.checked);
  pushFlag("-dn", elements.disableData.checked);

  if (elements.faststartMode.value === "fast") {
    pushFlag("--faststart", true);
  }
  if (elements.faststartMode.value === "no") {
    pushFlag("--no-faststart", true);
  }
  if (elements.fragmentedMode.value === "yes") {
    pushFlag("--fragmented", true);
  }
  if (elements.fragmentedMode.value === "no") {
    pushFlag("--no-fragmented", true);
  }

  pushFlag("--no-seek", elements.noSeek.checked);
  pushFlag("--no-open", elements.noOpen.checked);

  pushValue("--yt-dlp-location", elements.ytDlpLocation.value.trim(), { quoteValue: true });
  pushValue("--download-format", elements.downloadFormat.value.trim());
  pushValue("--output-format", elements.outputFormat.value.trim(), { quoteValue: true });
  pushValue("--yt-dlp-extras", elements.ytDlpExtras.value.trim(), { quoteValue: true });
  pushValue("--temp-dir", elements.tempDir.value.trim(), { quoteValue: true });

  if (elements.progressStyle.value) {
    pushValue("--progress", elements.progressStyle.value);
  }
  pushFlag("--debug", elements.debug.checked);
  pushFlag("--quiet", elements.quiet.checked);
  pushFlag("--preview", elements.previewStats.checked);

  if (elements.silentSpeedEnabled.checked && elements.silentSpeed.value.trim()) {
    pushValue("--silent-speed", elements.silentSpeed.value.trim());
  }
  if (elements.silentVarispeedEnabled.checked && elements.silentVarispeed.value.trim()) {
    pushValue("--silent-varispeed", elements.silentVarispeed.value.trim());
  }
  if (elements.silentVolumeEnabled.checked && elements.silentVolume.value.trim()) {
    pushValue("--silent-volume", elements.silentVolume.value.trim());
  }
  if (elements.normalSpeedEnabled.checked && elements.normalSpeed.value.trim()) {
    pushValue("--normal-speed", elements.normalSpeed.value.trim());
  }
  if (elements.normalVarispeedEnabled.checked && elements.normalVarispeed.value.trim()) {
    pushValue("--normal-varispeed", elements.normalVarispeed.value.trim());
  }
  if (elements.normalVolumeEnabled.checked && elements.normalVolume.value.trim()) {
    pushValue("--normal-volume", elements.normalVolume.value.trim());
  }

  const speedRanges = collectRanges(elements.speedRanges, true);
  speedRanges.forEach((range) => {
    options.push({
      flag: "--set-speed-for-range",
      value: `${range.speed},${range.start},${range.end}`,
      hasValue: true,
    });
  });

  return options;
};

const currentArgs = () => {
  const cutOut = formatRangeList(collectRanges(elements.cutRanges));
  const addIn = formatRangeList(collectRanges(elements.addRanges));
  const whenSilentMode = buildActionMode(
    elements.silentCut.checked,
    elements.silentSpeedEnabled.checked,
    elements.silentVarispeedEnabled.checked,
    elements.silentVolumeEnabled.checked,
  );
  const whenNormalMode = buildActionMode(
    elements.normalCut.checked,
    elements.normalSpeedEnabled.checked,
    elements.normalVarispeedEnabled.checked,
    elements.normalVolumeEnabled.checked,
  );
  const whenSilent = whenSilentMode === "cut" ? "" : whenSilentMode;
  const whenNormal = whenNormalMode === "keep" ? "" : whenNormalMode;

  return buildAutoEditorArgs({
    edit: buildEditExpression(),
    margin: elements.margin.value.trim(),
    whenSilent,
    whenNormal,
    cutOut,
    addIn,
    advancedOptions: collectAdvancedOptions(),
    extraArgs: "",
  });
};

const parseManualList = (raw) =>
  raw
    .split(/[;\n]/)
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => value.replace(/^"(.+)"$/, "$1"));

const findClipByLabel = (label) => clipEntries.find((entry) => entry.label === label);

const getExportValue = () => {
  const target = elements.exportTarget.value;
  if (target === "none") {
    return "";
  }
  if (target === "custom") {
    return elements.exportCustom.value.trim();
  }

  const attrs = elements.exportAttrs.value.trim();
  if (target === "resolve") {
    const timelineName = elements.timeline.value || "Auto-Editor Timeline";
    if (elements.runMode.value === "resolve") {
      return `resolve:name=${quote(timelineName)}`;
    }
    if (attrs) {
      return `resolve:${attrs}`;
    }
    return `resolve:name=${quote(timelineName)}`;
  }

  return attrs ? `${target}:${attrs}` : target;
};

const getPreviewOutputToken = () => {
  const override = elements.outputOverride.value.trim();
  if (override) {
    return override;
  }
  if (elements.runMode.value === "resolve") {
    return "<path>.fcpxml";
  }
  return "";
};

const buildUtilityEditExpression = () => {
  const method = elements.levelsMethod.value;
  const params = [];
  if (method === "audio") {
    if (elements.levelsStream.value.trim()) {
      addParam(params, "stream", elements.levelsStream.value.trim());
    }
  }
  if (method === "motion") {
    if (elements.levelsStream.value.trim()) {
      addParam(params, "stream", elements.levelsStream.value.trim());
    }
    if (elements.levelsWidth.value.trim()) {
      addParam(params, "width", elements.levelsWidth.value.trim());
    }
    if (elements.levelsBlur.value.trim()) {
      addParam(params, "blur", elements.levelsBlur.value.trim());
    }
  }
  if (method === "subtitle") {
    if (elements.levelsPattern.value.trim()) {
      addParam(params, "pattern", formatExprValue(elements.levelsPattern.value.trim()));
    }
    if (elements.levelsStream.value.trim()) {
      addParam(params, "stream", elements.levelsStream.value.trim());
    }
    addParam(params, "ignorecase", elements.levelsIgnoreCase.checked);
  }
  if (method === "word") {
    if (elements.levelsPattern.value.trim()) {
      addParam(params, "word", formatExprValue(elements.levelsPattern.value.trim()));
    }
    if (elements.levelsStream.value.trim()) {
      addParam(params, "stream", elements.levelsStream.value.trim());
    }
    addParam(params, "ignorecase", elements.levelsIgnoreCase.checked);
  }
  if (method === "regex") {
    if (elements.levelsPattern.value.trim()) {
      addParam(params, "pattern", formatExprValue(elements.levelsPattern.value.trim()));
    }
    if (elements.levelsStream.value.trim()) {
      addParam(params, "stream", elements.levelsStream.value.trim());
    }
    addParam(params, "ignorecase", elements.levelsIgnoreCase.checked);
  }
  return joinParams(method, params);
};

const buildUtilityArgs = () => {
  const command = elements.utilityCommand.value;
  const args = [];

  if (command === "info") {
    if (elements.infoJson.checked) {
      args.push("--json");
    }
  }

  if (command === "levels") {
    if (elements.levelsNoCache.checked) {
      args.push("--no-cache");
    }
    if (elements.levelsTimebase.value.trim()) {
      args.push(`--timebase ${elements.levelsTimebase.value.trim()}`);
    }
    const edit = buildUtilityEditExpression();
    if (edit) {
      args.push(`--edit ${edit}`);
    }
  }

  if (command === "whisper") {
    if (elements.whisperDebug.checked) {
      args.push("--debug");
    }
    if (elements.whisperSplit.checked) {
      args.push("--split-words");
    }
    if (elements.whisperFormat.value.trim()) {
      args.push(`--format ${elements.whisperFormat.value.trim()}`);
    }
    if (elements.whisperOutput.value.trim()) {
      args.push(`--output ${quote(elements.whisperOutput.value.trim())}`);
    }
    if (elements.whisperQueue.value.trim()) {
      args.push(`--queue ${elements.whisperQueue.value.trim()}`);
    }
    if (elements.whisperVad.value.trim()) {
      args.push(`--vad-model ${elements.whisperVad.value.trim()}`);
    }
  }

  return args;
};

const buildUtilityPreviewCommand = () => {
  const command = elements.utilityCommand.value;
  const bin = normalizeBinary(elements.binary.value.trim());
  const formatToken = (token) => {
    if (!token) {
      return "<clip>";
    }
    if (token.startsWith("<")) {
      return token;
    }
    return maybeQuote(token);
  };

  if (command === "cache") {
    const action = elements.cacheAction.value;
    return action === "clear" ? `${bin} cache clear` : `${bin} cache`;
  }

  const args = buildUtilityArgs();
  const inputs =
    elements.utilityInputMode.value === "manual"
      ? parseManualList(elements.utilityInputList.value)
      : [elements.clip.value || "<clip>"];

  if (command === "whisper") {
    const model = elements.whisperModel.value.trim() || "<model>";
    const inputToken = inputs[0] || "<clip>";
    return `${bin} whisper ${formatToken(inputToken)} ${formatToken(model)}${args.length ? ` ${args.join(" ")}` : ""}`;
  }

  const inputTokens = inputs.length ? inputs : ["<clip>"];
  return `${bin} ${command}${args.length ? ` ${args.join(" ")}` : ""} ${inputTokens
    .map((value) => formatToken(value))
    .join(" ")}`.trim();
};

const updatePreview = () => {
  if (activeTab === "utilities") {
    elements.preview.value = buildUtilityPreviewCommand();
    return;
  }
  const args = currentArgs();
  const preview = buildPreviewCommand({
    binary: elements.binary.value.trim(),
    clipLabel: elements.clip.value || "<clip>",
    exportValue: getExportValue(),
    outputPath: getPreviewOutputToken(),
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

const getInputPaths = () => {
  if (elements.utilityInputMode.value === "manual") {
    const list = parseManualList(elements.utilityInputList.value);
    if (list.length === 0) {
      throw new Error("Please provide at least one input path.");
    }
    return list;
  }
  const selected = findClipByLabel(elements.clip.value);
  if (!selected) {
    throw new Error("Please select a clip from the Media Pool.");
  }
  return [getClipFilePath(selected.clip)];
};
const handleRun = async () => {
  if (activeTab === "utilities") {
    await handleUtilityRun();
    return;
  }

  setStatus("Preparing Auto-Editor command...", "info");
  let clipPath = "";
  try {
    const selected = findClipByLabel(elements.clip.value);
    if (!selected) {
      setStatus("Please select a clip from the list.", "error");
      return;
    }
    clipPath = getClipFilePath(selected.clip);
  } catch (error) {
    setStatus(error.message, "error");
    return;
  }

  setBusy(true);
  try {
    const args = currentArgs();
    const exportValue = getExportValue();
    const outputOverride = elements.outputOverride.value.trim();
    const outputPath =
      outputOverride || (elements.runMode.value === "resolve" ? await getTempFilePath("fcpxml") : "");

    const command = buildAutoEditorCommand({
      binary: elements.binary.value.trim(),
      clipPath,
      exportValue,
      outputPath,
      args,
    });

    setStatus("Running auto-editor...", "info");
    await executeCommand(command);

    const shouldImport =
      elements.runMode.value === "resolve" &&
      exportValue &&
      exportValue.trim().startsWith("resolve");

    if (shouldImport && outputPath) {
      importTimeline(outputPath);
      setStatus("Timeline imported successfully.", "success");
    } else {
      setStatus("Auto-Editor finished successfully.", "success");
    }
  } catch (error) {
    setStatus(error.message || "Auto-Editor failed. Check the console for details.", "error");
  } finally {
    setBusy(false);
  }
};

const handleUtilityRun = async () => {
  setBusy(true);
  setStatus("Preparing utility command...", "info");

  try {
    const commandName = elements.utilityCommand.value;
    const bin = normalizeBinary(elements.binary.value.trim());

    if (commandName === "cache") {
      const action = elements.cacheAction.value;
      const command = action === "clear" ? `${bin} cache clear` : `${bin} cache`;
      await executeCommand(command);
      setStatus("Cache command completed.", "success");
      return;
    }

    const inputPaths = getInputPaths();
    if (inputPaths.length === 0) {
      throw new Error("Input file required.");
    }

    const args = buildUtilityArgs();

    if (commandName === "whisper") {
      const model = elements.whisperModel.value.trim();
      if (!model) {
        throw new Error("Whisper requires a model path or name.");
      }
      const inputPath = inputPaths[0];
      const command = `${bin} whisper ${quote(inputPath)} ${quote(model)}${args.length ? ` ${args.join(" ")}` : ""}`;
      await executeCommand(command);
      setStatus("Whisper command completed.", "success");
      return;
    }

    const command = `${bin} ${commandName}${args.length ? ` ${args.join(" ")}` : ""} ${inputPaths
      .map((value) => quote(value))
      .join(" ")}`.trim();

    await executeCommand(command);
    setStatus("Utility command completed. Check the Resolve console for output.", "success");
  } catch (error) {
    setStatus(error.message, "error");
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

const handleShowHelp = async () => {
  setBusy(true);
  setStatus("Opening Auto-Editor help...", "info");
  try {
    const bin = normalizeBinary(elements.binary.value.trim());
    await executeCommand(`${bin} --help`);
    setStatus("Help output sent to the Resolve console.", "success");
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setBusy(false);
  }
};

const handleShowVersion = async () => {
  setBusy(true);
  setStatus("Checking Auto-Editor version...", "info");
  try {
    const bin = normalizeBinary(elements.binary.value.trim());
    await executeCommand(`${bin} --version`);
    setStatus("Version output sent to the Resolve console.", "success");
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setBusy(false);
  }
};

const getFormState = () => ({
  activeTab,
  clipLabel: elements.clip.value,
  runMode: elements.runMode.value,
  timeline: elements.timeline.value,
  exportTarget: elements.exportTarget.value,
  exportAttrs: elements.exportAttrs.value,
  exportCustom: elements.exportCustom.value,
  outputOverride: elements.outputOverride.value,
  editMode: elements.editMode.value,
  combineOperator: elements.combineOperator.value,
  editManualExpression: elements.editManualExpression.value,
  singleRule: serializeRule(elements.singleRuleContainer.querySelector(".rule-card")),
  combineRules: Array.from(elements.ruleList.querySelectorAll(".rule-card")).map(serializeRule),
  margin: elements.margin.value,
  actions: {
    silentCut: elements.silentCut.checked,
    silentSpeedEnabled: elements.silentSpeedEnabled.checked,
    silentSpeed: elements.silentSpeed.value,
    silentVarispeedEnabled: elements.silentVarispeedEnabled.checked,
    silentVarispeed: elements.silentVarispeed.value,
    silentVolumeEnabled: elements.silentVolumeEnabled.checked,
    silentVolume: elements.silentVolume.value,
    normalCut: elements.normalCut.checked,
    normalSpeedEnabled: elements.normalSpeedEnabled.checked,
    normalSpeed: elements.normalSpeed.value,
    normalVarispeedEnabled: elements.normalVarispeedEnabled.checked,
    normalVarispeed: elements.normalVarispeed.value,
    normalVolumeEnabled: elements.normalVolumeEnabled.checked,
    normalVolume: elements.normalVolume.value,
  },
  ranges: {
    cut: collectRanges(elements.cutRanges),
    add: collectRanges(elements.addRanges),
    speed: collectRanges(elements.speedRanges, true),
  },
  timelineOptions: {
    frameRate: elements.frameRate.value,
    sampleRate: elements.sampleRate.value,
    resolutionWidth: elements.resolutionWidth.value,
    resolutionHeight: elements.resolutionHeight.value,
    backgroundColor: elements.backgroundColor.value,
    scale: elements.scale.value,
  },
  renderOptions: {
    videoCodec: elements.videoCodec.value,
    videoBitrate: elements.videoBitrate.value,
    videoProfile: elements.videoProfile.value,
    audioCodec: elements.audioCodec.value,
    audioLayout: elements.audioLayout.value,
    audioBitrate: elements.audioBitrate.value,
    audioMixMode: elements.audioMixMode.value,
    audioNormalizeMode: elements.audioNormalizeMode.value,
    ebuI: elements.ebuI.value,
    ebuLra: elements.ebuLra.value,
    ebuTp: elements.ebuTp.value,
    ebuGain: elements.ebuGain.value,
    peakTarget: elements.peakTarget.value,
  },
  streamOptions: {
    disableVideo: elements.disableVideo.checked,
    disableAudio: elements.disableAudio.checked,
    disableSubtitles: elements.disableSubtitles.checked,
    disableData: elements.disableData.checked,
    faststartMode: elements.faststartMode.value,
    fragmentedMode: elements.fragmentedMode.value,
    noSeek: elements.noSeek.checked,
    noOpen: elements.noOpen.checked,
  },
  downloadOptions: {
    ytDlpLocation: elements.ytDlpLocation.value,
    downloadFormat: elements.downloadFormat.value,
    outputFormat: elements.outputFormat.value,
    ytDlpExtras: elements.ytDlpExtras.value,
    tempDir: elements.tempDir.value,
  },
  diagnostics: {
    progressStyle: elements.progressStyle.value,
    debug: elements.debug.checked,
    quiet: elements.quiet.checked,
    previewStats: elements.previewStats.checked,
  },
  utilities: {
    utilityCommand: elements.utilityCommand.value,
    utilityInputMode: elements.utilityInputMode.value,
    utilityInputList: elements.utilityInputList.value,
    infoJson: elements.infoJson.checked,
    levelsMethod: elements.levelsMethod.value,
    levelsStream: elements.levelsStream.value,
    levelsPattern: elements.levelsPattern.value,
    levelsIgnoreCase: elements.levelsIgnoreCase.checked,
    levelsWidth: elements.levelsWidth.value,
    levelsBlur: elements.levelsBlur.value,
    levelsTimebase: elements.levelsTimebase.value,
    levelsNoCache: elements.levelsNoCache.checked,
    whisperModel: elements.whisperModel.value,
    whisperFormat: elements.whisperFormat.value,
    whisperOutput: elements.whisperOutput.value,
    whisperQueue: elements.whisperQueue.value,
    whisperVad: elements.whisperVad.value,
    whisperSplit: elements.whisperSplit.checked,
    whisperDebug: elements.whisperDebug.checked,
    cacheAction: elements.cacheAction.value,
  },
  binary: elements.binary.value,
});
const applyFormState = (state) => {
  if (!state) {
    return;
  }
  if (state.runMode) {
    setSegmentedValue("runMode", state.runMode, true);
  }
  elements.timeline.value = state.timeline || elements.timeline.value;
  elements.exportTarget.value = state.exportTarget || "resolve";
  elements.exportAttrs.value = state.exportAttrs || "";
  elements.exportCustom.value = state.exportCustom || "";
  elements.outputOverride.value = state.outputOverride || "";

  if (state.editMode) {
    setSegmentedValue("editMode", state.editMode, true);
  }
  elements.combineOperator.value = state.combineOperator || "or";
  elements.editManualExpression.value = state.editManualExpression || "";

  if (state.singleRule) {
    setSingleRule(state.singleRule);
  } else {
    setSingleRule();
  }
  setCombineRules(state.combineRules);

  if (state.margin !== undefined) {
    elements.margin.value = state.margin;
  }

  if (state.actions) {
    elements.silentCut.checked = Boolean(state.actions.silentCut);
    elements.silentSpeedEnabled.checked = Boolean(state.actions.silentSpeedEnabled);
    elements.silentSpeed.value = state.actions.silentSpeed || "";
    elements.silentVarispeedEnabled.checked = Boolean(state.actions.silentVarispeedEnabled);
    elements.silentVarispeed.value = state.actions.silentVarispeed || "";
    elements.silentVolumeEnabled.checked = Boolean(state.actions.silentVolumeEnabled);
    elements.silentVolume.value = state.actions.silentVolume || "";
    elements.normalCut.checked = Boolean(state.actions.normalCut);
    elements.normalSpeedEnabled.checked = Boolean(state.actions.normalSpeedEnabled);
    elements.normalSpeed.value = state.actions.normalSpeed || "";
    elements.normalVarispeedEnabled.checked = Boolean(state.actions.normalVarispeedEnabled);
    elements.normalVarispeed.value = state.actions.normalVarispeed || "";
    elements.normalVolumeEnabled.checked = Boolean(state.actions.normalVolumeEnabled);
    elements.normalVolume.value = state.actions.normalVolume || "";
  }

  if (state.ranges) {
    elements.cutRanges.innerHTML = "";
    (state.ranges.cut || []).forEach((range) => {
      elements.cutRanges.appendChild(createRangeRow(elements.rangeTemplate, range));
    });
    elements.addRanges.innerHTML = "";
    (state.ranges.add || []).forEach((range) => {
      elements.addRanges.appendChild(createRangeRow(elements.rangeTemplate, range));
    });
    elements.speedRanges.innerHTML = "";
    (state.ranges.speed || []).forEach((range) => {
      elements.speedRanges.appendChild(createRangeRow(elements.speedRangeTemplate, range));
    });
  }

  if (state.timelineOptions) {
    elements.frameRate.value = state.timelineOptions.frameRate || "";
    elements.sampleRate.value = state.timelineOptions.sampleRate || "";
    elements.resolutionWidth.value = state.timelineOptions.resolutionWidth || "";
    elements.resolutionHeight.value = state.timelineOptions.resolutionHeight || "";
    elements.backgroundColor.value = state.timelineOptions.backgroundColor || "#000000";
    elements.scale.value = state.timelineOptions.scale || "";
  }

  if (state.renderOptions) {
    elements.videoCodec.value = state.renderOptions.videoCodec || "";
    elements.videoBitrate.value = state.renderOptions.videoBitrate || "";
    elements.videoProfile.value = state.renderOptions.videoProfile || "";
    elements.audioCodec.value = state.renderOptions.audioCodec || "";
    elements.audioLayout.value = state.renderOptions.audioLayout || "";
    elements.audioBitrate.value = state.renderOptions.audioBitrate || "";
    elements.audioMixMode.value = state.renderOptions.audioMixMode || "default";
    elements.audioNormalizeMode.value = state.renderOptions.audioNormalizeMode || "off";
    elements.ebuI.value = state.renderOptions.ebuI || "";
    elements.ebuLra.value = state.renderOptions.ebuLra || "";
    elements.ebuTp.value = state.renderOptions.ebuTp || "";
    elements.ebuGain.value = state.renderOptions.ebuGain || "";
    elements.peakTarget.value = state.renderOptions.peakTarget || "";
  }

  if (state.streamOptions) {
    elements.disableVideo.checked = Boolean(state.streamOptions.disableVideo);
    elements.disableAudio.checked = Boolean(state.streamOptions.disableAudio);
    elements.disableSubtitles.checked = Boolean(state.streamOptions.disableSubtitles);
    elements.disableData.checked = Boolean(state.streamOptions.disableData);
    elements.faststartMode.value = state.streamOptions.faststartMode || "auto";
    elements.fragmentedMode.value = state.streamOptions.fragmentedMode || "auto";
    elements.noSeek.checked = Boolean(state.streamOptions.noSeek);
    elements.noOpen.checked = Boolean(state.streamOptions.noOpen);
  }

  if (state.downloadOptions) {
    elements.ytDlpLocation.value = state.downloadOptions.ytDlpLocation || "";
    elements.downloadFormat.value = state.downloadOptions.downloadFormat || "";
    elements.outputFormat.value = state.downloadOptions.outputFormat || "";
    elements.ytDlpExtras.value = state.downloadOptions.ytDlpExtras || "";
    elements.tempDir.value = state.downloadOptions.tempDir || "";
  }

  if (state.diagnostics) {
    elements.progressStyle.value = state.diagnostics.progressStyle || "";
    elements.debug.checked = Boolean(state.diagnostics.debug);
    elements.quiet.checked = Boolean(state.diagnostics.quiet);
    elements.previewStats.checked = Boolean(state.diagnostics.previewStats);
  }

  if (state.utilities) {
    if (state.utilities.utilityCommand) {
      setSegmentedValue("utilityCommand", state.utilities.utilityCommand, true);
    }
    if (state.utilities.utilityInputMode) {
      setSegmentedValue("utilityInputMode", state.utilities.utilityInputMode, true);
    }
    elements.utilityInputList.value = state.utilities.utilityInputList || "";
    elements.infoJson.checked = Boolean(state.utilities.infoJson);
    elements.levelsMethod.value = state.utilities.levelsMethod || "audio";
    elements.levelsStream.value = state.utilities.levelsStream || "";
    elements.levelsPattern.value = state.utilities.levelsPattern || "";
    elements.levelsIgnoreCase.checked = Boolean(state.utilities.levelsIgnoreCase);
    elements.levelsWidth.value = state.utilities.levelsWidth || "";
    elements.levelsBlur.value = state.utilities.levelsBlur || "";
    elements.levelsTimebase.value = state.utilities.levelsTimebase || "";
    elements.levelsNoCache.checked = Boolean(state.utilities.levelsNoCache);
    elements.whisperModel.value = state.utilities.whisperModel || "";
    elements.whisperFormat.value = state.utilities.whisperFormat || "";
    elements.whisperOutput.value = state.utilities.whisperOutput || "";
    elements.whisperQueue.value = state.utilities.whisperQueue || "";
    elements.whisperVad.value = state.utilities.whisperVad || "";
    elements.whisperSplit.checked = Boolean(state.utilities.whisperSplit);
    elements.whisperDebug.checked = Boolean(state.utilities.whisperDebug);
    elements.cacheAction.value = state.utilities.cacheAction || "list";
  }

  if (state.binary !== undefined) {
    elements.binary.value = state.binary;
  }

  savedClipLabel = state.clipLabel || null;
  savedExportTarget = elements.exportTarget.value || savedExportTarget;

  if (state.activeTab) {
    activeTab = state.activeTab;
  }
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

const handleInputChange = () => {
  updateExportFields();
  updateEditMode();
  updateAudioNormalizePanel();
  updateUtilityPanels();
  updateUtilityInputMode();
  updateRunLabel();
  updatePreview();
  saveState();
};

const bindEvents = () => {
  elements.refresh.addEventListener("click", refreshClips);
  elements.copy.addEventListener("click", handleCopy);
  elements.run.addEventListener("click", handleRun);
  elements.cancel.addEventListener("click", () => closePlugin());
  elements.showHelp.addEventListener("click", handleShowHelp);
  elements.showVersion.addEventListener("click", handleShowVersion);

  elements.addRule.addEventListener("click", () => {
    elements.ruleList.appendChild(createRuleCard({ method: "audio" }, { removable: true }));
    handleInputChange();
  });
  elements.addCutRange.addEventListener("click", () => {
    elements.cutRanges.appendChild(createRangeRow(elements.rangeTemplate));
    handleInputChange();
  });
  elements.addAddRange.addEventListener("click", () => {
    elements.addRanges.appendChild(createRangeRow(elements.rangeTemplate));
    handleInputChange();
  });
  elements.addSpeedRange.addEventListener("click", () => {
    elements.speedRanges.appendChild(createRangeRow(elements.speedRangeTemplate));
    handleInputChange();
  });

  elements.tabEdit.addEventListener("click", () => setActiveTab("edit"));
  elements.tabAdvanced.addEventListener("click", () => setActiveTab("advanced"));
  elements.tabUtilities.addEventListener("click", () => setActiveTab("utilities"));

  document.querySelectorAll("input, select, textarea").forEach((input) => {
    if (input.closest("template")) {
      return;
    }
    input.addEventListener("input", handleInputChange);
    input.addEventListener("change", handleInputChange);
  });
};

initSegmentedControls();
setSingleRule();
setCombineRules();
loadState();
updateExportFields();
updateEditMode();
updateAudioNormalizePanel();
updateUtilityPanels();
updateUtilityInputMode();
updateRunLabel();
bindEvents();
refreshClips();
updatePreview();

if (activeTab !== "edit") {
  setActiveTab(activeTab);
}
