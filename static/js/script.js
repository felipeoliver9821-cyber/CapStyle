// ================== STORAGE ==================
function getCarrinho() {
    return JSON.parse(localStorage.getItem("carrinho")) || [];
}

function salvarCarrinho(carrinho) {
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

// ================== CONTADOR DO CARRINHO ==================
function atualizarContadorCarrinho() {
    const contador = document.getElementById("contador-carrinho");
    if (!contador) return;

    const total = getCarrinho().reduce((soma, item) => soma + (item.qtd || 0), 0);
    contador.textContent = total;
}

// ================== SCROLL SUAVE ==================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const alvo = document.querySelector(this.getAttribute("href"));
        if (alvo) {
            alvo.scrollIntoView({ behavior: "smooth" });
        }
    });
});

// ================== INIT GLOBAL ==================
document.addEventListener("DOMContentLoaded", () => {
    atualizarContadorCarrinho();
    console.log("script.js global carregado corretamente");
});
