const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    readTank: (...args)  => ipcRenderer.invoke('db:readTank', ...args),
    writeTank: (...args) => ipcRenderer.invoke('db:writeTank', ...args),
    readGene: (...args)  => ipcRenderer.invoke('db:readGene', ...args),
    writeGene: (...args) => ipcRenderer.invoke('db:writeGene', ...args),
});
