const produtos = JSON.parse(document.getElementById("produtos-data")?.textContent || "{}");

let categoriaAtual = Object.keys(produtos)[0] || null;
let itensPedido = [];

const quantidadesTemp = {};
const coresSelecionadas = {};
const imagemIndex = {};

// ================= FILTRO DE CATEGORIAS =================
window.filtrarCategoria = function (cat) {
    categoriaAtual = cat;
    document.querySelectorAll(".btn-cat").forEach(btn =>
        btn.classList.toggle("ativa", btn.dataset.cat === cat)
    );
    renderizarProdutosPedido();
};

// ================= QUANTIDADES TEMPORÁRIAS =================
function alterarQtdTemp(nome, delta) {
    quantidadesTemp[nome] = (quantidadesTemp[nome] || 0) + delta;
    if (quantidadesTemp[nome] < 0) quantidadesTemp[nome] = 0;
    renderizarProdutosPedido();
}

// ================= ADICIONAR ITEM AO ORÇAMENTO =================
function adicionarItem(produto) {
    console.log("quantidadesTemp:", quantidadesTemp);
    console.log("produto.nome:", produto.nome);

    const qtd = quantidadesTemp[produto.nome] || 0;
    const cor = coresSelecionadas[produto.nome];

    if (qtd < 10) {
        alert("Quantidade mínima: 10 unidades");
        return;
    }
    if (!cor) {
        alert("Selecione uma cor");
        return;
    }

    // Verifica se o item já existe no pedido (mesmo produto e cor)
    const existente = itensPedido.find(i => i.produto === produto.nome && i.cor === cor);

    if (existente) {
        // Se existir, soma a quantidade e atualiza o subtotal
        existente.quantidade += qtd;
        existente.subtotal = existente.quantidade * produto.valor;
    } else {
        // Se não existir, adiciona novo item com valor e subtotal
        const valor = parseFloat(produto.valor) || 0;
        const subtotal = qtd * valor;

        itensPedido.push({
            produto: produto.nome,
            categoria: produto.categoria,
            cor,
            quantidade: qtd,
            valor: valor,
            subtotal: subtotal
        });
    }


    // Reseta a quantidade temporária
    quantidadesTemp[produto.nome] = 0;

    // Atualiza resumo e renderização
    atualizarResumoPedido();
    renderizarProdutosPedido();
}


// ================= ATUALIZA RESUMO DE ITENS =================
function atualizarResumoPedido() {
    const lista = document.getElementById("resumo-itens");
    if (!lista) return;

    // Mantém o container de preview da imagem separado
    const previewContainer = lista.querySelector(".orcamento-gerado");
    lista.innerHTML = "";
    if (previewContainer) lista.appendChild(previewContainer);

    if (itensPedido.length === 0) {
        if (!previewContainer) {
            lista.innerHTML += `<li class="preview-vazio">Nenhum item adicionado</li>`;
        }
        return;
    }

    // Lista os itens do orçamento
    itensPedido.forEach((item, i) => {
        console.log("Item no resumo:", item);
        const li = document.createElement("li");
        li.className = "orcamento-item";
        li.innerHTML = `
            <div class="orcamento-info">
                <strong>${item.produto}</strong>
                <span>Cor: ${item.cor}</span>
                <span>Quantidade: ${item.quantidade}</span>
                <span>Valor unitário: R$ ${(item.valor ?? 0).toFixed(2)}</span>
                <span>Subtotal: R$ ${(item.subtotal ?? 0).toFixed(2)}</span>

            </div>
            <button class="btn-remover" onclick="removerItem(${i})">✕</button>
        `;
        lista.appendChild(li);
    });

    // Calcula total geral
    const totalGeral = itensPedido.reduce((acc, item) => acc + item.subtotal, 0);

    // Adiciona total ao final
    const totalLi = document.createElement("li");
    totalLi.className = "orcamento-total";
    totalLi.innerHTML = `<strong>Total do orçamento: R$ ${totalGeral.toFixed(2)}</strong>`;
    lista.appendChild(totalLi);
}


