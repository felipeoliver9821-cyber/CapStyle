from flask import Flask, render_template, request, redirect, url_for, abort, jsonify, session, flash
import json
from PIL import Image, ImageDraw, ImageFont
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import os
import uuid
import datetime
import io
import cloudinary
import cloudinary.uploader

# ================= ENV =================
load_dotenv()

# ================= CONFIG =================
basedir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = os.path.join(basedir, 'static/uploads')
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

TEMP_FOLDER = os.path.join(basedir, "temp")
os.makedirs(TEMP_FOLDER, exist_ok=True)

# ---------- BANCO DE DADOS (POSTGRESQL RAILWAY / LOCAL) ----------
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    # Corrige postgres:// → postgresql:// (Railway)
    app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL.replace(
        "postgres://", "postgresql://"
    )
else:
    # Fallback local
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///capstyle.db"

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# ====== SESSÃO ======
app.secret_key = os.getenv("SECRET_KEY", "uma_chave_qualquer_aqui")

db = SQLAlchemy(app)
migrate = Migrate(app, db)

# ================= CLOUDINARY =================
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

# ================= MODELS =================
class Produto(db.Model):
    __tablename__ = "produtos"
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    categoria = db.Column(db.String(50), nullable=False)
    valor = db.Column(db.Float, nullable=False, default=0.0)  # NOVO CAMPO
    cores = db.relationship(
        "ProdutoCor",
        backref="produto",
        cascade="all, delete-orphan"
    )

class ProdutoCor(db.Model):
    __tablename__ = "produto_cores"
    id = db.Column(db.Integer, primary_key=True)
    produto_id = db.Column(db.Integer, db.ForeignKey("produtos.id"), nullable=False)
    cor = db.Column(db.String(50), nullable=False)
    imagem = db.Column(db.String(200), nullable=False)

class Orcamento(db.Model):
    __tablename__ = "orcamentos"
    id = db.Column(db.String(4), primary_key=True)
    cliente = db.Column(db.String(100), nullable=False)
    endereco = db.Column(db.String(200), nullable=False)
    arquivo_imagem = db.Column(db.String(500), nullable=False)
    criado_em = db.Column(db.DateTime, default=datetime.datetime.utcnow)

# ================= CRIA BANCO =================
with app.app_context():
    db.create_all()

# ================= FUNÇÕES AUXILIARES =================
def carregar_produtos():
    produtos = {}
    for produto in Produto.query.all():
        if produto.categoria not in produtos:
            produtos[produto.categoria] = []
        produtos[produto.categoria].append({
            "id": produto.id,
            "nome": produto.nome,
            "categoria": produto.categoria,
            "valor": produto.valor,  # ADICIONADO
            "cores": [{"cor": c.cor, "imagem": c.imagem} for c in produto.cores]
        })
    return produtos


def gerar_id_orcamento():
    while True:
        ultimo = Orcamento.query.order_by(Orcamento.criado_em.desc()).first()

        if not ultimo:
            novo_id = "A001"
        else:
            letra = ultimo.id[0]
            numero = int(ultimo.id[1:]) + 1
            if numero > 999:
                letra = chr(ord(letra) + 1)
                numero = 1
            novo_id = f"{letra}{str(numero).zfill(3)}"

        if not Orcamento.query.get(novo_id):
            return novo_id

