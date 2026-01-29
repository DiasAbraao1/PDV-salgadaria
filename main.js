const { app,  BrowserWindow } = require('electron');
const path = require('path');

app.whenReady().then(() => { 
    const win = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    
    win.loadURL(path.join(__dirname, 'src/pages/index.html'));
});