// ================= REMOVER ITEM =================
function removerItem(index) {
    itensPedido.splice(index, 1);
    atualizarResumoPedido();
}

// ================= RENDERIZA PRODUTOS =================
function renderizarProdutosPedido() {
    const lista = document.getElementById("lista-produtos");
    if (!lista || !produtos[categoriaAtual]) return;

    lista.innerHTML = "";

    produtos[categoriaAtual].forEach(produto => {
        if (!produto.cores?.length) return;

        const qtd = quantidadesTemp[produto.nome] || 0;
        imagemIndex[produto.nome] ??= 0;
        coresSelecionadas[produto.nome] ??= produto.cores[0].cor;

        const li = document.createElement("li");

        const imagensWrap = document.createElement("div");
        imagensWrap.className = "produto-imagens";

        produto.cores.forEach((c, i) => {
            const img = document.createElement("img");
            img.src = `/static/uploads/${c.imagem}`;
            img.className = i === imagemIndex[produto.nome] ? "ativa" : "";
            imagensWrap.appendChild(img);
        });

        const criarBotao = (classe, texto, dir) => {
            const btn = document.createElement("button");
            btn.className = `btn-slide ${classe}`;
            btn.textContent = texto;
            btn.onclick = () => {
                imagemIndex[produto.nome] =
                    (imagemIndex[produto.nome] + dir + produto.cores.length) % produto.cores.length;
                coresSelecionadas[produto.nome] =
                    produto.cores[imagemIndex[produto.nome]].cor;
                renderizarProdutosPedido();
            };
            return btn;
        };
        imagensWrap.append(
            criarBotao("esq", "‹", -1),
            criarBotao("dir", "›", 1)
        );

        const info = document.createElement("div");
        info.className = "info-produto";
        info.innerHTML = `
            <h3>${produto.nome}</h3>
            <span class="preco-produto">R$ ${produto.valor.toFixed(2)}</span>
            <span class="minimo-info">Mínimo de 10 unidades</span>
            <span class="minimo-info">💰 Desconto por quantidade</span>
        `;


        const selectCor = document.createElement("select");
        selectCor.className = "select-cor";
        produto.cores.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.cor;
            opt.textContent = c.cor;
            opt.selected = c.cor === coresSelecionadas[produto.nome];
            selectCor.appendChild(opt);
        });
        selectCor.onchange = e => {
            const idx = produto.cores.findIndex(c => c.cor === e.target.value);
            imagemIndex[produto.nome] = idx;
            coresSelecionadas[produto.nome] = e.target.value;
            renderizarProdutosPedido();
        };

        const controles = document.createElement("div");
        controles.className = "controle-qtd";
        controles.innerHTML = `
            <button class="btn-qty" onclick="alterarQtdTemp('${produto.nome}', -10)">−10</button>
            <button class="btn-qty" onclick="alterarQtdTemp('${produto.nome}', -1)">−1</button>
            <span class="qtd-produto">${qtd}</span>
            <button class="btn-qty" onclick="alterarQtdTemp('${produto.nome}', 1)">+1</button>
            <button class="btn-qty" onclick="alterarQtdTemp('${produto.nome}', 10)">+10</button>
        `;

        const btnAdd = document.createElement("button");
        btnAdd.className = "btn-add-carrinho";
        btnAdd.textContent = "Adicionar ao orçamento";
        btnAdd.disabled = qtd < 10;
        btnAdd.onclick = () => adicionarItem(produto);

        /* ===== AVISO DE VALOR ===== */ 
        const avisoValor = document.createElement("span"); avisoValor.className = "aviso-valor"; avisoValor.textContent = "Valores exibidos são base inicial.";

        info.append(selectCor, controles, btnAdd, avisoValor);
        li.append(imagensWrap, info);
        lista.appendChild(li);
    });
}

