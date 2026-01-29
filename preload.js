const { contextBridge } = require('electron');
const db = require('./database/db');

contextBridge.exposeInMainWorld('api', {
    adicionarProduto: (nome, preco) => {
        
    }
})
