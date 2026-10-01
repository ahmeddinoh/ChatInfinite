const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("incognito", {
  startOver: () => ipcRenderer.send("start-over"),
});
