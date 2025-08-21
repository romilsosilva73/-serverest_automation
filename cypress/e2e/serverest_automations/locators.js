/// <reference types="cypress" />

export const locators = {

  serverest_API: {
    baseUrl: 'https://serverest.dev',
    endpoints: {
      login: '/login',
      produtos: '/produtos',
      usuarios: '/usuarios',
    },
    credentials: {
      email: 'romilsosilva7337@gmail.com',
      password: 'PassWordfrontserverestdev*', // <-- corrigido
      // 🔹 Novo usuário administrador
      admin: {
        email: 'romilsosilva23@outlook.com',
        password: 'PassWordfrontserverestdev*',
      },
    },
    invalid: {
      emailPrefix: 'fake_',
      domain: '@qa.com',
      password: 'senha_invalida_123',
      makeInvalidEmail() {
        return `${locators.serverest_API.invalid.emailPrefix}${Date.now()}${locators.serverest_API.invalid.domain}`;
      },
    },
    build: {
      loginUrl() {
        return `${locators.serverest_API.baseUrl}${locators.serverest_API.endpoints.login}`;
      },
    },
    assert: {
      creds() {
        const { email, password } = locators.serverest_API.credentials;
        if (!email) throw new Error('email não definido em locators.serverest_API.credentials.email');
        if (!password) throw new Error('password não definido em locators.serverest_API.credentials.password');
      },
    },
  },

serverest_WEB: {
  urls: {
    login: 'https://front.serverest.dev/login',
    home: 'https://front.serverest.dev/home',
    homeADM: 'https://front.serverest.dev/admin/home',
    cadastrarUsuario: 'https://front.serverest.dev/cadastrarusuarios', 
    cadastrarUsuarioADM: 'https://front.serverest.dev/admin/cadastrarusuarios', 
    listarusuariosADM: 'https://front.serverest.dev/admin/listarusuarios'
  },
  fields: {
    email: 'input[data-testid="email"]',
    password: 'input[data-testid="senha"]',

    // 🔹 campos da tela de cadastro de usuários
    nomeCadastro: 'input[name="nome"]',
    emailCadastro: 'input[name="email"]',
    senhaCadastro: 'input[name="password"]',
    adminCheckbox: 'input[type="checkbox"]', // "Cadastrar como administrador?"
  },
  buttons: {
    submit: 'button[data-testid="entrar"]',
    cadastrarUsuario: 'button[type="submit"]', // botão roxo "Cadastrar"
  },
  alerts: {
    error: '.alert-error',
    success: '.alert-success',
  },

  // 🔹 dados de usuários para cadastro
  dadosCadastro: {
    comum: {
      nome: 'Usuário Comum Teste QA',
      email: `user_comum_QA@qa.com`,  // email único
      senha: 'senhaComum123',
      administrador: 'false',
    },
    admin: {
      nome: 'Usuário Admin Teste QA',
      email: `user_admin_qA@qa.com`,  // email único
      senha: 'senhaAdmin123',
      administrador: 'true',
    },
  },
},


  // 🔹 Seção separada só para produtos
  serverest_produto: {
    nome: 'Name Product QA',
    preco: 100,
    descricao: 'Descrição do produto teste',
    quantidade: 5,
  },

  // Apenas dados “puros” do produto
  serverest_new_produto: {
    baseNome: 'New product',
    preco: 100,
    descricao: 'Descrição do produto teste',
    quantidade: 5,
  },

};