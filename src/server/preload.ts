import { contextBridge, ipcRenderer } from 'electron';
import type { Tank, Gene, Location } from './database.js';

type ElectronAPI = {
    readTank: (uid: number) => Promise<Tank | undefined>,
    writeTank: (uid: number, tank: Tank) => void,
    readGene: (id: string) => Promise<Gene | undefined>,
    writeGene: (id: string, gene: Gene) => void,
    findTank: (loc: Location) => Promise<Tank | undefined>,
};

const exposedAPI: ElectronAPI = {
    readTank: (uid: number): Promise<Tank | undefined> => ipcRenderer.invoke('db:readTank', uid),
    writeTank: (uid: number, tank: Tank): void => { ipcRenderer.invoke('db:writeTank', uid, tank) },
    readGene: (id: string): Promise<Gene | undefined> => ipcRenderer.invoke('db:readGene', id),
    writeGene: (id: string, gene: Gene): void => { ipcRenderer.invoke('db:writeGene', id, gene) },
    findTank: (loc: Location): Promise<Tank | undefined> => ipcRenderer.invoke('db:findTank', loc),
}

contextBridge.exposeInMainWorld('electronAPI', exposedAPI);

export type { ElectronAPI };
