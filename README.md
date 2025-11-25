# Guia de Instalação e Execução Local

Este guia irá orientá-lo na configuração e execução do projeto em seu ambiente local.

## Pré-requisitos

Certifique-se de ter as seguintes ferramentas instaladas:

- **Node.js** (v16 ou superior) - https://nodejs.org/en/download
- **NPM** (geralmente vem com o Node.js)
- **PostgreSQL** e **pgAdmin** (para gerenciamento do banco de dados) - https://www.postgresql.org/download/
- **VSCode** (ou seu editor de código preferido)

## 1. Download do Projeto

Faça o download do repositório do projeto através do GitHub:

1. Acesse a página do repositório no GitHub
2. Clique no botão verde **"Code"**
3. Selecione **"Download ZIP"**
4. Extraia o arquivo ZIP em uma pasta de sua preferência
5. Abra a pasta do projeto no VSCode

## 2. Configuração do Banco de Dados

### Criar o banco de dados no PostgreSQL:

1. Abra o **pgAdmin**
2. Conecte-se ao seu servidor PostgreSQL
3. Clique com o botão direito em **"Databases"** e selecione **"Create" > "Database"**
4. Defina um nome para o banco de dados (você usará esse nome no arquivo `.env`)
5. Clique em **"Save"**

## 3. Configuração das Variáveis de Ambiente

Você precisará criar dois arquivos `.env`, um para o front-end e outro para o back-end.

### Front-end (`/client/.env`)

Crie um arquivo chamado `.env` dentro da pasta `/client` com o seguinte conteúdo:

```dotenv
VITE_API_URL=http://localhost:3000
```

### Back-end (`/server/.env`)

Crie um arquivo chamado `.env` dentro da pasta `/server` com o seguinte conteúdo:

```dotenv
DB_CONNECTION=pgsql
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=nome_do_seu_banco
DB_USERNAME=postgres
DB_PASSWORD=sua_senha_do_postgres
JWT_SECRET=naoseinaoseinaoseinaoseinaoseinaoseinaoseinaosei
CORS_ORIGIN=http://localhost:5173
```

**Importante:** Substitua `nome_do_seu_banco` e `sua_senha_do_postgres` pelos valores que você configurou no PostgreSQL.

## 4. Instalação e Execução

**ATENÇÃO:** Você precisará abrir **DOIS TERMINAIS** separados no VSCode, um para o back-end e outro para o front-end.

### Terminal 1 - Back-end

Abra um terminal no VSCode e navegue até a pasta do servidor:

```bash
cd server
```

Execute os seguintes comandos na ordem:

```bash
# Instalar as dependências
npm i

# Executar as migrações do banco de dados
npm run migration:run

# Inicializar o servidor
npm run start:dev
```

O servidor estará rodando em `http://localhost:3000`

### Terminal 2 - Front-end

Abra um **NOVO TERMINAL** no VSCode (mantenha o anterior rodando!) e navegue até a pasta do cliente:

```bash
cd client
```

Execute os seguintes comandos na ordem:

```bash
# Instalar o Bun globalmente
npm install -g bun

# Instalar as dependências do projeto
bun i

# Inicializar o front-end
bun dev
```

O front-end estará rodando em `http://localhost:5173`

## 5. Acessar o Projeto

Após seguir todos os passos acima, abra seu navegador e acesse:

```
http://localhost:5173
```

Pronto! O projeto está rodando localmente. 🎉

## Estrutura do Projeto

```
📂 Locaz/
├── 📂 client/          # Front-end (ReactJS + Bun)
│   ├── .env           # Variáveis de ambiente do front
│   └── ...
└── 📂 server/          # Back-end (NodeJS + TypeORM)
    ├── .env           # Variáveis de ambiente do back
    └── ...
```

## Problemas Comuns

- **Erro de conexão com o banco:** Verifique se o PostgreSQL está rodando e se as credenciais no `.env` estão corretas
- **Porta já em uso:** Certifique-se de que as portas 3000 e 5173 não estão sendo usadas por outros processos
- **Erro nas migrações:** Confirme se o banco de dados foi criado corretamente no pgAdmin

## Tecnologias Utilizadas

- **Front-end:** ReactJS, Vite, Bun
- **Back-end:** Node.js, TypeORM
- **Banco de Dados:** PostgreSQL
- **Gerenciadores de Pacotes:** NPM (back-end) e Bun (front-end)
