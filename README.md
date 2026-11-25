# Pastejo Rotacionado - T3 DW3

Trabalho 3 de Desenvolvimento Web 3 - IFSP Votuporanga.

CRUD das tabelas pasto, piquete, animal e alocado do módulo agrícola de pastejo rotacionado de um ERP.

- Back-end: Node.js + Express + PostgreSQL (porta 43000)
- Front-end: Node.js + Express + Nunjucks (porta 43100)
- Os dois servidores rodam em containers Docker.

## Como rodar

1. Banco: com o PostgreSQL na porta 5432, criar o banco `pastejo` e executar `backend/databaseConfig.sql`.
2. Back-end: em `backend/`, copiar `.env.example` para `.env` e preencher.
3. Na raiz do projeto, criar as imagens e subir os containers:
   ```bash
   docker build -t pastejo_backend_img:1.0 backend
   docker run -d --name pastejo_backend_ctner --env-file backend/.env -p 43000:43000 --restart unless-stopped pastejo_backend_img:1.0
   docker build -t pastejo_frontend_img:1.0 frontend
   docker run -d --name pastejo_frontend_ctner --env-file frontend/dw3frontend.env -p 43100:43100 --restart unless-stopped pastejo_frontend_img:1.0
   ```
4. Acessar http://localhost:43100 (usuário `qwe`, senha `qwe`).

A explicação do código está em [RELATORIO.md](RELATORIO.md).
