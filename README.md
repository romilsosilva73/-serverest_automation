DESAFIO DE AUTOMAÇÃO DE TESTES — SERVEREST (CYPRESS)


================================================================

OBJETIVO

Usando Cypress (JavaScript), desenvolver:

3 cenários E2E para o FRONTEND.

3 cenários para a API.

================================================================
2) APLICAÇÕES

Frontend: https://front.serverest.dev/

Swagger/API: https://serverest.dev/

================================================================
3) REQUISITOS

O código deve estar no GitHub.

Ao finalizar, compartilhar o repositório.

================================================================
4) CRITÉRIOS DE AVALIAÇÃO

Boas práticas de desenvolvimento.

Qualidade e clareza do código.

Uso adequado de padrões de projeto (quando fizer sentido).

Assertivas claras e pertinentes.

Escrita e organização dos cenários.

Qualidade e clareza dos commits.

OBS.: Frontend “ServeRest” criado com create-react-app.

================================================================
5) ORGANIZAÇÃO DO PROJETO

Estrutura de pastas essencial:

serverest/
Evidence of execution/
Execucao - serverest_API.cy.js
Execucao - serverest_WEB.cy.js
cypress/
e2e/
serverest_automations/
serverest_WEB.cy.js # testes de Login, Produto e Usuário (UI)
commands.js # comandos customizados (login, tokens, helpers)
locators.js # URLs, endpoints, seletores e dados de teste

================================================================
6) EVIDÊNCIAS DE EXECUÇÃO (VÍDEOS)

Pasta criada: serverest/Evidence of execution

Conteúdo:

Execucao - serverest_API.cy.js

Execucao - serverest_WEB.cy.js

(Demonstram a execução dos testes de API e Frontend, respectivamente.)

================================================================
7) ESCOPO COBERTO (RESUMO)

Login (UI): usuário comum e admin.

Produtos (UI): cadastrar, listar e excluir.

Usuários (UI): cadastrar (validando POST /usuarios com intercept), listar e excluir.

================================================================
8) COMO OS TESTES FUNCIONAM (RESUMO)

beforeEach: define viewport, limpa cookies/localStorage/sessionStorage e usa reload(true).

Login pela UI:

cy.loginFrontend() -> usuário comum

cy.loginFrontendADM() -> administrador


================================================================
9) PRINCIPAIS COMANDOS (support/commands.js)

cy.loginFrontend(email?, password?) # login UI (comum)

cy.loginFrontendADM(email?, password?) # login UI (admin)

cy.getToken() / cy.getAdminToken() # token via POST /login

cy.createProduto(overrides?) # cria produto via API (nome dinâmico)

cy.getProdutoIdByNome(nome) / cy.getUsuarioIdByNome(nome) # busca IDs via API

================================================================
10) LOCATORS E DADOS (support/locators.js)

serverest_API: baseUrl, endpoints, credentials, helpers.

serverest_WEB: urls, fields, buttons, dadosCadastro (comum/admin).

serverest_produto: dados fixos para testes de UI.

serverest_new_produto: base para criação via API (nome com timestamp).

================================================================

11) Pré-requisitos

Node.js LTS (18.x ou 20.x)

Cypress: 14.5.4

Instalação (versão fixada)
npm i -D cypress@14.5.4
 ou
yarn add -D cypress@14.5.4
 ou
pnpm add -D cypress@14.5.4

Verificação
npx cypress --version
 Deve exibir: Cypress package version: 14.5.4

================================================================

12) COMO RODAR

 abrir o runner
npx cypress open

 rodar só Front (UI)
npx cypress run --spec "cypress/e2e/serverest_automations/serverest_WEB.cy.js"

 rodar só API
npx cypress run --spec "cypress/e2e/serverest_automations/serverest_API.cy.js"

 (opcional) escolher navegador
npx cypress run --browser chrome --spec "cypress/e2e/serverest_automations/*.cy.js"

13) Estratégias utilizadas

Para tornar a suíte reutilizável, legível e fácil de manter, foram aplicadas duas estratégias principais: comandos customizados do Cypress e locators/dados de teste centralizados.

Comandos customizados do Cypress (support/commands.js)
Encapsulam ações recorrentes (ex.: cy.loginFrontend(), cy.loginFrontendADM(), cy.getToken(), cy.createProduto()), reduzindo duplicação e deixando os testes mais expressivos.
Benefícios: reuso, legibilidade, menor acoplamento e specs mais enxutos.

Locators e dados de teste centralizados (support/locators.js)
Concentrar seletores, URLs, endpoints e payloads em um único arquivo facilita a manutenção e padroniza o acesso aos elementos e dados.
Benefícios: atualização simples quando a UI muda, consistência entre cenários e menor flakiness.

