const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const Database = require('./database.js');

function createWindow () {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: true,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    // mainWindow.removeMenu()
    mainWindow.loadURL('http://localhost:3000')
}

// run once initialized
app.whenReady().then(() => {
    new Database(path.join(__dirname, '..', 'data', 'test-data.xlsx')).attachHandlers(ipcMain);

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
});
