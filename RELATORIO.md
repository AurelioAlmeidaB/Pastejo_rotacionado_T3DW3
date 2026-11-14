# Relatório do código — Pastejo Rotacionado (T3 DW3)

Este relatório explica como o sistema está organizado e o que cada parte do código faz.
Serve para estudar para o seminário e para dar contexto a outras ferramentas na hora de melhorar o front-end.

---

## 1. Visão geral

O sistema controla o **pastejo rotacionado** de uma propriedade: os **pastos**, os **piquetes** de cada pasto,
os **animais** e em qual piquete cada animal está **alocado** em cada período.

A arquitetura é **Cliente-Servidor**, igual à vista em aula, com dois servidores em portas separadas:

```
Navegador
   │  http://localhost:43100 (telas)        │  http://localhost:43000 (APIs, com token JWT)
   ▼                                        ▼
pastejo_frontend_ctner  ──────────►  pastejo_backend_ctner  ──────────►  PostgreSQL (banco "pastejo")
(Express + Nunjucks)    o JS da tela  (Express + pg + JWT)    172.17.0.1:5432   (container dw3postgres)
                        chama as APIs
```

- **Back-end** (`backend/`): expõe as APIs REST, valida o token JWT e é o **único** que acessa o banco.
- **Front-end** (`frontend/`): entrega as páginas HTML. O JavaScript de cada página chama as APIs do back-end com `fetch`.
  O front-end **nunca** acessa o banco.
- Os dois rodam em **containers Docker**.

---

## 2. Banco de dados

Script: `backend/databaseConfig.sql` (cria as tabelas e insere dados de exemplo; pode ser executado mais de uma vez).

| Tabela | Campos | Observação |
|---|---|---|
| `pasto` | `pastoid`, `descricao` (texto), `areatotal` (decimal), `removido` | |
| `piquete` | `piqueteid`, `descricao`, `latitude` (decimal), `longitude` (decimal), `pastoidfk`, `removido` | `pastoidfk` → `pasto` |
| `animal` | `animalid`, `nome`, `datanasc` (data), `removido` | |
| `alocado` | `alocadoid`, `animalidifk`, `piqueteidfk`, `datainicio` (data), `datafinal` (data, pode ficar vazia), `removido` | tabela do relacionamento N:N |
| `usuarios` | `usuarioid`, `username`, `password` (bcrypt), `removido` | tabela de login (não conta como tabela do trabalho) |

Relacionamentos (como no DER do professor):

- **pasto 1:N piquete** — um pasto possui vários piquetes.
- **animal N:N piquete** — resolvido pela tabela **alocado**: um animal é alocado em vários piquetes ao longo do
  tempo, e um piquete recebe vários animais. Uma alocação com `datafinal` vazia significa que o animal **ainda está** no piquete.

Todas as tabelas têm o campo **`removido`** (padrão `false`), usado no **soft delete**: o registro nunca é apagado
fisicamente, só passa a ter `removido = true`. Os nomes dos campos seguem exatamente o modelo relacional do enunciado
(inclusive `animalidifk`).

Usuários de teste: `qwe` / `qwe` e `admin` / `admin`. As senhas ficam criptografadas com `crypt(..., gen_salt('bf'))` (bcrypt).

---

## 3. Estrutura de pastas

```
backend/
  app.js                       servidor Express: CORS, leitura do JSON e rotas
  .env / .env.example          configurações (porta, chave do JWT, dados do banco) — o .env não vai para o GitHub
  database/databaseconfig.js   conexão com o PostgreSQL (pool do pacote pg)
  routes/router.js             todas as rotas das APIs
  apps/
    login/      model, controller, tests   login, logout e verificação do JWT
    pastos/     model, controller, tests
    piquetes/   model, controller, tests
    animais/    model, controller, tests
    alocados/   model, controller, tests
  Dockerfile, .dockerignore
frontend/
  app.js                       servidor Express + Nunjucks (templates)
  dw3frontend.env              porta do front e endereço do back-end
  routes/                      rtIndex, rtLogin, rtHome, rtPastos, rtPiquetes, rtAnimais, rtAlocados
  views/                       layout.njk (menu), login.njk, home.njk, error.njk
  public/js/dw3frontend.js     funções usadas por todas as telas
  public/stylesheets/style.css estilos
  apps/
    login/vwLogin.js           lógica do login e do logout
    home/vwHome.js             verifica se o usuário está logado
    pastos/ piquetes/ animais/ alocados/
        vwLstXxx.njk + vwLstXxx.js     tela de lista (tabela)
        vwFormXxx.njk + vwFormXxx.js   tela de formulário (inserir, ver, atualizar, remover)
  Dockerfile, .dockerignore
subir-docker.sh                cria as imagens e sobe os dois containers
```

