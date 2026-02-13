document.addEventListener("DOMContentLoaded", async () => {
    const btnConfirmar = document.getElementById('btnConfirmar');

    btnConfirmar.addEventListener('click', () => {
        const nome = document.getElementById("nome").value;
        const preco = document.getElementById("preco").value;


        if (!nome || !preco) {
            alert('Campo faltando!');
            return
        };

        window.api.adicionarProduto(nome, preco);

        alert("Prduto adicionado com sucesso");

        window.api.fecharJanelaPedido();  
    })
})