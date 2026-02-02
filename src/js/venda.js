function renderizar_valor(total) {
  document.getElementById("total-venda").textContent =
    `Total: R$ ${Number(total).toFixed(2)}`;
}

document.addEventListener("DOMContentLoaded", () => {
  window.api.totalCompra().then(total => {
    renderizar_valor(total);
  });
});
// document.addEventListener("DOMContentLoaded", () => {
//   window.api.listarProduto().then(produtos => {
//     produtosCache = produtos;
//     renderizarProdutos(); // se já estiver em pedidos
//   });
// });