O padrão é o mesmo da apostila: cada módulo tem sua própria pasta dentro de `apps/` (estilo Django), com
**model** (SQL), **controller** (recebe a requisição e responde JSON) e **tests** (arquivos `.rest`).

---

## 4. Back-end

### 4.1 `app.js`

1. Carrega as variáveis do `.env` com `dotenv`.
2. Configura o **CORS**: libera o navegador a chamar a API vinda de outra porta (o front está na 43100 e o back na 43000).
   Também responde às requisições `OPTIONS` que o navegador faz antes de um `POST`/`PUT`/`DELETE`.
3. `bodyParser` e `express.json()` transformam o corpo JSON da requisição em `req.body`.
4. `app.use(router)` liga as rotas de `routes/router.js`.
5. `app.listen` inicia o servidor na porta do `.env` (43000).

### 4.2 `database/databaseconfig.js`

Cria um **pool** de conexões do pacote `pg` com os dados do `.env` (`DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASS`, `DB_PORT`)
e exporta a função `query(texto, parametros)`, usada por todos os models. Os parâmetros `$1, $2...` evitam SQL injection.

### 4.3 `routes/router.js` e a proteção JWT

Cada rota liga um caminho + verbo HTTP a uma função do controller. Todas as rotas de CRUD passam primeiro pelo
middleware **`appLogin.AutenticaJWT`**; só `/Login` e `/Logout` ficam abertas.

```js
routerApp.get("/getAllPastos", appLogin.AutenticaJWT, appPastos.GetAllPastos);
```

### 4.4 Módulo de login (`apps/login`)

- **`mdlLogin.GetCredencial(username)`** — busca o usuário e a senha criptografada na tabela `usuarios`.
- **`ctlLogin.Login`** — recebe `{ UserName, Password }`, compara a senha com `bcrypt.compareSync` e, se estiver certa,
  gera um token com `jwt.sign({ username }, SECRET_API, { expiresIn: 2 horas })`. Responde `{ auth: true, token, username }`.
  Senha errada ou usuário inexistente → status 403.
- **`ctlLogin.AutenticaJWT`** — middleware: lê o cabeçalho `Authorization: Bearer <token>` e valida com `jwt.verify`.
  Sem token ou token inválido/expirado → responde `{ auth: false, message: ... }` e a API não é executada.
  Token válido → chama `next()` e segue para o controller.
- **`ctlLogin.Logout`** — responde `{ auth: false, token: null }`; o front-end apaga o token guardado.

### 4.5 Padrão dos módulos (model + controller)

Os 4 módulos seguem exatamente o mesmo formato. Exemplo com **Pasto**:

**Model** (`apps/pastos/model/mdlPastos.js`) — só SQL:

| Função | O que faz |
|---|---|
| `GetAllPastos()` | `SELECT` de todos com `removido = false` |
| `GetPastoByID(id)` | `SELECT` pelo ID, também só com `removido = false` |
| `InsertPasto(registro)` | `INSERT ... values(default, $1, $2, false)` |
| `UpdatePasto(id, registro)` | `UPDATE ... WHERE pastoid = $1 and removido = false` |
| `DeletePasto(id)` | **soft delete**: `UPDATE pasto SET removido = true` |

Insert, Update e Delete devolvem `{ msg, linhasAfetadas }`: `msg` é `"ok"` ou a mensagem de erro do banco
(capturada no `try/catch`, ex.: chave estrangeira inválida), e `linhasAfetadas` diz quantas linhas mudaram.

**Controller** (`apps/pastos/controller/ctlPastos.js`) — pega os dados da requisição (`req.params.pastoid`,
`request.body`), chama o model e responde JSON:

- GetAll/GetByID → `{ status: "ok", registro: [...] }`
- Insert/Update/Delete → `{ status: msg, linhasAfetadas: n }`

Nos módulos com data (animais e alocados), a função **`formataData`** do controller corta a parte da hora
(`2026-10-01T03:00:00.000Z` → `2026-10-01`) antes de responder.

**Regras de negócio no Delete** (para não deixar registros "órfãos"):

- Pasto com piquetes ativos não pode ser removido.
- Piquete com alocação **em andamento** (sem data final) não pode ser removido.
- Animal com alocação **em andamento** não pode ser removido.

