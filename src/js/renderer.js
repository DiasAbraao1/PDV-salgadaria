
// ===================== Index - pedidos ======================== //

document.getElementById('open-btn').addEventListener('click', function(){
    document.getElementById('sidebar').classList.toggle('open-sidebar');
});

function loadPage(page) {
  fetch(`pages/${page}.html`)
    .then(res => res.text())
    .then(html => {
      document.getElementById('content').innerHTML = html;

      if (page === "pedidos") {
        renderizarProdutos();
        renderizarPedido();
        renderizarTotal();
      } else if (page === "historico") {
        carregarHistorico();
      } else if (page === "produtos") {
        renderizarListaProdutos();
      } else if (page === 'dashboard') {
        inicializarGrafico();
        renderizarFaturamento();
      }
    });
}

loadPage('pedidos');

document.addEventListener("click", (e) => {

    const item = e.target.closest(".side-item");
    if (!item) return;

    // remove active de todos
    document.querySelectorAll(".side-item")
        .forEach(i => i.classList.remove("active"));

    // adiciona no clicado
    item.classList.add("active");

    // carrega a página
    const page = item.dataset.page;
    if (page) loadPage(page);
});


let produtosCache = [];

function renderizarProdutos() {
  const lista = document.getElementById("produtos-list");

  if (!lista) return;

  lista.innerHTML = "";

  produtosCache.forEach(p => {
    const div = document.createElement("div");
    div.classList.add("produto");

    const nome = document.createElement("span");
    nome.textContent = p.nome;

    const preco = document.createElement("span");
    preco.textContent = `R$ ${Number(p.preco).toFixed(2)}`;
    preco.classList.add("preco");

    div.appendChild(nome);
    div.appendChild(preco);

    div.addEventListener("click", () => {
        venderProduto(p);
    });


    lista.appendChild(div);
  });
}

let pedidoAtual = [];

function renderizarPedido() {
  const list = document.getElementById('pedidos-list');
  if (!list) return;

  list.innerHTML = "";

  pedidoAtual.forEach((p, index) => {
    const div = document.createElement("div");
    div.classList.add("vendas");

    const nome = document.createElement("span");
    nome.textContent = p.nome;

    const preco = document.createElement("span");
    preco.textContent = `R$ ${Number(p.preco).toFixed(2)}`;
    preco.classList.add("preco");

    const btnRemover = document.createElement("button");
    btnRemover.innerHTML = '<i class="fa-solid fa-trash"></i>'; 
    btnRemover.classList.add("btn-remover");

    btnRemover.addEventListener("click", () => {
        removerProduto(index);
    });

    div.appendChild(nome);
    div.appendChild(preco);
    div.appendChild(btnRemover);

    list.appendChild(div);
  });
}

function removerProduto(index) {
  pedidoAtual.splice(index, 1);
  renderizarPedido();
  renderizarTotal();
}

function venderProduto(p) {
  pedidoAtual.push(p);
  renderizarPedido();
  renderizarTotal(); 
}

function calcularTotal() {
  return pedidoAtual.reduce((total, p) => {
    return total + Number(p.preco);
  }, 0);
}

function renderizarTotal() {
  const span = document.getElementById("total-valor");
  if (!span) return;

  const total = calcularTotal();
  span.textContent = `Total: R$ ${total.toFixed(2)}`;
}

window.api.pedidoFinalizado(() => {
  pedidoAtual = [];
  renderizarPedido();
  renderizarTotal();
  carregarHistorico();
});

document.addEventListener("DOMContentLoaded", () => {
  window.api.listarProduto().then(produtos => {
    produtosCache = produtos;
    renderizarProdutos();
    renderizarListaProdutos();
    carregarPedidos();
  });
});

document.addEventListener("click", (e) => {
  if (e.target.id === "btnVender") {
    const total = calcularTotal();
    if(total !== 0.00) {
      window.api.abrirJanelaVenda({
        total,
        itens: pedidoAtual
      });
    } else {
      alert("Escolha algum produto!");
    }
    
  }
});


// ====================================== HISTORICO =============================================== //

let listaPedidos = [];

function renderizarHistorico() {
  const list = document.getElementById("lista-pedidos");
  if (!list) return;

  list.innerHTML = "";

  listaPedidos.forEach(p => {
    const div = document.createElement("div");
    div.classList.add("pedido");

    div.innerHTML = `
      <span class="id">#${p.id}</span>
      <span class="data">${formatarData(p.criado_em)}</span>
      <span class="pagamento">${p.forma_pagamento}</span>
      <span class="bruto">R$ ${Number(p.total_bruto).toFixed(2)}</span>
      <span class="desconto">- R$ ${Number(p.desconto).toFixed(2)}</span>
      <span class="total">R$ ${Number(p.total).toFixed(2)}</span>
    `;

    div.addEventListener("click", async () => {
      const jaAberto = div.nextElementSibling?.classList.contains("itens-pedido");

      if (jaAberto) {
        div.nextElementSibling.remove();
        return;
      }

      const itens = await window.api.listarItensPedido(p.id);

      const itensDiv = document.createElement("div");
      itensDiv.classList.add("itens-pedido");

      itens.forEach(i => {
        const linha = document.createElement("div");
        linha.classList.add("item-linha");
        linha.innerHTML = `
          <span>${i.nome} </span>
          <span>R$ ${Number(i.preco_unitario).toFixed(2)}</span>
        `;
        itensDiv.appendChild(linha);
      });

      div.after(itensDiv);
    });


    list.appendChild(div);
  });
}


