import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import SQLiteDatabase from './server/sqliteDatabase.js';

/**
 * Creates a new window and attaches it to the React process.
 */
function createWindow(): void {
    const mainWindow: BrowserWindow = new BrowserWindow({
        width: 1600,
        height: 1200,
        frame: true,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'server', 'preload.js'),
        },
    });

    // mainWindow.removeMenu()
    mainWindow.loadURL('http://localhost:3000')
}

// run once initialized
app.whenReady().then((): void => {
    new SQLiteDatabase(path.join(__dirname, '..', 'data', 'sqlite3.db')).attachHandlers(ipcMain);

    createWindow();

    app.on('activate', (): void => {
        if(BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed
app.on('window-all-closed', (): void => {
    app.quit();
});
