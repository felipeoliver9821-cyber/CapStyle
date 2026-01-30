document.addEventListener("DOMContentLoaded", function () {

    const inputImagem = document.getElementById("input-imagem");
    const previewImg = document.getElementById("preview-img");

    if (!inputImagem || !previewImg) return;

    inputImagem.addEventListener("change", function () {
        const file = this.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = function (e) {
            previewImg.src = e.target.result;
            previewImg.style.display = "block";
        };

        reader.readAsDataURL(file);
    });

});