Alocações já encerradas não impedem a remoção: elas continuam no histórico (a lista de alocações mostra o nome do
animal/piquete mesmo depois de removido, e o formulário mostra a opção marcada como "(removido)").

**Regras de negócio da alocação** (função `ValidaAlocado` em `mdlAlocados.js`, usada no Insert e no Update):

- a data final não pode ser menor que a data de início;
- o mesmo animal não pode estar em dois piquetes ao mesmo tempo (períodos que se sobrepõem).

Nesses casos o model devolve `linhasAfetadas: 0` e uma mensagem explicando o motivo, que a tela mostra ao usuário.
Erros do banco (por exemplo, valor inválido ou chave estrangeira inexistente) também voltam em `status`.

**Joins**: `GetAllPiquetes` traz junto o nome do pasto (`pastodescricao`) e `GetAllAlocados` traz o nome do animal
(`animalnome`) e do piquete (`piquetedescricao`), para a tabela da tela mostrar nomes em vez de números.

### 4.6 Todas as APIs (22)

| Tabela | GetAll | GetByID | Insert | Update | Delete |
|---|---|---|---|---|---|
| pasto | `GET /getAllPastos` | `GET /getPastoByID/:pastoid` | `POST /insertPasto` | `PUT /updatePasto/:pastoid` | `DELETE /deletePasto/:pastoid` |
| piquete | `GET /getAllPiquetes` | `GET /getPiqueteByID/:piqueteid` | `POST /insertPiquete` | `PUT /updatePiquete/:piqueteid` | `DELETE /deletePiquete/:piqueteid` |
| animal | `GET /getAllAnimais` | `GET /getAnimalByID/:animalid` | `POST /insertAnimal` | `PUT /updateAnimal/:animalid` | `DELETE /deleteAnimal/:animalid` |
| alocado | `GET /getAllAlocados` | `GET /getAlocadoByID/:alocadoid` | `POST /insertAlocado` | `PUT /updateAlocado/:alocadoid` | `DELETE /deleteAlocado/:alocadoid` |

APIs de apoio para os campos de seleção (como a `getCursosToAlunos` da apostila):

- `GET /getPastosToPiquetes` — pastos para o select do formulário de piquetes.
- `GET /getAnimaisToAlocados` e `GET /getPiquetesToAlocados` — animais e piquetes para o formulário de alocações.

Mais `POST /Login` e `POST /Logout`.

Corpo JSON esperado no Insert/Update:

```json
pasto:   { "descricao": "Pasto da Represa", "areatotal": 18.75 }
piquete: { "descricao": "Piquete 3", "latitude": -20.4245, "longitude": -49.9801, "pastoidfk": 1 }
animal:  { "nome": "Malhada", "datanasc": "2023-02-14" }
alocado: { "animalidifk": 3, "piqueteidfk": 4, "datainicio": "2026-11-01", "datafinal": null }
```

### 4.7 Testes (`apps/*/tests/*.rest`)

Usados com a extensão **REST Client** do VSCode. O primeiro bloco faz o login e guarda o token em `@accessToken`;
os outros chamam cada API com `Authorization: Bearer {{accessToken}}`. Clique em **Send Request** acima de cada teste.

---

## 5. Front-end

### 5.1 `app.js`, rotas e templates

- O Express usa o **Nunjucks** como motor de templates e procura as telas em `views/` e em `apps/`.
- `express.static` publica `public/` (CSS e `dw3frontend.js`) e `apps/` (o JS de cada tela).
- Cada arquivo em `routes/` abre uma tela e passa variáveis para ela. Exemplo `rtPastos.js`:
  `GET /pastos` → `pastos/vwLstPastos.njk` e `GET /pastos/form` → `pastos/vwFormPastos.njk`.
  A variável `servidorDw3` leva o endereço do back-end para dentro do HTML (atributo `data-servidor-dw3`),
  porque o JavaScript do navegador não tem acesso ao arquivo `.env`.
- `views/layout.njk` é o "molde" de todas as páginas: menu (Pastos, Piquetes, Animais, Alocações, Sair) e o Bootstrap.
  As outras telas usam `{% extends "layout.njk" %}`.

### 5.2 Login, token e logout

- `apps/login/vwLogin.js`: no envio do formulário faz `POST /Login`. Se der certo, guarda o **JWT no `localStorage`**
  (`token`), o nome do usuário (`username`) e cria o **cookie `IsLogged`** com validade de 2 horas, o mesmo tempo
  do JWT; depois vai para `/home`.
