import { locators as loc } from './locators.js';


Cypress.Commands.add('getToken', () => {
  return cy.request({
    method: 'POST',
    url: loc.serverest_API.build.loginUrl(),
    body: {
      email: loc.serverest_API.credentials.email,
      password: loc.serverest_API.credentials.password,
    },
    failOnStatusCode: false,
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
  }).then(({ status, body }) => {
    expect(status).to.eq(200);
    expect(body).to.have.property('authorization');
    expect(body.authorization).to.match(/^Bearer\s.+/);

    return body.authorization; // 👈 retorna só o token
  });
});


Cypress.Commands.add('loginFrontend', (email, password) => {
  const user = email ?? loc.serverest_API.credentials.email;
  const pass = password ?? loc.serverest_API.credentials.password;

  // Visita a tela de login
  cy.visit(loc.serverest_WEB.urls.login);

  // Preenche as credenciais
  cy.get(loc.serverest_WEB.fields.email).clear().type(user);
  cy.get(loc.serverest_WEB.fields.password).clear().type(pass, { log: false });

  // Clica no botão 'Entrar'
  cy.get(loc.serverest_WEB.buttons.submit).click();

  // Valida que saiu do /login e chegou na home
  cy.url().should('not.include', '/login');
  cy.url().should('eq', loc.serverest_WEB.urls.home);
});

Cypress.Commands.add('loginFrontendADM', (email, password) => {
  const user = email ?? loc.serverest_API.credentials.admin.email;
  const pass = password ?? loc.serverest_API.credentials.admin.password;

  // Visita a tela de login
  cy.visit(loc.serverest_WEB.urls.login);

  // Preenche as credenciais
  cy.get(loc.serverest_WEB.fields.email).clear().type(user);
  cy.get(loc.serverest_WEB.fields.password).clear().type(pass, { log: false });

  // Clica no botão 'Entrar'
  cy.get(loc.serverest_WEB.buttons.submit).click();

  // Valida que saiu do /login e chegou na home
  cy.url().should('not.include', '/login');
  cy.url().should('eq', loc.serverest_WEB.urls.homeADM);
});

Cypress.Commands.add('getAdminToken', () => {
  const { email, password } = loc.serverest_API.credentials.admin;

  return cy.request({
    method: 'POST',
    url: loc.serverest_API.build.loginUrl(),
    body: { email, password },
  }).then((resp) => {
    expect(resp.status).to.eq(200);
    expect(resp.body).to.have.property('authorization');
    return resp.body.authorization;
  });
});

Cypress.Commands.add('createProduto', (overrides = {}) => {
  return cy.getAdminToken().then((token) => {
    const payload = {
      nome: `${loc.serverest_new_produto.baseNome} ${Date.now()}`,
      preco: loc.serverest_new_produto.preco,
      descricao: loc.serverest_new_produto.descricao,
      quantidade: loc.serverest_new_produto.quantidade,
      ...overrides, // permite customizar algo (ex.: { preco: 999 })
    };

    return cy.request({
      method: 'POST',
      url: loc.serverest_API.baseUrl + loc.serverest_API.endpoints.produtos, 
      headers: { Authorization: token, 'content-type': 'application/json' },
      body: payload,
    }).then(({ status, body }) => {
      expect(status).to.eq(201);
      expect(body.message).to.eq('Cadastro realizado com sucesso');
      expect(body).to.have.property('_id');

      return { id: body._id, nome: payload.nome, body };
    });
  });
});


Cypress.Commands.add('getProdutoIdByNome', (nomeFiltro) => {
  return cy.request({
    method: 'GET',
    url: `${loc.serverest_API.baseUrl}${loc.serverest_API.endpoints.produtos}`,
    qs: { nome: nomeFiltro },
    headers: { accept: 'application/json' },
  }).then(({ status, body }) => {
    expect(status).to.eq(200);
    expect(body).to.have.property('quantidade').that.is.greaterThan(0);
    expect(body.produtos).to.be.an('array').and.not.be.empty;

    const produto = body.produtos.find(p => p.nome.startsWith(nomeFiltro));
    expect(produto, `Produto com nome que começa por "${nomeFiltro}" encontrado`).to.exist;

    return produto._id; // 🔹 retorna somente o ID
  });
});


Cypress.Commands.add('getUsuarioIdByNome', (nomeFiltro) => {
  return cy.request({
    method: 'GET',
    url: `${loc.serverest_API.baseUrl}${loc.serverest_API.endpoints.usuarios}`,
    qs: { nome: nomeFiltro },
    headers: { accept: 'application/json' },
  }).then(({ status, body }) => {
    expect(status).to.eq(200);
    expect(body).to.have.property('quantidade').that.is.greaterThan(0);
    expect(body.usuarios).to.be.an('array').and.not.be.empty;

    const usuario = body.usuarios.find(u => u.nome === nomeFiltro);
    expect(usuario, `Usuário com nome "${nomeFiltro}" encontrado`).to.exist;

    return usuario._id;
  });
});