/// <reference types="cypress" />
import { locators as loc } from './locators';
import './commands'


describe('Serverest - Login (API)', () => {

    before(() => {
        // ✅ valida tudo nos locators
        loc.serverest_API.assert.creds();
    });

    afterEach(() => {
        cy.window().then((w) => w.localStorage.removeItem('token'));
    });

    describe('Cenário de teste 1 - Validações de Login (API)', () => {

        it('Teste 1 - login com sucesso', () => {

            cy.request({
                method: 'POST',
                url: loc.serverest_API.build.loginUrl(),
                body: {
                    email: loc.serverest_API.credentials.email,
                    password: loc.serverest_API.credentials.password,
                },
                failOnStatusCode: false, // permite ler o body mesmo se vier 401
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                },
            }).then(({ status, body }) => {
                // Se não for 200, mostra body para facilitar o debug
                expect(
                    status,
                    `Status inesperado. Body: ${JSON.stringify(body)}`
                ).to.eq(200);

                expect(body).to.have.property('message', 'Login realizado com sucesso');
                expect(body.authorization).to.match(/^Bearer\s.+/);

                cy.window().then((w) => w.localStorage.setItem('token', body.authorization));
            });
        });

        it('Teste 1.1 - Deve retornar apenas o token', () => {

            cy.getToken().then((token) => {
                cy.log('Token:', token); // aparece no log do Cypress
                // se quiser salvar no localStorage:
                cy.window().then((w) => w.localStorage.setItem('token', token));
            });
        });

        it('Teste 2 - usuário inválido', () => {

            cy.request({

                method: 'POST',
                url: loc.serverest_API.build.loginUrl(),
                failOnStatusCode: false,
                body: {
                    email: loc.serverest_API.invalid.makeInvalidEmail(),
                    password: loc.serverest_API.credentials.password,
                },
            }).then(({ status, body }) => {
                expect(status).to.eq(401);
                expect(body.message).to.match(/Email e\/ou senha inválidos/i);
            });
        });

        it('Teste 3 - senha inválida', () => {

            cy.request({

                method: 'POST',
                url: loc.serverest_API.build.loginUrl(),
                failOnStatusCode: false,
                body: {
                    email: loc.serverest_API.credentials.email,
                    password: loc.serverest_API.invalid.password,
                },
            }).then(({ status, body }) => {
                expect(status).to.eq(401);
                expect(body.message).to.match(/Email e\/ou senha inválidos/i);
            });
        });
    });


    describe('Cenário de teste 2 - Validações de cadastro de Produto (API)', () => {

        it('Teste 1 - Cadastra produto com usuário admin', () => {

            // 🔹 Cria o produto já autenticado como admin
            cy.createProduto().then(({ id, nome }) => {
                cy.log(`✅ Produto criado com sucesso: ${nome} (id: ${id})`);
            });

        });

        it('Teste 2 - Retorna o produto cadastrado filtrando pelo nome', () => {
            const nomeFiltro = loc.serverest_new_produto.baseNome; // "New product"

            cy.request({
                method: 'GET',
                url: `${loc.serverest_API.baseUrl}${loc.serverest_API.endpoints.produtos}`,
                qs: { nome: nomeFiltro },
                headers: { accept: 'application/json' },
            }).then(({ status, body }) => {
                expect(status).to.eq(200);
                expect(body).to.have.property('quantidade').that.is.greaterThan(0);
                expect(body).to.have.property('produtos').and.to.be.an('array').and.not.be.empty;

                const produto = body.produtos.find(p => p.nome.startsWith(nomeFiltro));
                expect(produto, 'produto encontrado pelo nome').to.exist;

                // valida campos básicos
                expect(produto).to.have.property('_id');
                expect(produto).to.have.property('nome').and.to.include(nomeFiltro);
                expect(produto).to.have.property('preco');
                expect(produto).to.have.property('descricao');
                expect(produto).to.have.property('quantidade');
            });


        });


        it('Teste 3 - Edita um produto existente (por _id) e valida os campos atualizados', () => {
            const nomeBase = loc.serverest_new_produto.baseNome; // ex.: "New product"

            // 1) Descobre o _id do produto pelo nome base
            cy.getProdutoIdByNome(nomeBase).then((produtoId) => {
                expect(produtoId).to.be.a('string').and.not.be.empty;

                // 2) Prepara payload de edição (nome único para evitar conflito)
                const novoNome = `${nomeBase} - Edited ${Date.now()}`;
                const payload = {
                    nome: novoNome,
                    preco: loc.serverest_new_produto.preco + 10,
                    descricao: `${loc.serverest_new_produto.descricao} (editado)`,
                    quantidade: loc.serverest_new_produto.quantidade + 1,
                };

                // 3) Token admin + PUT
                cy.getAdminToken().then((token) => {
                    cy.request({
                        method: 'PUT',
                        url: `${loc.serverest_API.baseUrl}${loc.serverest_API.endpoints.produtos}/${produtoId}`,
                        headers: {
                            Authorization: token,
                            'content-type': 'application/json',
                            accept: 'application/json',
                        },
                        body: payload,
                        failOnStatusCode: false,
                    }).then(({ status, body }) => {
                        expect(status).to.eq(200);
                        expect(body).to.have.property('message').and.to.match(/alterado com sucesso/i);
                    })
                        // 4) Valida via GET por nome exato que atualizou
                        .then(() => {
                            cy.request({
                                method: 'GET',
                                url: `${loc.serverest_API.baseUrl}${loc.serverest_API.endpoints.produtos}`,
                                qs: { nome: novoNome },
                                headers: { accept: 'application/json' },
                            }).then(({ status, body }) => {
                                expect(status).to.eq(200);
                                expect(body).to.have.property('quantidade').that.is.greaterThan(0);
                                expect(body).to.have.property('produtos').and.to.be.an('array').and.not.be.empty;

                                const produto = body.produtos.find(p => p._id === produtoId);
                                expect(produto, 'produto editado encontrado').to.exist;

                                expect(produto.nome).to.eq(novoNome);
                                expect(produto.preco).to.eq(payload.preco);
                                expect(produto.descricao).to.eq(payload.descricao);
                                expect(produto.quantidade).to.eq(payload.quantidade);
                            });
                        });
                });
            });
        });

        it('Teste 4 - Remove o produto pelo _id', () => {
            const nomeFiltro = loc.serverest_new_produto.baseNome; // "New product"

            // 1) Obtém o ID do produto pelo nome
            cy.getProdutoIdByNome(nomeFiltro).then((produtoId) => {
                expect(produtoId, 'produtoId retornado do GET').to.be.a('string').and.not.be.empty;

                // 2) Obtém token admin
                cy.getAdminToken().then((token) => {
                    // 3) Faz a requisição DELETE
                    cy.request({
                        method: 'DELETE',
                        url: `${loc.serverest_API.baseUrl}${loc.serverest_API.endpoints.produtos}/${produtoId}`,
                        headers: { Authorization: token, accept: 'application/json' },
                        failOnStatusCode: false, // evita falha se produto já não existir
                    }).then(({ status, body }) => {
                        expect(status).to.eq(200);
                        expect(body).to.have.property('message');
                        cy.log(`🗑️ Produto removido (${produtoId}): ${body.message}`);
                    });
                });
            });
        });
    });


    describe('Cenário de teste 3 - Validações de cadastro de Usuário (API)', () => {

        it('Teste 1 - Cadastra um usuário administrador com sucesso', () => {
            const email = `qa_${Date.now()}@qa.com`; // email único por execução
            const payload = {
                nome: 'QA Admin',
                email,
                password: 'teste123',
                administrador: 'true', // a API espera string "true"/"false"
            };

            cy.getAdminToken().then((token) => {
                cy.request({
                    method: 'POST',
                    url: `${loc.serverest_API.baseUrl}${loc.serverest_API.endpoints.usuarios}`,
                    headers: {
                        Authorization: token,            // opcional para /usuarios, mas mantemos padrão admin
                        'content-type': 'application/json',
                        accept: 'application/json',
                    },
                    body: payload,
                }).then(({ status, body }) => {
                    expect(status).to.eq(201);
                    expect(body).to.have.property('message').and.match(/cadastro realizado com sucesso/i);
                    expect(body).to.have.property('_id').and.be.a('string');

                    // guarda para próximos testes
                    Cypress.env('usuarioId', body._id);
                    Cypress.env('usuarioEmail', email);
                });
            });
        });

        it('Teste 2 - Busca um usuário existente pelo _id', () => {
            const nomeFiltro = 'QA Admin'; // ajuste conforme o nome cadastrado no POST

            // 1) obtém o ID do usuário pelo nome
            cy.getUsuarioIdByNome(nomeFiltro).then((usuarioId) => {
                expect(usuarioId).to.be.a('string').and.not.be.empty;

                // 2) faz o GET /usuarios/{_id}
                cy.request({
                    method: 'GET',
                    url: `${loc.serverest_API.baseUrl}${loc.serverest_API.endpoints.usuarios}/${usuarioId}`,
                    headers: { accept: 'application/json' },
                }).then(({ status, body }) => {
                    // 3) valida retorno
                    expect(status).to.eq(200);
                    expect(body).to.have.property('_id', usuarioId);
                    expect(body).to.have.property('nome').and.eq(nomeFiltro);
                    expect(body).to.have.property('email').and.be.a('string');
                    expect(body).to.have.property('password').and.be.a('string');
                    expect(body).to.have.property('administrador').and.satisfy(val => val === 'true' || val === 'false');
                });
            });
        });


        it('Teste 3 - Remove o usuário criado (por _id) e valida remoção', () => {
            const nomeUsuario = 'QA Admin'; // ajuste se usar outro nome no POST

            // 1) Obter _id pelo nome
            cy.getUsuarioIdByNome(nomeUsuario).then((usuarioId) => {
                expect(usuarioId).to.be.a('string').and.not.be.empty;

                // 2) Token admin
                cy.getAdminToken().then((token) => {
                    // 3) DELETE /usuarios/{_id}
                    cy.request({
                        method: 'DELETE',
                        url: `${loc.serverest_API.baseUrl}${loc.serverest_API.endpoints.usuarios}/${usuarioId}`,
                        headers: { Authorization: token, accept: 'application/json' },
                        failOnStatusCode: false, // se já estiver deletado, não quebra o teste
                    }).then(({ status, body }) => {
                        expect(status).to.eq(200);
                        expect(body).to.have.property('message');
                        cy.log(`🗑️ Usuário removido (${usuarioId}): ${body.message}`);
                    }).then(() => {
                        // 4) Confirma que não existe mais (GET por id deve retornar 400)
                        cy.request({
                            method: 'GET',
                            url: `${loc.serverest_API.baseUrl}${loc.serverest_API.endpoints.usuarios}/${usuarioId}`,
                            headers: { accept: 'application/json' },
                            failOnStatusCode: false,
                        }).then(({ status, body }) => {
                            expect(status, 'GET por id após delete deve falhar').to.eq(400);
                            expect(body).to.have.property('message').and.match(/usuário não encontrado/i);
                        });

                        // (Opcional) Confirma também via GET por nome que não retorna o mesmo id
                        cy.request({
                            method: 'GET',
                            url: `${loc.serverest_API.baseUrl}${loc.serverest_API.endpoints.usuarios}`,
                            qs: { nome: nomeUsuario },
                            headers: { accept: 'application/json' },
                        }).then(({ status, body }) => {
                            expect(status).to.eq(200);
                            const aindaExiste = Array.isArray(body.usuarios)
                                && body.usuarios.some(u => u._id === usuarioId);
                            expect(aindaExiste, 'usuário não deve mais aparecer na listagem').to.be.false;
                        });
                    });
                });
            });
        });

    });
});