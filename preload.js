const { contextBridge, ipcRenderer, ipcMain } = require('electron');

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
    },

    // ============== JANELA DE PRODUTOS ============

    abrirJanelaProduto: () => {
        ipcRenderer.invoke('abrir-janela-produto');
    },

    fecharJanelaProduto: () => {
        ipcRenderer.invoke('fechar-janela-produto');
    },

    produtoAdicionado: (callback) => {
        ipcRenderer.on('produto-adicionado', callback);
    },

    produtoApagado: (callback) => {
        ipcRenderer.on('produto-apagado', callback);
    },

    listarVendasDia: () => ipcRenderer.invoke("listar-vendas-dia"),

    // ========= JANELA DE ESTATISTICAS ================ 

    listarVendasHoje: () => ipcRenderer.invoke("listar-vendas-hoje"),

    listarPagamentosHoje: () => ipcRenderer.invoke("listar-pagamentos-hoje"),
    
});
