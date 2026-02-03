// ================= DADOS ================= 
const produtos = JSON.parse(
    document.getElementById("produtos-data")?.textContent || "{}"
);

let categoriaAtual = Object.keys(produtos)[0] || null;
const quantidadesTemp = {};
const coresSelecionadas = {};
const imagemIndex = {};

// ================= QUANTIDADE =================
function alterarQtdTemp(nome, delta) {
    quantidadesTemp[nome] = (quantidadesTemp[nome] || 0) + delta;
    if (quantidadesTemp[nome] < 0) quantidadesTemp[nome] = 0;
    renderizarProdutos();
}

// ================= CATEGORIAS =================
window.filtrarCategoria = function (cat) {
    categoriaAtual = cat;
    document.querySelectorAll(".btn-cat").forEach(btn =>
        btn.classList.toggle("ativa", btn.dataset.cat === cat)
    );
    renderizarProdutos();
};

// ================= RENDER =================
function renderizarProdutos() {
    const lista = document.getElementById("lista-produtos");
    if (!lista || !produtos[categoriaAtual]) return;

    lista.innerHTML = "";

    produtos[categoriaAtual].forEach(produto => {
        if (!produto.cores || produto.cores.length === 0) return;

        const qtd = quantidadesTemp[produto.nome] || 0;
        imagemIndex[produto.nome] ??= 0;

        const li = document.createElement("li");

        /* ===== IMAGENS ===== */
        const imagensWrap = document.createElement("div");
        imagensWrap.className = "produto-imagens";

        produto.cores.forEach((c, i) => {
            const img = document.createElement("img");
            img.src = `/static/uploads/${c.imagem}`;
            img.className = i === imagemIndex[produto.nome] ? "ativa" : "";

            img.onclick = () => {
                imagemIndex[produto.nome] = i;
                renderizarProdutos();
            };

            imagensWrap.appendChild(img);
        });

        const btnEsq = document.createElement("button");
        btnEsq.className = "btn-slide esq";
        btnEsq.innerHTML = "‹";
        btnEsq.onclick = () => {
            imagemIndex[produto.nome] =
                (imagemIndex[produto.nome] - 1 + produto.cores.length) % produto.cores.length;
            renderizarProdutos();
        };

        const btnDir = document.createElement("button");
        btnDir.className = "btn-slide dir";
        btnDir.innerHTML = "›";
        btnDir.onclick = () => {
            imagemIndex[produto.nome] =
                (imagemIndex[produto.nome] + 1) % produto.cores.length;
            renderizarProdutos();
        };

        imagensWrap.append(btnEsq, btnDir);

        /* ===== INFO ===== */
        const info = document.createElement("div");
        info.className = "info-produto";

        info.innerHTML = `
            <span class="badge-categoria">${produto.categoria}</span>
            <h3>${produto.nome}</h3>
            <span class="preco-produto">R$ ${produto.valor.toFixed(2)}</span> <!-- NOVO -->
            <span class="minimo-info">Mínimo de 10 unidades por pedido</span>
        `;


        /* ===== SELECT COR (MANTIDO) ===== */
        const selectCor = document.createElement("select");
        selectCor.className = "select-cor";

        produto.cores.forEach((c, i) => {
            const opt = document.createElement("option");
            opt.textContent = c.cor;
            opt.value = i;
            if (i === imagemIndex[produto.nome]) opt.selected = true;
            selectCor.appendChild(opt);
        });

        selectCor.onchange = e => {
            imagemIndex[produto.nome] = Number(e.target.value);
            renderizarProdutos();
        };

        /* ===== CONTROLES ===== */
        const controles = document.createElement("div");
        controles.className = "controle-qtd";
        controles.innerHTML = `
            <button class="btn-qty" onclick="alterarQtdTemp('${produto.nome}', -10)">−10</button>
            <button class="btn-qty" onclick="alterarQtdTemp('${produto.nome}', -1)">−1</button>
            <span class="qtd-produto">${qtd}</span>
            <button class="btn-qty" onclick="alterarQtdTemp('${produto.nome}', 1)">+1</button>
            <button class="btn-qty" onclick="alterarQtdTemp('${produto.nome}', 10)">+10</button>
        `;

        /* ===== BOTÃO (ADIÇÃO FUNCIONAL) ===== */
        const btn = document.createElement("button");
        btn.className = "btn-add-carrinho";
        btn.textContent = "Solicitar orçamento";
        btn.disabled = qtd < 10;

        btn.onclick = () => {
            const corSelecionada = produto.cores[imagemIndex[produto.nome]];

            const itemInicial = {
                produto: produto.nome,
                categoria: produto.categoria,
                cor: corSelecionada.cor,
                quantidade: qtd,
                valor: produto.valor  // NOVO
            };

            localStorage.setItem(
                "orcamento_inicial",
                JSON.stringify(itemInicial)
            );

            window.location.href = "/pedido";
        };

        /* ===== ADIÇÕES AO DOM (ESTAVA FALTANDO) ===== */
        info.append(selectCor, controles, btn);
        li.append(imagensWrap, info);
        lista.appendChild(li);
    });
}

const menuToggle = document.getElementById('menuToggle');
const navbarMenu = document.getElementById('navbarMenu');

menuToggle.addEventListener('click', function(e) {
    e.stopPropagation(); // evita que o clique feche imediatamente
    navbarMenu.classList.toggle('active');
    menuToggle.classList.toggle('open');

    // muda o símbolo do botão
    menuToggle.textContent = menuToggle.classList.contains('open') ? '❌' : '☰';
});

// fecha ao clicar fora
document.addEventListener('click', function(e) {
    if(navbarMenu.classList.contains('active') && !navbarMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        navbarMenu.classList.remove('active');
        menuToggle.classList.remove('open');
        menuToggle.textContent = '☰';
    }
});




// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".btn-cat")[0]?.classList.add("ativa");
    renderizarProdutos();
});
