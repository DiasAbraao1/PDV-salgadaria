const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');

contextBridge.exposeInMainWorld('api', {
    adicionarProduto: (nome, preco) => {
        ipcRenderer.invoke('adicionar-produto', nome, preco)
    },

    apagarProduto: (id) => {
        ipcRenderer.invoke('apagar-produto', id)
    },

    editarProduto: (dados) => {
        ipcRenderer.invoke('editar-produto', dados)
    },
});
