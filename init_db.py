import sqlite3

con = sqlite3.connect("database.db")
cur = con.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    categoria TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS produto_cores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    produto_id INTEGER NOT NULL,
    cor TEXT NOT NULL,
    imagem TEXT NOT NULL,
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
)
""")

con.commit()
con.close()

print("Banco criado com sucesso!")
