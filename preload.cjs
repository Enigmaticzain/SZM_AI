const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktop", {
  isDesktop: true,
  platform: process.platform,
  versions: {
    chrome: process.versions.chrome,
    electron: process.versions.electron,
    node: process.versions.node,
  },
  pickTrainingFiles: () => ipcRenderer.invoke("training:pick-files"),
  exportKnowledgeBase: (data, suggestedName) =>
    ipcRenderer.invoke("knowledge:export", { data, suggestedName }),
});
