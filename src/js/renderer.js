// window.api.adicionarProduto('Coxinha', 200);
// window.api.apagarProduto(2);
// window.api.editarProduto({
//     id: 3,
//     campo: "nome",
//     valor: "joelho"
// });

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
    btnRemover.innerHTML = '<i class="fa-solid fa-trash"></i>'; // ícone simples
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


document.addEventListener("DOMContentLoaded", () => {
  window.api.listarProduto().then(produtos => {
    produtosCache = produtos;
    renderizarProdutos(); // se já estiver em pedidos
  });
});

document.addEventListener("click", (e) => {
  if (e.target.id === "btnVender") {
    const total = calcularTotal();
    window.api.abrirJanelaVenda(total);
  }
});