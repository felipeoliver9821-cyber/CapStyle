const container = document.getElementById("cores-container");

function adicionarCor() {
    const index = document.querySelectorAll(".grupo-cor").length;

    const div = document.createElement("div");
    div.className = "grupo-cor";

    div.innerHTML = `
        <input type="text" name="cor_${index}" placeholder="Cor" required>
        <input type="file" name="imagem_${index}" accept="image/*" required>
    `;

    container.appendChild(div);
}

// adiciona 1 cor por padrão
adicionarCor();
