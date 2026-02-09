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

    adicionarPedido: (desconto, total, forma_pagamento, data) => {
        ipcRenderer.invoke('adicionar-pedido',desconto, total, forma_pagamento, data)
    },

    fecharJanelaPedido: () => {
        ipcRenderer.invoke('fechar-janela-pedido');
    },

    pedidoFinalizado: (callback) => {
        ipcRenderer.on('pedido-finalizado', callback);
    },

    listarPedido: () => {
        return ipcRenderer.invoke('listar-pedido');
    },

    listarItensPedido: (id) => {
        return ipcRenderer.invoke('listar-itens-pedido', id)
    }
});
