/// <reference types="cypress" />
import { locators as loc } from './locators';
import './commands'


describe('serverest_WEB', () => {


  beforeEach(() => {

    cy.viewport(1366, 768)

    // Limpa os cookies
    cy.clearCookies();

    // Limpa o armazenamento local
    cy.clearLocalStorage();

    // Limpa o sessionStorage
    cy.window().then((win) => {
      win.sessionStorage.clear();
      win.localStorage.clear();
    });

    // Recarrega a página para garantir um novo início
    cy.reload(true);

  });

  describe('Cenários de teste 1 - Validações de Login', () => {

    it('Teste 1 - Login com usuario comum', () => {

      // Faz login antes (se necessário)
      cy.loginFrontend();

    });


    it('Teste 2 - Login com usuario com usuario ADM', () => {

      // Faz login antes (se necessário)
      cy.loginFrontendADM();

    });
  });

  describe('Cenários de teste  2 - Validações de produto', () => {

    it('Teste 1 - Pesquisa e valida a listagem do produto com usuario ADM', () => {

      cy.loginFrontendADM();

      const base = loc.serverest_produto;

      // Clica na opção de Cadastrar Produtos
      cy.get('[data-testid="cadastrarProdutos"]').click();

      // Campos visíveis
      cy.get('[data-testid="nome"]').should('be.visible').and('not.be.disabled');
      cy.get('[data-testid="preco"]').should('be.visible').and('not.be.disabled');
      cy.get('[data-testid="descricao"]').should('be.visible').and('not.be.disabled');
      cy.get('[data-testid="quantity"]').should('be.visible').and('not.be.disabled');

      // Preenche (use sempre "base" — não misture com loc novamente)
      cy.get('[data-testid="nome"]').clear().type(base.nome);
      cy.get('[data-testid="preco"]').clear().type(String(base.preco));
      cy.get('[data-testid="descricao"]').clear().type(base.descricao);
      cy.get('[data-testid="quantity"]').clear().type(String(base.quantidade));

      // Envia (confirme o testid certo do botão)
      cy.get('[data-testid="cadastarProdutos"]').should('be.enabled').click();

      // Validação na UI (ajuste se a tela não redirecionar)
      cy.url().should('include', '/listarprodutos');
      cy.get('table').contains('td', base.nome).should('exist');

    });


    it('Teste 2 - Pesquisa e valida a listagem do produto com usuario ADM', () => {

      cy.loginFrontendADM();

      const base = loc.serverest_produto;

      // Clica na opção de Listar Produtos
      cy.get('[data-testid="listarProdutos"]').click();

      // Validação na UI (ajuste se a tela não redirecionar)
      cy.url().should('include', '/listarprodutos');
      cy.get('table').contains('td', base.nome).should('exist');


    });


    it('Teste 3 - Exclui o produto da listagem', () => {

      cy.loginFrontendADM();

      const { nome } = loc.serverest_produto; // ajuste o caminho se necessário

      // Clica na opção de Listar Produtos
      cy.get('[data-testid="listarProdutos"]').click();
      cy.url().should('include', '/listarprodutos');

      // Clica no botão EXCLUIR da MESMA LINHA do produto (independente da posição)
      cy.contains('table tbody tr', nome).within(() => {
        cy.get(
          '[data-testid="excluirProduto"], ' +
          '.btn-danger, ' +
          'a:contains("Excluir"), ' +
          'button:contains("Excluir"), ' +
          '[aria-label="Excluir"]'
        )
          .first()
          .click();
      });

      // Confirma a exclusão (trata modal OU window.confirm)
      cy.get('body').then(($body) => {
        if ($body.find('[role="dialog"], .modal').length) {
          cy.get('[role="dialog"], .modal').within(() => {
            cy.contains('button, a', /Confirmar|Sim|Excluir|OK/i).click();
          });
        } else {
          // caso use window.confirm nativo
          cy.on('window:confirm', () => true);
        }
      });

      // Valida que a linha sumiu da lista
      cy.contains('table tbody tr', nome).should('not.exist');
    });


  });


  describe('Cenários de teste  3  - Validações de cadastro de usuário', () => {


    it('Teste 1 - Cadastra usuario ADM', () => {
      // Faz login como admin
      cy.loginFrontendADM();

      // Pega dados do locator (usuário admin)
      const userAdmin = loc.serverest_WEB.dadosCadastro.admin;

      // Intercepta o POST /usuarios para validar o retorno
      cy.intercept('POST', '**/usuarios').as('postUsuario');

      // 1) Acessa a tela de cadastro de usuários (rota admin)
      cy.visit(loc.serverest_WEB.urls.cadastrarUsuarioADM);

      // 2) Preenche os campos
      cy.get('[data-testid="nome"]').clear().type(userAdmin.nome);
      cy.get('[data-testid="email"]').clear().type(userAdmin.email);
      cy.get('[data-testid="password"]').clear().type(userAdmin.senha);

      // 3) Marca como administrador
      cy.get('[data-testid="checkbox"]').check();

      // 4) Clica no botão "Cadastrar"
      cy.get(loc.serverest_WEB.buttons.cadastrarUsuario).click();

      // 5) Valida o retorno da API (não valida _id)
      cy.wait('@postUsuario').then(({ response }) => {
        expect(response.statusCode).to.eq(201);
        expect(response.body).to.have.property('message', 'Cadastro realizado com sucesso');
      });

      // (Opcional) Validar algum feedback na UI, caso exista
      // cy.contains(/Cadastro realizado com sucesso/i).should('be.visible');
    });

    it('Teste 2 - Deve encontrar o usuário cadastrado na lista', () => {

      // Faz login como admin
      cy.loginFrontendADM();

      // pega dados direto do locators
      const emailUsuario = loc.serverest_WEB.dadosCadastro.admin.email;
      const nomeUsuario = loc.serverest_WEB.dadosCadastro.admin.nome;

      // 1) acessa a tela de listagem de usuários ADM
      cy.visit(loc.serverest_WEB.urls.listarusuariosADM);

      // 2) procura o usuário na tabela (por email)
      cy.get('table').contains('td', emailUsuario).should('exist');

      // 3) valida também que o nome aparece na mesma linha
      cy.get('table tr').contains('td', emailUsuario).parent('tr').within(() => {
        cy.get('td').eq(0).should('contain.text', nomeUsuario);  // coluna Nome
        cy.get('td').eq(1).should('contain.text', emailUsuario); // coluna Email
      });
    });


    it('Teste 3 - Exclui o usuário da listagem', () => {
      cy.loginFrontendADM();

      const email = loc.serverest_WEB.dadosCadastro.admin.email; // ajuste se necessário

      // Abre a listagem (tenta clicar; se não houver o botão, faz fallback para a rota)
      cy.get('body').then(($b) => {
        if ($b.find('[data-testid="listarUsuarios"]').length) {
          cy.get('[data-testid="listarUsuarios"]').click();
        } else if (loc.serverest_WEB?.urls?.listarusuariosADM) {
          cy.visit(loc.serverest_WEB.urls.listarusuariosADM);
        }
      });

      cy.url().should('include', '/listarusuarios');

      // Exclui da MESMA LINHA do usuário (sem nth-child)
      cy.contains('table tbody tr', email).within(() => {
        cy.get(
          '[data-testid="excluirUsuario"], ' +
          '.btn-danger, ' +
          'a:contains("Excluir"), ' +
          'button:contains("Excluir"), ' +
          '[aria-label="Excluir"]'
        )
          .first()
          .click();
      });

      // Confirma a exclusão (modal OU window.confirm)
      cy.get('body').then(($body) => {
        if ($body.find('[role="dialog"], .modal').length) {
          cy.get('[role="dialog"], .modal').within(() => {
            cy.contains('button, a', /Confirmar|Sim|Excluir|OK/i).click();
          });
        } else {
          cy.on('window:confirm', () => true);
        }
      });

      // Valida que a linha sumiu da lista
      cy.contains('table tbody tr', email).should('not.exist');
    });


  });
});