// ================= ENVIAR PEDIDO =================
window.enviarPedido = async function () {
    const nome = document.getElementById("nome-cliente")?.value;
    const endereco = document.getElementById("endereco-cliente")?.value;
    const cidade = document.getElementById("cidade-cliente")?.value;
    const telefone = document.getElementById("telefone-cliente")?.value;

    if (!nome || !endereco || !cidade || !telefone || itensPedido.length === 0) {
        alert("Preencha todos os dados e adicione itens");
        return;
    }

    try {
        const response = await fetch("/pedido/gerar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                cliente: nome,
                endereco: endereco,
                cidade: cidade,
                telefone: telefone,
                itens: itensPedido
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.erro || "Erro ao gerar orçamento");
            return;
        }

        // preview
        const lista = document.getElementById("resumo-itens");

        let container = lista.querySelector(".orcamento-gerado");
        if (!container) {
            container = document.createElement("div");
            container.className = "orcamento-gerado";
            lista.prepend(container);
        }

        container.innerHTML = "";

        const img = document.createElement("img");
        img.src = data.link;
        img.className = "preview-orcamento";
        container.appendChild(img);

        const btnWhats = document.createElement("button");
        btnWhats.className = "btn-enviar-whatsapp";
        btnWhats.textContent = "Enviar Orçamento 📲";
        btnWhats.onclick = () => enviarWhatsApp(data.id, data.link);
        container.appendChild(btnWhats);

        itensPedido = [];
        atualizarResumoPedido();

    } catch (err) {
        console.error(err);
        alert("Erro ao gerar orçamento");
    }
};

// ================= ENVIAR WHATSAPP =================
function enviarWhatsApp(id, urlImagem) {
    const numero = "556294536745";
    
    // CORREÇÃO: Trocado " por ` (crase) para as variáveis funcionarem
    const mensagem = `Olá! Segue o seu *Orçamento ${id}*. 📄\n\nVocê pode visualizar os detalhes no link abaixo:  \n${urlImagem}`;

    window.open(
        `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`,
        "_blank"
    );

    // Limpeza do pedido
    itensPedido = [];
    atualizarResumoPedido();
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
    // Marca a primeira categoria como ativa
    const primeiraCat = document.querySelectorAll(".btn-cat")[0];
    if (primeiraCat) primeiraCat.classList.add("ativa");

    // Renderiza os produtos da categoria atual
    renderizarProdutosPedido();

    // ===== ADIÇÃO: ITEM VINDO DA HOME =====
    const itemSalvo = localStorage.getItem("orcamento_inicial");
    if (itemSalvo) {
        try {
            const item = JSON.parse(itemSalvo);
            if (item.produto && item.quantidade) {
                itensPedido.push(item);
            }
        } catch (err) {
            console.warn("Erro ao ler item salvo:", err);
        }
        localStorage.removeItem("orcamento_inicial");
    }
    // ===== FIM DA ADIÇÃO =====

    // Atualiza o resumo do pedido
    atualizarResumoPedido();

    // ===== MENU HAMBÚRGUER =====
    const menuToggle = document.getElementById('menuToggle');
    const navbarMenu = document.getElementById('navbarMenu');

    if (menuToggle && navbarMenu) {
        menuToggle.addEventListener('click', e => {
            e.stopPropagation();
            navbarMenu.classList.toggle('active');
            menuToggle.classList.toggle('open');
            menuToggle.textContent = menuToggle.classList.contains('open') ? '❌' : '☰';
        });

        document.addEventListener('click', e => {
            if (
                navbarMenu.classList.contains('active') &&
                !navbarMenu.contains(e.target) &&
                !menuToggle.contains(e.target)
            ) {
                navbarMenu.classList.remove('active');
                menuToggle.classList.remove('open');
                menuToggle.textContent = '☰';
            }
        });
    }
});

