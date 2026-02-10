const form = document.getElementById("form-editar-produto")
const coresContainer = document.getElementById("cores-container")
const addCorBtn = document.getElementById("add-cor")
const produtoId = document.getElementById("produto-id").value

const nomeInput = document.getElementById("nome")
const categoriaInput = document.getElementById("categoria")
const valorInput = document.getElementById("valor")

let cores = []
let coresRemovidas = []

/* ===============================
   MAPEAR CORES EXISTENTES
================================ */
document.querySelectorAll(".cor-item").forEach(div => {
    cores.push({
        id: div.dataset.id || null,
        element: div,
        corInput: div.querySelector(".input-cor"),
        fileInput: div.querySelector(".input-imagem"),
        preview: div.querySelector(".preview"),
        previewUrl: null
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
   PREVIEW IMAGEM (SEM MEMORY LEAK)
================================ */
coresContainer.addEventListener("change", e => {
    if (!e.target.classList.contains("input-imagem")) return

    const file = e.target.files[0]
    if (!file) return

    const corItem = e.target.closest(".cor-item")
    const preview = corItem.querySelector(".preview")

    // limpar preview antigo
    if (preview.dataset.url) {
        URL.revokeObjectURL(preview.dataset.url)
    }

    const url = URL.createObjectURL(file)
    preview.src = url
    preview.dataset.url = url
    preview.style.display = "block"
})

/* ===============================
   ADICIONAR NOVA COR
================================ */
addCorBtn.addEventListener("click", () => {
    const div = document.createElement("div")
    div.classList.add("cor-item")

    div.innerHTML = `
        <input type="text" class="input-cor" placeholder="Nome da cor" required>
        <img class="preview" style="display:none">
        <input type="file" class="input-imagem" accept="image/*">
        <button type="button" class="btn-remover">Remover</button>
    `

    coresContainer.appendChild(div)

    cores.push({
        id: null,
        element: div,
        corInput: div.querySelector(".input-cor"),
        fileInput: div.querySelector(".input-imagem"),
        preview: div.querySelector(".preview"),
        previewUrl: null
    })
})

/* ===============================
   SUBMIT
================================ */
form.addEventListener("submit", async e => {
    e.preventDefault()

    const submitBtn = form.querySelector('button[type="submit"]')
    submitBtn.disabled = true
    submitBtn.textContent = "Salvando..."

    try {
        const formData = new FormData()

        // normalizar valor (BR → padrão)

        formData.append("nome", nomeInput.value.trim())
        formData.append("categoria", categoriaInput.value)
        formData.append("valor", valorInput.value.trim())
        formData.append("cores_removidas", JSON.stringify(coresRemovidas))

        const coresPayload = []

        cores.forEach((c, index) => {
            coresPayload.push({
                id: c.id,
                cor: c.corInput.value.trim()
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

        if (!res.ok) throw new Error("Erro ao salvar")

        window.location.href = "/admin"

    } catch (err) {
        alert("Erro ao salvar produto")
        console.error(err)
        submitBtn.disabled = false
        submitBtn.textContent = "Salvar"
    }
})
