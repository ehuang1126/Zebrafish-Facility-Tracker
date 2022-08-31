import { contextBridge, ipcRenderer } from 'electron';
import type { Tank, Gene, Location, Rack } from './database';

type ElectronAPI = {
    readTank: (uid: number) => Promise<Tank | undefined>,
    writeTank: (uid: number, tank: Tank) => void,
    readGene: (uid: string) => Promise<Gene | undefined>,
    writeGene: (gene: Gene) => void,
    findTank: (loc: Location) => Promise<Tank | undefined>,
    getRacks: () => Promise<Rack[]>,
    getGenes: () => Promise<Map<string, Gene>>,
};

const exposedAPI: ElectronAPI = {
    readTank: (uid: number): Promise<Tank | undefined> => ipcRenderer.invoke('db:readTank', uid),
    writeTank: (uid: number, tank: Tank): void => { ipcRenderer.invoke('db:writeTank', uid, tank) },
    readGene: (uid: string): Promise<Gene | undefined> => ipcRenderer.invoke('db:readGene', uid),
    writeGene: (gene: Gene): void => { ipcRenderer.invoke('db:writeGene', gene) },
    findTank: (loc: Location): Promise<Tank | undefined> => ipcRenderer.invoke('db:findTank', loc),
    getRacks: (): Promise<Rack[]> => ipcRenderer.invoke('db:getRacks'),
    getGenes: (): Promise<Map<string, Gene>> => ipcRenderer.invoke('db:getGenes'),
}

contextBridge.exposeInMainWorld('electronAPI', exposedAPI);

export type { ElectronAPI };
