#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

if docker ps -a --format '{{.Names}}' | grep -qx dw3postgres; then
  docker start dw3postgres >/dev/null
fi

docker rm -f pastejo_frontend_ctner pastejo_backend_ctner >/dev/null 2>&1 || true

docker build -t pastejo_backend_img:1.0 backend
docker run -d --name pastejo_backend_ctner --env-file backend/.env -p 43000:43000 --restart unless-stopped pastejo_backend_img:1.0

docker build -t pastejo_frontend_img:1.0 frontend
docker run -d --name pastejo_frontend_ctner --env-file frontend/dw3frontend.env -p 43100:43100 --restart unless-stopped pastejo_frontend_img:1.0

docker ps --filter name=pastejo
echo "Pronto! Abra http://localhost:43100 no navegador (usuário: qwe, senha: qwe)."
