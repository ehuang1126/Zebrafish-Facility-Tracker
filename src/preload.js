const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    readTank: (...args) => ipcRenderer.invoke('db:readTank', ...args),
});