- Ao abrir a tela de login (também pelo menu **Sair**), a função **`vwLogout`** chama `POST /Logout`, apaga o token e o cookie.

### 5.3 `public/js/dw3frontend.js` (funções comuns)

| Função | O que faz |
|---|---|
| `dw3IsLogged()` | se o cookie `IsLogged` não existir, manda para `/login` |
| `dw3ClearIsLoggedCookie()` | apaga o cookie `IsLogged` |
| `dw3MontarHeadersAutenticacao(headers)` | acrescenta `Authorization: Bearer <token>` nas requisições |
| `dw3OcultarBotao(id)` | esconde um botão |
| `dw3SessaoExpirada()` | quando a API responde `auth: false` (JWT vencido ou inválido), apaga o token e o cookie, avisa e volta para o login |

### 5.4 Tela de lista (`vwLstXxx.js`)

1. Verifica se o usuário está logado.
2. **`vwGetAllXxx`** chama a API `getAllXxx` e monta a tabela com o **DataTables** (pesquisa, ordenação e paginação em português).
3. Cada linha tem os botões **Visualizar**, **Atualizar** e **Remover**, que abrem o formulário com o parâmetro `oper`
   (`Re`, `Up` ou `De`) e o ID do registro na URL. O botão "Incluir" abre com `oper=Cr`.

### 5.5 Tela de formulário (`vwFormXxx.js`)

O mesmo formulário serve para as 4 operações, conforme o `oper` da URL:

| oper | O que acontece |
|---|---|
| `Cr` | mostra o botão **Inserir** → `vwInsertXxx()` → `POST /insertXxx` |
| `Re` | bloqueia os campos e carrega o registro com `vwGetXxxByID()` → `GET /getXxxByID/:id` |
| `Up` | carrega o registro e mostra **Atualizar** → `vwUpdateXxx()` → `PUT /updateXxx/:id` |
| `De` | bloqueia os campos, carrega o registro e mostra **Remover** → confirmação → `vwDeleteXxx()` → `DELETE /deleteXxx/:id` |

Funções auxiliares em cada formulário: `bloquearCamposXxx` (deixa os campos só leitura), `montarXxxDoFormulario`
(monta o JSON enviado à API), `obterXxxIdDaUrl` (pega e valida o ID da URL) e `enviarRequisicaoXxx`
(faz o `fetch` e trata erro de servidor, token expirado e `status` diferente de `"ok"`).

Os formulários de **piquete** e **alocação** usam o **Select2** para escolher pasto, animal e piquete
(`carregarPastosToPiquetes`, `carregarAnimaisToAlocados`, `carregarPiquetesToAlocados`). O de alocação ainda
impede que a data final seja menor que a data de início.

### 5.6 Função do front-end para cada API

| API | Função no front-end |
|---|---|
| getAll / getByID / insert / update / delete **Pastos** | `vwGetAllPastos`, `vwGetPastoByID`, `vwInsertPasto`, `vwUpdatePasto`, `vwDeletePasto` |
| ... **Piquetes** | `vwGetAllPiquetes`, `vwGetPiqueteByID`, `vwInsertPiquete`, `vwUpdatePiquete`, `vwDeletePiquete` |
| ... **Animais** | `vwGetAllAnimais`, `vwGetAnimalByID`, `vwInsertAnimal`, `vwUpdateAnimal`, `vwDeleteAnimal` |
| ... **Alocados** | `vwGetAllAlocados`, `vwGetAlocadoByID`, `vwInsertAlocado`, `vwUpdateAlocado`, `vwDeleteAlocado` |
| getPastosToPiquetes / getAnimaisToAlocados / getPiquetesToAlocados | `carregarPastosToPiquetes`, `carregarAnimaisToAlocados`, `carregarPiquetesToAlocados` |
| Login / Logout | `vwLogin.js` (envio do formulário) / `vwLogout` |

---

## 6. Docker

Cada servidor tem um **`Dockerfile`** (igual ao do capítulo 4 da apostila):

```dockerfile
FROM node:24-bookworm-slim          # imagem base com Node 24
ENV NODE_ENV=production
WORKDIR /app                        # pasta do código dentro do container
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force   # instala as dependências
COPY --chown=node:node . .          # copia o código
USER node                           # não roda como root
EXPOSE 43000                        # (43100 no front-end)
CMD ["node", "app.js"]              # inicia o servidor
```

O **`.dockerignore`** impede que `node_modules`, `.git` e os arquivos `.env` entrem na imagem. As configurações são
passadas só na hora de rodar, com `--env-file`.

