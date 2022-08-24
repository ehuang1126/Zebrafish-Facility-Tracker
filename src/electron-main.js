const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow () {
    // Create the browser window.
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        frame: true,
        webPreferences: {
            nodeIntegration: true
        }
    })

    // win.removeMenu()
    //win.loadFile(path.join(__dirname, '..', 'public', 'index.html'))
    win.loadURL('http://localhost:3000')
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed
app.on('window-all-closed', app.quit)

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
