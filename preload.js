const { contextBridge, ipcRenderer } = require('electron');

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

    listarProduto: () => {
        return ipcRenderer.invoke('listar-produto')
    },

    // ============= FUNÇÕES DA NOVA JANELA DE VENDA ============ //

    abrirJanelaVenda: (total) => ipcRenderer.invoke("abrir-janela-venda", total),

    totalCompra: () => {
        return ipcRenderer.invoke('get-total-compra');
    },
});