# ================= FUNÇÃO DE IMAGEM =================
def gerar_imagem_orcamento(
    id_pedido,
    cliente,
    endereco,
    cidade,
    telefone,
    itens,
    caminho_layout="static/images/orcamento.png",
    caminho_saida="orcamento_final.png"
):
    imagem = Image.open(caminho_layout).convert("RGBA")
    draw = ImageDraw.Draw(imagem)

    # ================= FONTES =================
    try:
        fonte_regular = ImageFont.truetype(os.path.join(basedir, "static/fonts/Inter-Regular.ttf"), 30)
        fonte_pequena  = ImageFont.truetype(os.path.join(basedir, "static/fonts/Inter-Medium.ttf"), 26)
        fonte_codigo   = ImageFont.truetype(os.path.join(basedir, "static/fonts/Montserrat-Bold.ttf"), 28)
    except Exception as e:
        print("Não foi possível carregar fontes customizadas, usando padrão:", e)
        fonte_regular = fonte_pequena = fonte_codigo = ImageFont.load_default()

    cor = (0, 51, 102)

    # Data e código
    data_atual = datetime.datetime.now().strftime("%d/%m/%Y")
    draw.text((800, 400), data_atual, fill=cor, font=fonte_regular)
    draw.text((163, 358), f"Código: {id_pedido}", fill=cor, font=fonte_codigo)

    # Dados do cliente
    draw.text((238, 493), cliente,  fill=cor, font=fonte_regular)
    draw.text((252, 550), endereco, fill=cor, font=fonte_regular)
    draw.text((235, 610), cidade,   fill=cor, font=fonte_regular)
    draw.text((252, 667), telefone, fill=cor, font=fonte_regular)

    # Itens
    y_inicial = 855
    altura_linha = 36

    for index, item in enumerate(itens):
        y = y_inicial + index * altura_linha
        draw.text((180, y), str(item.get("produto", "")), fill=cor, font=fonte_pequena)
        draw.text((471, y), str(item.get("quantidade", "")), fill=cor, font=fonte_pequena)
        draw.text((650, y), str(item.get("cor", "")), fill=cor, font=fonte_pequena)
        draw.text((821, y), f"R$ {item.get('subtotal', 0):.2f}", fill=cor, font=fonte_pequena)

    # ---------------- TOTAL FINAL ----------------
    total_final = sum(item.get("subtotal", 0) for item in itens)
    draw.text((807, 1400), f"R$ {total_final:.2f}", fill=cor, font=fonte_codigo)

    # Salva imagem final
    imagem.save(caminho_saida)
    return caminho_saida


# ================= CLOUDINARY WRAPPER =================
def gerar_imagem_orcamento_cloudinary(id_pedido, cliente, endereco, itens):
    cidade = ""
    telefone = ""

    caminho_local = os.path.join(TEMP_FOLDER, f"{id_pedido}.png")

    gerar_imagem_orcamento(
        id_pedido=id_pedido,
        cliente=cliente,
        endereco=endereco,
        cidade=cidade,
        telefone=telefone,
        itens=itens,
        caminho_saida=caminho_local,
    )

    upload = cloudinary.uploader.upload(
        caminho_local,
        folder="orcamentos",
        public_id=id_pedido,
        overwrite=True
    )

    return upload["secure_url"]

# ================= ROTAS =================
@app.route("/")
def home():
    return render_template("home.html", produtos=carregar_produtos())

@app.route("/pedido")
def pedido():
    return render_template("pedido.html", produtos=carregar_produtos())

@app.route("/pedido/gerar", methods=["POST"])
def gerar_pedido():
    dados = request.get_json()

    cliente = dados.get("cliente", "").strip()
    endereco = dados.get("endereco", "").strip()
    itens = dados.get("itens", [])

    if not cliente or not endereco or not itens:
        return jsonify({"erro": "Dados incompletos"}), 400

    id_orcamento = gerar_id_orcamento()
    link = gerar_imagem_orcamento_cloudinary(id_orcamento, cliente, endereco, itens)

    novo = Orcamento(
        id=id_orcamento,
        cliente=cliente,
        endereco=endereco,
        arquivo_imagem=link
    )
    db.session.add(novo)
    db.session.commit()

    return jsonify({"status": "ok", "id": id_orcamento, "link": link})

@app.route("/pedido/enviar/<id_orcamento>", methods=["POST"])
def enviar_orcamento(id_orcamento):
    orc = Orcamento.query.get(id_orcamento)
    if not orc:
        return jsonify({"erro": "Orçamento não encontrado"}), 404

    db.session.delete(orc)
    db.session.commit()
    return jsonify({"status": "ok"})

# ================= ADMIN LOGIN =================
@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    if request.method == "POST":
        usuario = request.form.get("usuario")
        senha = request.form.get("senha")

        # Usuário e senha do admin
        admin_user = os.getenv("ADMIN_USER")
        admin_pass = os.getenv("ADMIN_PASS")

        if usuario == admin_user and senha == admin_pass:
            session["admin_logado"] = True
            return redirect(url_for("admin"))
        else:
            flash("Usuário ou senha incorretos", "erro")
            return redirect(url_for("admin_login"))

    return render_template("logar.html")

