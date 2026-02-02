const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("resolveAPI", {
  listMediaPoolClips: () => ipcRenderer.invoke("autoeditor:listMediaPoolClips"),
  importTimeline: (filePath) => ipcRenderer.invoke("autoeditor:importTimeline", filePath),
  executeCommand: (command) => ipcRenderer.invoke("autoeditor:executeCommand", command),
  getTempFilePath: (extension) => ipcRenderer.invoke("autoeditor:getTempFilePath", extension),
  closePlugin: () => ipcRenderer.invoke("autoeditor:closePlugin"),
});
