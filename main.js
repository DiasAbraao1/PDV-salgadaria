const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./database/db');

let mainWindow;
let vendaWindow;

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

ipcMain.handle('listar-produto', () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM produtos", (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
});

app.whenReady().then(() => { 
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'src/index.html'));
});


function criarJanelaVenda(total) {
  if (vendaWindow) {
    vendaWindow.focus();
    return;
  }

  vendaWindow = new BrowserWindow({
    width: 400,
    height: 500,

    minWidth: 400,
    minHeight: 500,
    maxWidth: 400,
    maxHeight: 500,

    resizable: false, // trava o redimensionamento
    parent: mainWindow,
    modal: true,

    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false,
      contextIsolation: true
    }
  });

  vendaWindow.totalCompra = total;

  vendaWindow.loadFile(path.join(__dirname, 'src/venda.html'));

  vendaWindow.on('closed', () => {
    vendaWindow = null;
  });
}


ipcMain.handle('abrir-janela-venda', (event, total) => {
  criarJanelaVenda(total);
});

ipcMain.handle("get-total-compra", () => {
  if (!vendaWindow) return 0;
  return Number(vendaWindow.totalCompra) || 0;
});

ipcMain.handle('adicionar-pedido', (event, total, forma_pagamento, data) => {
  db.run(
    'INSERT INTO pedidos (total, forma_pagamento, criado_em) VALUES (?, ?, ?)',
    [total, forma_pagamento, data],
    function (err) {
      if (err) {
        console.error('Erro ao inserir:', err.message);
      } else {
        console.log('Pedido salvo com ID:', this.lastID);
      }
    }
  );
});

ipcMain.handle('fechar-janela-pedido', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.close();
})

