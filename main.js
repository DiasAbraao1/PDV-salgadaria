const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./database/db');
const { eventNames } = require('process');

let mainWindow;
let vendaWindow;
let produtoWindow;

ipcMain.handle('adicionar-produto', (event, nome, preco) => {
  db.run(
    'INSERT INTO produtos (nome, preco) VALUES (?, ?)',
    [nome, preco],
    function (err) {
      if (err) {
        console.error('Erro ao inserir:', err.message);
      } else {
        console.log('Produto salvo com ID:', this.lastID);
        mainWindow.webContents.send("produto-adicionado");
      }
    }
  );

  
});

ipcMain.handle('apagar-produto', (event, id) => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE produtos SET ativo = 0 WHERE id = ?`,
      [id],
      err => {
        if (err) reject(err);
        else resolve(true);
      }
    );
    mainWindow.webContents.send("produto-apagado");
  });
});

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
    db.all("SELECT * FROM produtos WHERE ativo = 1", (err, rows) => {
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


function criarJanelaVenda(pedido) {
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

  vendaWindow.pedido = pedido;

  vendaWindow.loadFile(path.join(__dirname, 'src/venda.html'));

  vendaWindow.on('closed', () => {
    vendaWindow = null;
    mainWindow.webContents.send("pedido-finalizado");
  });
}


ipcMain.handle('abrir-janela-venda', (event, pedido) => {
  criarJanelaVenda(pedido);
});

ipcMain.handle("get-total-compra", () => {
  if (!vendaWindow || !vendaWindow.pedido) return 0;
  return Number(vendaWindow.pedido.total) || 0;
});


ipcMain.handle('adicionar-pedido', (event, desconto, totalFinal, forma_pagamento) => {
  return new Promise((resolve, reject) => {

    if (!vendaWindow || !vendaWindow.pedido) {
      return reject("Pedido inexistente");
    }

    const { total, itens } = vendaWindow.pedido;

    const data = dataLocal();

    db.run(
      `INSERT INTO pedidos
       (total_bruto, desconto, total, forma_pagamento, criado_em)
       VALUES (?, ?, ?, ?, ?)`,
      [total, desconto, totalFinal, forma_pagamento, data],
      function (err) {
        if (err) return reject(err);

        const pedidoId = this.lastID;

        const stmt = db.prepare(`
          INSERT INTO pedidos_itens
          (pedido_id, produto_id, preco_unitario)
          VALUES (?, ?, ?)
        `);

        itens.forEach(item => {
          stmt.run(pedidoId, item.id, item.preco);
        });

        stmt.finalize();

        // avisa o renderer que finalizou
        mainWindow.webContents.send("pedido-finalizado");

        resolve(pedidoId);
      }
    );
  });
});


ipcMain.handle('fechar-janela-pedido', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.close();
})


ipcMain.handle('listar-pedido', () => {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM pedidos ORDER BY id DESC",
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
});



ipcMain.handle('listar-itens-pedido', (event, pedidoId) => {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT p.nome, pi.preco_unitario
      FROM pedidos_itens pi
      JOIN produtos p ON p.id = pi.produto_id
      WHERE pi.pedido_id = ?
    `, [pedidoId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
});


function criarJanelaProduto() {
  if (produtoWindow) {
    produtoWindow.focus();
    return;
  }

  produtoWindow = new BrowserWindow({
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

  produtoWindow.loadFile(path.join(__dirname, 'src/adicionarProduto.html'));

  produtoWindow.on('close', () => {
    produtoWindow = null;
    mainWindow.webContents.send("produto-adicionado");
  })

}

ipcMain.handle('abrir-janela-produto', (event) => {
  criarJanelaProduto();
})

ipcMain.handle('fechar-janela-produto', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.close();
})


// ================ DASHBOARD ==============

ipcMain.handle("listar-vendas-dia", () => {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        DATE(criado_em) as dia,
        SUM(total) as total
      FROM pedidos
      GROUP BY dia
      ORDER BY dia
    `, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
});

// ============================== historico ==============

ipcMain.handle("listar-vendas-hoje", () => {
  const hoje = dataHoje();

  return new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        strftime('%H', criado_em) as hora,
        SUM(total) as total
      FROM pedidos
      WHERE date(criado_em) = ?
      GROUP BY hora
      ORDER BY hora
    `, [hoje], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
});

function dataLocal() {
  const d = new Date();

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');

  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

function dataHoje() {
  const d = new Date();

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}`;
}