@app.route("/admin/logout")
def admin_logout():
    session.pop("admin_logado", None)
    return redirect(url_for("home"))

# ================= ADMIN =================
@app.route("/admin")
def admin():
    if not session.get("admin_logado"):
        return redirect(url_for("admin_login"))
    
    produtos = Produto.query.all()
    return render_template("admin.html", itens=produtos)

@app.route("/admin/add", methods=["GET", "POST"])
def admin_add_produto():
    if not session.get("admin_logado"):
        return redirect(url_for("admin_login"))

    if request.method == "GET":
        return render_template("add.html")

    nome = request.form.get("nome")
    categoria = request.form.get("categoria")
    valor = request.form.get("valor", "0").replace(",", ".")  # permite vírgula
    try:
        valor = float(valor)
    except:
        valor = 0.0

    produto = Produto(nome=nome, categoria=categoria, valor=valor)
    db.session.add(produto)
    db.session.commit()


    for key in request.form:
        if key.startswith("cor_"):
            index = key.split("_")[1]
            cor = request.form.get(key)
            imagem = request.files.get(f"imagem_{index}")

            if imagem and imagem.filename:
                filename = f"{uuid.uuid4().hex}_{secure_filename(imagem.filename)}"
                imagem.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))

                db.session.add(
                    ProdutoCor(
                        produto_id=produto.id,
                        cor=cor,
                        imagem=filename
                    )
                )

    db.session.commit()
    return redirect(url_for("admin"))

@app.route("/admin/edit/<int:id>")
def admin_edit_produto(id):
    if not session.get("admin_logado"):
        return redirect(url_for("admin_login"))

    produto = Produto.query.get_or_404(id)
    return render_template("edit.html", item=produto)

@app.route("/admin/update/<int:id>", methods=["POST"])
def admin_update_produto(id):
    if not session.get("admin_logado"):
        return redirect(url_for("admin_login"))

    produto = Produto.query.get_or_404(id)

    produto.nome = request.form.get("nome")
    produto.categoria = request.form.get("categoria")
    valor = request.form.get("valor", "0").replace(",", ".")
    try:
        produto.valor = float(valor)
    except:
        produto.valor = 0.0


    cores_removidas = request.form.get("cores_removidas")
    if cores_removidas:
        ids = json.loads(cores_removidas)
        for cid in ids:
            cor = ProdutoCor.query.get(cid)
            if cor:
                caminho = os.path.join(app.config["UPLOAD_FOLDER"], cor.imagem)
                if os.path.exists(caminho):
                    os.remove(caminho)
                db.session.delete(cor)

    cores = json.loads(request.form.get("cores", "[]"))

    for index, c in enumerate(cores):
        cor_nome = c.get("cor")
        cor_id = c.get("id")
        imagem_file = request.files.get(f"imagem_{index}")

        if cor_id:
            cor_obj = ProdutoCor.query.get(cor_id)
            cor_obj.cor = cor_nome
            if imagem_file:
                filename = f"{uuid.uuid4().hex}_{secure_filename(imagem_file.filename)}"
                imagem_file.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))
                cor_obj.imagem = filename
        else:
            if imagem_file:
                filename = f"{uuid.uuid4().hex}_{secure_filename(imagem_file.filename)}"
                imagem_file.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))
                db.session.add(
                    ProdutoCor(
                        produto_id=produto.id,
                        cor=cor_nome,
                        imagem=filename
                    )
                )
@app.route("/admin/delete/<int:id>")
def admin_delete_produto(id):
    if not session.get("admin_logado"):
        return redirect(url_for("admin_login"))

    produto = Produto.query.get_or_404(id)

    # Apagar imagens das cores
    for cor in produto.cores:
        caminho = os.path.join(app.config["UPLOAD_FOLDER"], cor.imagem)
        if os.path.exists(caminho):
            os.remove(caminho)
        db.session.delete(cor)

    # Apagar o produto
    db.session.delete(produto)
    db.session.commit()

    flash(f"Produto '{produto.nome}' excluído com sucesso!", "sucesso")
    return redirect(url_for("admin"))


# ================= MAIN =================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(debug=True, host="0.0.0.0", port=port)
