import { contextBridge, ipcRenderer } from 'electron';
import type { Tank, Genotype, Location, Rack } from './database';
import { fileURLToPath } from 'url';

type ElectronAPI = {
    importFromXLSX: (fileName: string) => void,
    readTank: (uid: number) => Promise<Tank | undefined>,
    writeTank: (uid: number, tank: Tank) => void,
    readGenotype: (uid: string) => Promise<Genotype | undefined>,
    writeGenotype: (genotype: Genotype) => void,
    findTank: (loc: Location) => Promise<Tank | undefined>,
    mergeTanks: (uids: number[]) => Promise<Tank | undefined>,
    cullTank: (uid: number) => void,
    writeRack: (rack: Rack) => void,
    getRacks: () => Promise<Rack[]>,
    getGenotypes: () => Promise<Map<string, Genotype>>,
    getChildren: (parentId: string) => Promise<Genotype[] | undefined>,
};

const exposedAPI: ElectronAPI = {
    importFromXLSX: (fileName: string): void => {ipcRenderer.invoke('db:importFromXLSX', fileName)},
    readTank: (uid: number): Promise<Tank | undefined> => ipcRenderer.invoke('db:readTank', uid),
    writeTank: (uid: number, tank: Tank): void => { ipcRenderer.invoke('db:writeTank', uid, tank) },
    readGenotype: (uid: string): Promise<Genotype | undefined> => ipcRenderer.invoke('db:readGenotype', uid),
    writeGenotype: (genotype: Genotype): void => { ipcRenderer.invoke('db:writeGenotype', genotype) },
    findTank: (loc: Location): Promise<Tank | undefined> => ipcRenderer.invoke('db:findTank', loc),
    mergeTanks: (uids: number[]): Promise<Tank | undefined> => ipcRenderer.invoke('db:mergeTanks', uids),
    cullTank: (uid: number): void => { ipcRenderer.invoke('db:cullTank', uid) },
    writeRack: (rack: Rack): void => { ipcRenderer.invoke('db:writeRack', rack)},
    getRacks: (): Promise<Rack[]> => ipcRenderer.invoke('db:getRacks'),
    getGenotypes: (): Promise<Map<string, Genotype>> => ipcRenderer.invoke('db:getGenotypes'),
    getChildren: (parentId: string): Promise<Genotype[] | undefined> => ipcRenderer.invoke('db:getChildren', parentId),
}

contextBridge.exposeInMainWorld('electronAPI', exposedAPI);

export type { ElectronAPI };
