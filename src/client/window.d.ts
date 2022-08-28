import type {ElectronAPI} from "../server/preload.js";

declare global {
    interface Window {
        electronAPI: ElectronAPI,
    }
}
