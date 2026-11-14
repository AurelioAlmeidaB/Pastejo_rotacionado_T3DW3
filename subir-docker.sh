#!/usr/bin/env bash
# Cria as imagens e sobe os containers do Pastejo Rotacionado (capítulo 4 da apostila).
#   pastejo_backend_ctner  -> servidor backend  (porta 43000)
#   pastejo_frontend_ctner -> servidor frontend (porta 43100)
# O banco PostgreSQL deve estar rodando na porta 5432 com o banco "pastejo" criado.
# Uso: bash subir-docker.sh
set -e
cd "$(dirname "$0")"

echo ">> Removendo containers antigos (se existirem)..."
docker rm -f pastejo_frontend_ctner pastejo_backend_ctner >/dev/null 2>&1 || true

echo ">> Criando e executando o backend..."
cd backend
docker build -t pastejo_backend_img:1.0 .
docker run -d --name pastejo_backend_ctner --env-file .env -p 43000:43000 --restart unless-stopped pastejo_backend_img:1.0
cd ..

echo ">> Criando e executando o frontend..."
cd frontend
docker build -t pastejo_frontend_img:1.0 .
docker run -d --name pastejo_frontend_ctner --env-file dw3frontend.env -p 43100:43100 --restart unless-stopped pastejo_frontend_img:1.0
cd ..

docker ps --filter name=pastejo
echo "Pronto! Abra http://localhost:43100 no navegador (usuário: qwe, senha: qwe)."
