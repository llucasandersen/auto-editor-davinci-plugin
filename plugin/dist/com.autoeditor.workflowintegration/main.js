const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { exec } = require("child_process");
const WorkflowIntegration = require("./WorkflowIntegration.node");

const PLUGIN_ID = "com.autoeditor.workflowintegration";

let resolveObj = null;
let mainWindow = null;

const debugLog = (message) => {
  if (!mainWindow || !mainWindow.webContents) {
    return;
  }
  const payload = JSON.stringify(message);
  mainWindow.webContents.executeJavaScript(`console.log('%cMAIN:', 'color:#3dd6b7', ${payload});`);
};

const initResolveInterface = async () => {
  const isSuccess = await WorkflowIntegration.Initialize(PLUGIN_ID);
  if (!isSuccess) {
    dialog.showErrorBox("Auto-Editor", "Failed to initialize Resolve interface.");
    return null;
  }

  const resolveInterfaceObj = await WorkflowIntegration.GetResolve();
  if (!resolveInterfaceObj) {
    dialog.showErrorBox("Auto-Editor", "Failed to get Resolve interface.");
    return null;
  }

  return resolveInterfaceObj;
};

const cleanupResolveInterface = async () => {
  try {
    WorkflowIntegration.CleanUp();
  } catch (error) {
    debugLog(`Cleanup error: ${error.message || error}`);
  }
  resolveObj = null;
};

const getResolve = async () => {
  if (!resolveObj) {
    resolveObj = await initResolveInterface();
  }
  return resolveObj;
};

const collectClips = (folder, prefix = "") => {
  const entries = [];
  const clips = folder?.GetClipList?.() || [];
  clips.forEach((clip) => {
    const name = clip.GetName?.() || "Untitled Clip";
    const filePath = clip.GetClipProperty?.("File Path") || "";
    entries.push({
      label: `${prefix}${name}`,
      filePath,
    });
  });

  const subfolders = folder?.GetSubFolderList?.() || [];
  subfolders.forEach((subfolder) => {
    const folderName = subfolder.GetName?.() || "Folder";
    entries.push(...collectClips(subfolder, `${prefix}${folderName} / `));
  });

  return entries;
};

const listMediaPoolClips = async () => {
  const resolveApi = await getResolve();
  const projectManager = resolveApi?.GetProjectManager?.();
  const project = projectManager?.GetCurrentProject?.();
  if (!project) {
    return [];
  }
  const mediaPool = project.GetMediaPool?.();
  const rootFolder = mediaPool?.GetRootFolder?.();
  if (!rootFolder) {
    return [];
  }
  return collectClips(rootFolder);
};

const importTimeline = async (filePath) => {
  const resolveApi = await getResolve();
  const projectManager = resolveApi?.GetProjectManager?.();
  const project = projectManager?.GetCurrentProject?.();
  const mediaPool = project?.GetMediaPool?.();
  if (!mediaPool) {
    throw new Error("Unable to access Media Pool to import timeline.");
  }
  const ok = mediaPool.ImportTimelineFromFile?.(filePath);
  if (!ok) {
    throw new Error("Resolve failed to import the timeline file.");
  }
  return true;
};

const executeCommand = (command) =>
  new Promise((resolve, reject) => {
    exec(
      command,
      {
        windowsHide: true,
        maxBuffer: 20 * 1024 * 1024,
      },
      (error, stdout, stderr) => {
        if (error) {
          const message = String(stderr || error.message || "Command failed").trim();
          reject(new Error(message || "Command failed"));
          return;
        }
        resolve({ stdout, stderr });
      },
    );
  });

const getTempFilePath = (extension = "fcpxml") => {
  const base = app.getPath("temp");
  return path.join(base, `auto-editor-${Date.now()}.${extension}`);
};

const closePlugin = () => {
  if (mainWindow) {
    mainWindow.close();
  } else {
    app.quit();
  }
  return true;
};

const registerEventHandlers = () => {
  ipcMain.handle("autoeditor:listMediaPoolClips", listMediaPoolClips);
  ipcMain.handle("autoeditor:importTimeline", (_event, filePath) => importTimeline(filePath));
  ipcMain.handle("autoeditor:executeCommand", (_event, command) => executeCommand(command));
  ipcMain.handle("autoeditor:getTempFilePath", (_event, extension) => getTempFilePath(extension));
  ipcMain.handle("autoeditor:closePlugin", () => closePlugin());
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 900,
    useContentSize: true,
    backgroundColor: "#0b0f16",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.on("close", () => {
    app.quit();
  });

  mainWindow.loadFile("index.html");
};

app.whenReady().then(() => {
  registerEventHandlers();
  createWindow();
});

app.on("before-quit", () => {
  cleanupResolveInterface();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
