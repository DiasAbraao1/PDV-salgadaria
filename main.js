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

ipcMain.handle('apagar-produto', (event, id) => {
    db.run(
        `DELETE FROM produtos WHERE id = ?`, [id],
        function(err) {
            if(err) {
                console.log('Erro ao deletar produto!', err.message);
            } else {
                console.log('Produto  deletado!', this.changes)
            }
        }
    )
})

ipcMain.handle('editar-produto', (event, {id, campo, valor}) => {
    if(!["nome", "preco"].includes(campo)) {
        throw new Error("Campo inválido!");
    }

    const sql = `UPDATE produtos SET ${campo} = ? WHERE id = ?`;

    return new Promise((res, rej) => {
        db.run(sql, [valor, id], err => {
            if (err) rej(err);
            else res(true);
        })
    })
})

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