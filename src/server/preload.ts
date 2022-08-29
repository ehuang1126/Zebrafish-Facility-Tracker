import { contextBridge, ipcRenderer } from 'electron';
import type { Tank, Gene } from './database.js';

interface ElectronAPI {
    readTank: (row: number, col: number) => Promise<Tank>,
    writeTank: (row: number, col: number, tank: Tank) => void,
    readGene: (id: string) => Gene,
    writeGene: (id: string, gene: Gene) => void,
}

const exposedAPI: ElectronAPI = {
    readTank: (row: number, col: number)  => ipcRenderer.invoke('db:readTank', row, col),
    writeTank: (row: number, col: number, tank: Tank) => ipcRenderer.invoke('db:writeTank', row, col, tank),
    readGene: (id: string)  => ipcRenderer.invoke('db:readGene', id),
    writeGene: (id: string, gene: Gene) => ipcRenderer.invoke('db:writeGene', id, gene),
}

contextBridge.exposeInMainWorld('electronAPI', exposedAPI);

export type {ElectronAPI};
