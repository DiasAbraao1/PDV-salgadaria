// window.api.adicionarProduto('Coxinha', 8);
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