function abrirDetalhesPedido(pedidoId) {
  window.api.listarItensPedido(pedidoId).then(itens => {
    console.table(itens);
  });
}

function formatarData(data) {
  return new Date(data).toLocaleString("pt-BR");
}

function carregarHistorico() {
  window.api.listarPedido().then(pedidos => {
    listaPedidos = pedidos;
    renderizarHistorico();
  });
}


// ============================ Produtos ===================================================//

function renderizarListaProdutos() {
  const lista = document.getElementById("lista-produtos");
  if (!lista) return;

  lista.innerHTML = "";

  produtosCache.forEach(p => {
    const div = document.createElement("div");
    div.classList.add("produto");

    const nome = document.createElement("span");
    nome.textContent = p.nome;

    const preco = document.createElement("span");
    preco.textContent = `R$ ${Number(p.preco).toFixed(2)}`;
    preco.classList.add("preco");

    const btnRemover = document.createElement("button");
    btnRemover.innerHTML = '<i class="fa-solid fa-trash"></i>';
    btnRemover.classList.add("btn-remover");
    btnRemover.dataset.id = p.id;

    div.appendChild(nome);
    div.appendChild(preco);
    div.appendChild(btnRemover);

    lista.appendChild(div);
  });
}

document.addEventListener("click", (e) => {
  if (e.target.id === "btnNovoProduto") {
    window.api.abrirJanelaProduto();
  }

  const btn = e.target.closest(".btn-remover");
  if (btn) {
    if(confirm("Tem certeza que deseja apagar esse produto?")) {
      const id = btn.dataset.id;
      window.api.apagarProduto(Number(id));
    } else {
      return;
    }
    
  }
});

window.api.produtoAdicionado(() => {
  window.api.listarProduto().then(produtos => {
    produtosCache = produtos;
    renderizarProdutos();
    renderizarListaProdutos();
  });
});

window.api.produtoApagado(() => {
  window.api.listarProduto().then(produtos => {
    produtosCache = produtos;
    renderizarProdutos();
    renderizarListaProdutos();
  });
});




// ================================ Estatisticas =======================

async function inicializarGrafico() {
  const dados = await window.api.listarVendasHoje();

  const labels = dados.map(d => d.hora + ':00');
  const valores = dados.map(d => d.total);

  const ctx = document.getElementById('grafico');

  new Chart(ctx, {
    type: 'bar', 
    data: {
      labels,
      datasets: [{
        label: 'Faturamento dos horarios (R$)',
        data: valores,
        fill: true,
        tension: 0.3,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

let Pedidos = [];

async function renderizarFaturamento() {
  const box = document.getElementById("historicos");
  if (!box) return;

  box.innerHTML = "";

  const dados = await window.api.listarPagamentosHoje();

  const totais = {
    debito: 0,
    credito: 0,
    pix: 0,
    dinheiro: 0,
    outro: 0
  };

  let totalDia = 0;

  dados.forEach(p => {
    const tipo = p.forma_pagamento.toLowerCase();
    const valor = Number(p.total) || 0;

    if (totais[tipo] !== undefined) {
      totais[tipo] += valor;   // soma corretamente
    } else {
      totais.outro += valor;   // fallback seguro
    }

    totalDia += valor;
  });

  box.innerHTML = `
    <h3>Faturamento do dia</h3>

    <div class="linha">
      <span>Débito</span>
      <strong>R$ ${totais.debito.toFixed(2)}</strong>
    </div>

    <div class="linha">
      <span>Crédito</span>
      <strong>R$ ${totais.credito.toFixed(2)}</strong>
    </div>

    <div class="linha">
      <span>Pix</span>
      <strong>R$ ${totais.pix.toFixed(2)}</strong>
    </div>

    <div class="linha">
      <span>Dinheiro</span>
      <strong>R$ ${totais.dinheiro.toFixed(2)}</strong>
    </div>

    <div class="linha">
      <span>Outro</span>
      <strong>R$ ${totais.outro.toFixed(2)}</strong>
    </div>

    <br><br>

    <div class="total">
      <span>Total do Dia:</span>
      <strong> R$ ${totalDia.toFixed(2)} </strong>
    </div>
  `;
}

function carregarPedidos() {
  window.api.listarPedido().then(pedidos => {
    Pedidos = pedidos;
  });
}


//==========================================

const img = document.getElementById("user-avatar");
const input = document.getElementById("foto");

img.addEventListener('click', () => {
  input.click();
});

input.addEventListener("change", () => {
  const file = input.files[0];
  if (file) img.src = URL.createObjectURL(file);
});