O **`subir-docker.sh`** faz:

```bash
docker build -t pastejo_backend_img:1.0 .                     # cria a imagem do back-end
docker run -d --name pastejo_backend_ctner --env-file .env \
  -p 43000:43000 --restart unless-stopped pastejo_backend_img:1.0
docker build -t pastejo_frontend_img:1.0 .                    # cria a imagem do front-end
docker run -d --name pastejo_frontend_ctner --env-file dw3frontend.env \
  -p 43100:43100 --restart unless-stopped pastejo_frontend_img:1.0
```

Dois detalhes importantes de endereço:

- `DB_HOST=172.17.0.1` no `.env` do back-end: dentro do container, `localhost` é o próprio container; `172.17.0.1`
  é o computador hospedeiro, onde o PostgreSQL está publicado na porta 5432.
- `SERVIDOR_DW3=http://localhost:43000` no `dw3frontend.env`: quem usa esse endereço é o **navegador**, por isso é `localhost`.

Comandos úteis: `docker ps` (containers rodando), `docker logs pastejo_backend_ctner` (mensagens do servidor),
`docker stop` / `docker start` (parar / ligar). Depois de alterar o código, rode `bash subir-docker.sh` de novo
(a imagem não muda sozinha).

---

## 7. Requisitos do trabalho e onde estão atendidos

| Requisito | Onde |
|---|---|
| Cliente-Servidor, portas separadas | back-end 43000, front-end 43100 |
| Dados em SGBD | PostgreSQL, banco `pastejo` |
| 4 tabelas do DER + `removido` em todas | `backend/databaseConfig.sql` |
| Campos texto, decimal e data | `descricao`/`nome`, `areatotal`/`latitude`, `datanasc`/`datainicio` |
| Tabela de login | `usuarios` |
| 5 APIs por tabela (soft delete no Delete) | `backend/apps/*/model` e `controller`, `routes/router.js` |
| Rotas protegidas por JWT | middleware `AutenticaJWT` em todas as rotas de CRUD |
| Tela de login | `frontend/views/login.njk` + `apps/login/vwLogin.js` |
| JWT guardado após o login | `localStorage` (`token`, `username`) + cookie `IsLogged` |
| 5 funções no front-end por tabela | `vwGetAll`, `vwGetByID`, `vwInsert`, `vwUpdate`, `vwDelete` em cada `apps/*` |
| Front-end sem acesso ao banco | o front-end só usa `fetch` para as APIs |
| Os dois servidores em Docker | `Dockerfile` + `.dockerignore` em cada pasta, `subir-docker.sh` |
| `.gitignore` | ignora `node_modules` e os `.env` |

---

## 8. Como rodar

1. PostgreSQL rodando na porta 5432 (ex.: container `dw3postgres`).
2. Criar o banco e as tabelas:
   ```bash
   docker exec dw3postgres psql -U postgres -c "create database pastejo;"
   docker exec -i dw3postgres psql -U postgres -d pastejo < backend/databaseConfig.sql
   ```
3. Em `backend/`, copiar `.env.example` para `.env` e preencher `DB_USER`, `DB_PASS` e `SECRET_API`.
4. Na raiz: `bash subir-docker.sh`
5. Abrir http://localhost:43100 e entrar com `qwe` / `qwe`.

---

## 9. Para continuar o front-end com outras ferramentas

O front-end atual é básico e segue o modelo da aula. Para melhorar o visual sem quebrar nada, mantenha:

- os **nomes das funções** `vwGetAll...`, `vwGet...ByID`, `vwInsert...`, `vwUpdate...`, `vwDelete...` (o trabalho exige uma por API);
- o uso de `dw3MontarHeadersAutenticacao()` em toda chamada às APIs (senão o back-end recusa por falta de token);
- os **ids dos campos** iguais aos nomes das colunas (`descricao`, `areatotal`, `pastoidfk`, `animalidifk`, ...), porque
  `montarXxxDoFormulario` e `vwGetXxxByID` dependem deles;
- o formato das respostas da API (seção 4.5) e o fluxo `oper=Cr/Re/Up/De`;
- o `<script src="/js/dw3frontend.js">` em todas as páginas que precisam de login;
- depois de qualquer mudança, recriar os containers com `bash subir-docker.sh`.

Ideias de melhoria visual: cards com totais na tela inicial (pastos, piquetes, animais, alocações em andamento),
filtro "só alocações em andamento", mapa dos piquetes usando latitude/longitude, ícones no menu.
