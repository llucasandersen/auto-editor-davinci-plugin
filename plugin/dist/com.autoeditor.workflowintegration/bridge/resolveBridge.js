const resolveApiBridge = window.resolveAPI || window.resolveBridge || null;
const resolve = window.resolve || window.davinciResolve || window.Resolve;
const workflow = window.workflowIntegration || window.WorkflowIntegration || window.resolveWorkflow;

const ensureResolve = () => {
  if (!resolve) {
    throw new Error("Resolve scripting bridge is not available. Ensure the SDK injects 'resolve'.");
  }
  return resolve;
};

const ensureWorkflow = () => {
  if (!workflow) {
    throw new Error("Workflow Integration bridge is not available. Ensure the SDK injects 'workflowIntegration'.");
  }
  return workflow;
};

const collectClips = (folder, prefix = "") => {
  const entries = [];
  const clips = folder.GetClipList?.() || [];
  clips.forEach((clip) => {
    const name = clip.GetName?.() || "Untitled Clip";
    const filePath = clip.GetClipProperty?.("File Path") || "";
    entries.push({
      label: `${prefix}${name}`,
      clip,
      filePath,
    });
  });

  const subfolders = folder.GetSubFolderList?.() || [];
  subfolders.forEach((subfolder) => {
    const folderName = subfolder.GetName?.() || "Folder";
    entries.push(...collectClips(subfolder, `${prefix}${folderName} / `));
  });

  return entries;
};

export const listMediaPoolClips = () => {
  if (resolveApiBridge?.listMediaPoolClips) {
    return resolveApiBridge.listMediaPoolClips();
  }
  const resolveApi = ensureResolve();
  const projectManager = resolveApi.GetProjectManager?.();
  const project = projectManager?.GetCurrentProject?.();
  if (!project) {
    throw new Error("No active project. Open a project in Resolve.");
  }
  const mediaPool = project.GetMediaPool?.();
  const rootFolder = mediaPool?.GetRootFolder?.();
  if (!rootFolder) {
    throw new Error("Unable to access the Media Pool root folder.");
  }
  return collectClips(rootFolder);
};

export const getClipFilePath = (entry) => {
  if (entry?.filePath) {
    return entry.filePath;
  }
  if (resolveApiBridge?.getClipFilePath) {
    return resolveApiBridge.getClipFilePath(entry);
  }
  const clip = entry?.clip || entry;
  const filePath = clip?.GetClipProperty?.("File Path");
  if (!filePath) {
    throw new Error("Unable to determine clip file path.");
  }
  return filePath;
};

export const importTimeline = (filePath) => {
  if (resolveApiBridge?.importTimeline) {
    return resolveApiBridge.importTimeline(filePath);
  }
  const resolveApi = ensureResolve();
  const projectManager = resolveApi.GetProjectManager?.();
  const project = projectManager?.GetCurrentProject?.();
  const mediaPool = project?.GetMediaPool?.();
  if (!mediaPool) {
    throw new Error("Unable to access Media Pool to import timeline.");
  }
  const ok = mediaPool.ImportTimelineFromFile?.(filePath);
  if (!ok) {
    throw new Error("Resolve failed to import the timeline file.");
  }
};

export const getCurrentTimelineInfo = () => {
  if (resolveApiBridge?.getCurrentTimelineInfo) {
    return resolveApiBridge.getCurrentTimelineInfo();
  }
  const resolveApi = ensureResolve();
  const projectManager = resolveApi.GetProjectManager?.();
  const project = projectManager?.GetCurrentProject?.();
  const timeline = project?.GetCurrentTimeline?.();
  if (!timeline) {
    throw new Error("No active timeline.");
  }
  return {
    name: timeline.GetName?.() || "Untitled Timeline",
    frameRate: timeline.GetSetting?.("timelineFrameRate") || "Unknown",
    resolution: timeline.GetSetting?.("timelineResolution") || "Unknown",
  };
};

export const renderCurrentTimeline = () => {
  if (resolveApiBridge?.renderCurrentTimeline) {
    return resolveApiBridge.renderCurrentTimeline();
  }
  const resolveApi = ensureResolve();
  const projectManager = resolveApi.GetProjectManager?.();
  const project = projectManager?.GetCurrentProject?.();
  if (!project) {
    throw new Error("No active project.");
  }
  const ok = project.AddRenderJob?.();
  if (!ok) {
    throw new Error("Failed to add render job. Check render settings in Deliver page.");
  }
  project.StartRendering?.();
};

export const executeCommand = async (command) => {
  if (resolveApiBridge?.executeCommand) {
    return resolveApiBridge.executeCommand(command);
  }
  const bridge = ensureWorkflow();
  if (typeof bridge.executeCommand === "function") {
    return bridge.executeCommand(command);
  }
  if (typeof bridge.runProcess === "function") {
    return bridge.runProcess(command);
  }
  if (typeof bridge.invoke === "function") {
    return bridge.invoke("ExecuteCommand", { command });
  }
  throw new Error("Workflow Integration bridge does not support command execution.");
};

export const getTempFilePath = async (extension = "fcpxml") => {
  if (resolveApiBridge?.getTempFilePath) {
    return resolveApiBridge.getTempFilePath(extension);
  }
  if (workflow?.getTemporaryPath) {
    const base = workflow.getTemporaryPath();
    return `${base.replace(/\\$/g, "")}/auto-editor-${Date.now()}.${extension}`;
  }
  if (workflow?.getTempPath) {
    const base = workflow.getTempPath();
    return `${base.replace(/\\$/g, "")}/auto-editor-${Date.now()}.${extension}`;
  }
  throw new Error("Workflow Integration bridge cannot provide a temp file path.");
};

export const closePlugin = () => {
  if (resolveApiBridge?.closePlugin) {
    return resolveApiBridge.closePlugin();
  }
  if (workflow?.closePlugin) {
    workflow.closePlugin();
  }
};

export const findAutoEditorBinary = async () => {
  if (resolveApiBridge?.findAutoEditorBinary) {
    return resolveApiBridge.findAutoEditorBinary();
  }
  return "";
};
