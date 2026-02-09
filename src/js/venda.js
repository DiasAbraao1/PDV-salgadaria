let totalOriginal = 0;

document.addEventListener("DOMContentLoaded", async () => {
  const inputDesconto = document.getElementById("desconto");
  const totalVenda = document.getElementById("total-venda");
  const btnConfirmar = document.getElementById("btnConfirmar");
  const selectPagamento = document.getElementById("forma-pagamento");

  totalOriginal = await window.api.totalCompra();

  function renderizarValor(valor) {
    totalVenda.textContent = `Total: R$ ${valor.toFixed(2)}`;
  }

  function atualizarTotal() {
    const desconto = Number(inputDesconto.value.replace(',', '.')) || 0;
    const totalComDesconto = Math.max(totalOriginal - desconto, 0);
    renderizarValor(totalComDesconto);
  }

  // total inicial
  renderizarValor(totalOriginal);

  // desconto em tempo real
  inputDesconto.addEventListener("input", atualizarTotal);

  // confirmar pedido
  btnConfirmar.addEventListener('click', () => {
    const forma_pagamento = selectPagamento.value;
    const data = dataLocal();

    if (!forma_pagamento) {
      alert("Selecione a forma de pagamento");
      return;
    }

    const desconto = Number(inputDesconto.value) || 0;
    const totalFinal = Math.max(totalOriginal - desconto, 0);

    window.api.adicionarPedido(desconto, totalFinal, forma_pagamento, data);

    alert('Pedido feito com sucesso!');

    console.log(desconto, totalFinal, forma_pagamento, data);
    window.api.fecharJanelaPedido(); 
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
