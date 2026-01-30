const { app,  BrowserWindow } = require('electron');
const path = require('path');
const { ipcMain } = require('electron')
const db = require('./database/db')

ipcMain.handle('adicionar-produto', (event, nome, preco) => {
  db.run(
    'INSERT INTO produtos (nome, preco) VALUES (?, ?)',
    [nome, preco],
    function (err) {
      if (err) {
        console.error('Erro ao inserir:', err.message);
      } else {
        console.log('Produto salvo com ID:', this.lastID);
      }
    }
  );
});

app.whenReady().then(() => { 
    const win = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            sandbox: false,
            contextIsolation: true
        }
    });

    win.loadFile(path.join(__dirname, 'src/pages/index.html'));
});