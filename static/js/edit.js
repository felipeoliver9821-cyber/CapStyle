const form = document.getElementById("form-editar-produto")
const coresContainer = document.getElementById("cores-container")
const addCorBtn = document.getElementById("add-cor")
const produtoId = document.getElementById("produto-id").value

let cores = []
let coresRemovidas = []

/* ===============================
   MAPEAR CORES EXISTENTES
================================ */
document.querySelectorAll(".cor-item").forEach(div => {
    cores.push({
        id: div.dataset.id,
        element: div,
        corInput: div.querySelector(".input-cor"),
        fileInput: div.querySelector(".input-imagem"),
        preview: div.querySelector(".preview")
    })
})

/* ===============================
   REMOVER COR
================================ */
coresContainer.addEventListener("click", e => {
    if (!e.target.classList.contains("btn-remover")) return

    const corDiv = e.target.closest(".cor-item")
    const corId = corDiv.dataset.id

    if (corId) coresRemovidas.push(corId)

    cores = cores.filter(c => c.element !== corDiv)
    corDiv.remove()
})

/* ===============================
   PREVIEW IMAGEM
================================ */
coresContainer.addEventListener("change", e => {
    if (!e.target.classList.contains("input-imagem")) return

    const file = e.target.files[0]
    if (!file) return

    const preview = e.target.closest(".cor-item").querySelector(".preview")
    preview.src = URL.createObjectURL(file)
})

/* ===============================
   ADICIONAR NOVA COR
================================ */
addCorBtn.addEventListener("click", () => {
    const div = document.createElement("div")
    div.classList.add("cor-item")

    div.innerHTML = `
        <input type="text" class="input-cor" placeholder="Nome da cor">
        <img class="preview" style="display:none">
        <input type="file" class="input-imagem">
        <button type="button" class="btn-remover">Remover</button>
    `

    coresContainer.appendChild(div)

    cores.push({
        id: null,
        element: div,
        corInput: div.querySelector(".input-cor"),
        fileInput: div.querySelector(".input-imagem"),
        preview: div.querySelector(".preview")
    })
})

/* ===============================
   SUBMIT
================================ */
form.addEventListener("submit", async e => {
    e.preventDefault()

    const formData = new FormData()

    formData.append("nome", document.getElementById("nome").value)
    formData.append("categoria", document.getElementById("categoria").value)
    formData.append("cores_removidas", JSON.stringify(coresRemovidas))

    const coresPayload = []

    cores.forEach((c, index) => {
        coresPayload.push({
            id: c.id,
            cor: c.corInput.value
        })

        if (c.fileInput.files[0]) {
            formData.append(`imagem_${index}`, c.fileInput.files[0])
        }
    })

    formData.append("cores", JSON.stringify(coresPayload))

    const res = await fetch(`/admin/update/${produtoId}`, {
        method: "POST",
        body: formData
    })

    if (res.ok) {
        alert("Produto atualizado com sucesso!")
        window.location.href = "/admin"
    } else {
        alert("Erro ao salvar produto")
    }
})
