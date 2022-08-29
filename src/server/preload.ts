import { contextBridge, ipcRenderer } from 'electron';
import type { Tank, Gene, Location } from './database.js';

interface ElectronAPI {
    readTank: (loc: Location) => Promise<Tank>,
    writeTank: (loc: Location, tank: Tank) => void,
    readGene: (id: string) => Gene,
    writeGene: (id: string, gene: Gene) => void,
}

const exposedAPI: ElectronAPI = {
    readTank: (loc: Location)  => ipcRenderer.invoke('db:readTank', loc),
    writeTank: (loc: Location, tank: Tank) => ipcRenderer.invoke('db:writeTank', loc, tank),
    readGene: (id: string)  => ipcRenderer.invoke('db:readGene', id),
    writeGene: (id: string, gene: Gene) => ipcRenderer.invoke('db:writeGene', id, gene),
}

contextBridge.exposeInMainWorld('electronAPI', exposedAPI);

export type {ElectronAPI};
