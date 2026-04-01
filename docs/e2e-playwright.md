# Testes E2E com Playwright — citizen-portal (superapp)

Documentação de referência: como os testes E2E estão organizados, como rodá-los localmente e no CI, quais variáveis de ambiente são necessárias e como a autenticação funciona sem passar pelo fluxo Gov.br real.

---

## Visão geral

Os testes E2E cobrem as áreas principais da aplicação (home, perfil e fluxos de atualização de dados) rodando contra um servidor Next.js real — sem mocks de módulo. A sessão de usuário é simulada injetando JWTs de homologação diretamente nos cookies (`access_token` / `refresh_token`), exatamente como o middleware e `getUserInfoFromToken` os consomem.

Testes que não exigem usuário logado ("públicos") também existem e rodam sempre, mesmo sem credenciais.

---

## Estrutura de arquivos

```
playwright.config.ts          ← configuração central do Playwright
e2e/
  load-env.ts                 ← carrega .env.e2e / .env.local / .env no processo
  global-setup.ts             ← hook de setup global (roda antes de todos os testes)
  fixtures/
    auth.ts                   ← helpers de autenticação e cookie consent
  home.spec.ts                ← testes da home (público + autenticado)
  meu-perfil.spec.ts          ← testes das telas de perfil (autenticado)
  meu-perfil-atualizacao.spec.ts  ← fluxos de atualização de dados (autenticado)
  servicos.spec.ts            ← testes públicos da rota /servicos e categoria
```

---

## Como rodar localmente

### Pré-requisitos

1. Instale as dependências do projeto: `npm install`
2. Instale os browsers do Playwright: `npx playwright install`
3. Tenha um servidor Next.js rodando **ou** deixe o Playwright subir um (veja abaixo)
4. Configure as variáveis de ambiente (veja a seção correspondente)

### Comandos

```bash
# Roda toda a suíte em modo headless
npm run test:e2e

# Abre a UI do Playwright (útil para depurar testes interativamente)
npm run test:e2e:ui

# Roda um arquivo específico
npx playwright test e2e/home.spec.ts

# Roda apenas os testes que batem com um padrão de nome
npx playwright test --grep "Home (público)"

# Roda em modo headed (browser visível)
npx playwright test --headed

# Mostra o relatório HTML após a execução
npx playwright show-report
```

### Servidor durante os testes

- **Sem `CI` definido**: o Playwright reutiliza um servidor já rodando em `http://localhost:3000` (dev server). Se não houver ninguém escutando, ele sobe `npm run dev` automaticamente.
- **Com `CI=true`**: o Playwright executa `npm run start` (app já deve estar buildado com `npm run build`) e não reutiliza servidores existentes.

---

## Configuração (`playwright.config.ts`)


| Parâmetro             | Local             | CI                |
| --------------------- | ----------------- | ----------------- |
| `fullyParallel`       | `true`            | `true`            |
| `workers`             | `3`               | `3`               |
| `retries`             | `0`               | `2`               |
| `expect.timeout`      | `15 000 ms`       | `15 000 ms`       |
| `webServer.command`   | `npm run dev`     | `npm run start`   |
| `reuseExistingServer` | `true`            | `false`           |
| `trace`               | `on-first-retry`  | `on-first-retry`  |
| `screenshot`          | `only-on-failure` | `only-on-failure` |


**Browser ativo**: apenas Chromium (Desktop Chrome). Firefox e WebKit estão comentados — WebKit tem problema com `upgrade-insecure-requests`, fora que demora muito tempo para rodar todos os testes. Lembrando que multiplicaria por x3.

O relatório de execução é gerado no formato HTML em `playwright-report/`.

---

## Carregamento de variáveis de ambiente

`e2e/load-env.ts` é invocado tanto no `playwright.config.ts` quanto no `global-setup.ts`. Ele lê os arquivos na ordem abaixo e define cada chave no `process.env` **apenas se ainda não estiver definida**:

```
.env.e2e   →   .env.local   →   .env
```

Isso significa que variáveis já presentes no ambiente do shell (ex: secrets do CI) têm prioridade sobre os arquivos locais, e `.env.e2e` tem prioridade sobre `.env.local` e `.env` entre os arquivos.

---

## Autenticação nos testes (`e2e/fixtures/auth.ts`)

### `hasE2EAuth()`

Retorna `true` se `E2E_ACCESS_TOKEN` estiver definido e não vazio. Usado no `test.skip` para pular testes autenticados silenciosamente quando a credencial não está disponível.

### `applyE2EAuthCookies(context)`

Injeta os cookies no `BrowserContext` antes da navegação:


| Cookie          | Valor                          | Flags                              |
| --------------- | ------------------------------ | ---------------------------------- |
| `access_token`  | `E2E_ACCESS_TOKEN`             | `httpOnly: false`, `sameSite: Lax` |
| `refresh_token` | `E2E_REFRESH_TOKEN` (opcional) | `httpOnly: false`, `sameSite: Lax` |
| `cookieConsent` | `true`                         | `httpOnly: true`, `sameSite: Lax`  |


O domínio e o atributo `secure` são derivados da `baseURL` configurada (localhost → domínio sem `secure`; HTTPS → `secure: true`).

### `applyE2ECookieConsent(context)`

Injeta apenas o cookie `cookieConsent=true`, suprimindo o banner de consentimento nos testes públicos sem autenticação.

### Padrão de uso nos specs

```ts
// Teste público
test.beforeEach(async ({ context }) => {
  await applyE2ECookieConsent(context)
})

// Teste autenticado
test.beforeEach(async ({ context }) => {
  test.skip(!hasE2EAuth(), 'Defina E2E_ACCESS_TOKEN para rodar testes autenticados')
  await applyE2EAuthCookies(context)
})
```

---

## Testes públicos vs. autenticados

### Testes públicos

Rodam **sempre**, independente de `E2E_ACCESS_TOKEN`. Verificam o comportamento da aplicação para visitantes não logados.

### Testes autenticados

Dependem de `E2E_ACCESS_TOKEN`. Se a variável não estiver definida, o teste é ignorado (`test.skip`) em vez de falhar — isso permite que pipelines sem secrets (ex: forks) rodem a suíte sem erros.

O token deve ser um JWT de **homologação** com `exp` válido e as claims esperadas por `getUserInfoFromToken`:

- `cpf` ou `CPF` ou `preferred_username`
- `name` ou `NOME`

---

## Variáveis de ambiente


| Variável                              | Obrigatória              | Descrição                                                                                                      |
| ------------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `E2E_ACCESS_TOKEN`                    | Para testes autenticados | JWT de homolog. Coloque em `.env.e2e` ou no secret do GitHub. **Não commitar.**                                |
| `E2E_REFRESH_TOKEN`                   | Não                      | Usado se o middleware precisar renovar o access token durante a suíte.                                         |
| `PORT`                                | Não (padrão `3000`)      | Porta do servidor Next.js. Deve bater com `baseURL`.                                                           |
| `NEXT_PUBLIC_*` e demais vars do Next | Sim (para o build)       | URLs das APIs, IdP, etc. O build e o servidor de teste precisam das mesmas variáveis que o app usa em homolog. |


---

## Arquivos de spec

### `e2e/home.spec.ts`

Cobre a rota `/`.

**Público** (`Home (público)`)

- Estrutura base da página: `main.max-w-4xl`, link de busca, headings "Serviços" e "Mais acessados", barra de navegação inferior
- Header de visitante exibe "Faça seu login"
- Link "Carteira" na barra inferior aponta para `/autenticacao-necessaria/carteira`
- Banner de login (carteira / serviços municipais) visível
- Seção "Mais acessados" com cards conhecidos (IPTU 2026, CADRio Agendamento)
- Grade de categorias com ao menos 3 itens
- Seção "Carteira" **não** visível sem login
- Banner de atualização de cadastro **não** visível sem login

**Autenticado** (`Home (autenticado)`) — requer `E2E_ACCESS_TOKEN`

- Mesma estrutura base da home
- Header sem "Faça seu login" e com link para `/meu-perfil`
- Link "Carteira" aponta para `/carteira`
- Banner de "Atualize seu cadastro" visível (em vez do banner de login)
- Seção "Carteira" ou estado de carteira vazia visíveis

---

### `e2e/meu-perfil.spec.ts`

Todos os testes requerem `E2E_ACCESS_TOKEN`.

`**/meu-perfil`** (hub)

- Exibe heading "Perfil", nome do usuário (`h2`) e CPF formatado (`XXX.XXX.XXX-XX`)
- Menu com todos os links corretos: Meus dados, Endereço, Autorizações, Configurações, FAQ
- Botão "Sair" inicia o logout (intercepta `/api/auth/logout`) e exibe "Saindo..."
- Botão "Instalar App" — skip se PWA não for instalável no ambiente

`**/meu-perfil/informacoes-pessoais`**

- Exibe todos os campos esperados: CPF, Nome completo, Nome de exibição, Celular, E-mail, Cor / Raça, Gênero, Renda familiar, Escolaridade, Deficiência, Data de nascimento, Nacionalidade
- "Nome de exibição" navega para `/atualizar-nome-exibicao`
- "Celular" navega para `/atualizar-telefone`
- "E-mail" navega para `/atualizar-email`
- Bottom sheets (drawers) para Cor / Raça, Gênero, Renda familiar, Escolaridade e Deficiência — cada um exibe todas as opções esperadas

`**/meu-perfil/endereco`**

- Exibe heading "Endereço"

`**/meu-perfil/autorizacoes`**

- Exibe heading, texto explicativo e switch de autorização
- Label do switch reflete estado atual ("Autorizo" / "Não autorizo")
- Toggle do switch: liga sem confirmação; desliga abre drawer de confirmação (teste cancela para não alterar estado real)

`**/meu-perfil/configuracoes**`

- Exibe heading e opções de tema (Modo Claro / Modo Escuro) como radio buttons
- Alterna para Modo Escuro e restaura Modo Claro

`**/faq**`

- Exibe heading "FAQ" e texto "O que é a Plataforma PrefRio?"

---

### `e2e/meu-perfil-atualizacao.spec.ts`

Todos os testes requerem `E2E_ACCESS_TOKEN`. Fazem chamadas reais às APIs de homolog.

**Atualizar nome de exibição** (`/atualizar-nome-exibicao`)

- Smoke: input e botão "Salvar" visíveis
- Happy path completo: preenche input → clica Salvar → drawer "Nome de exibição atualizado!" → "Finalizar" usa `router.back()` → volta para `/informacoes-pessoais`

**Atualizar celular** (`/atualizar-telefone`)

- Smoke: tela "Escreva seu celular" e aviso de WhatsApp
- Happy path: preenche `(21) 99999-9999` → clica "Enviar" → toast "Token enviado" → redireciona para `/token-input` com `ddd=21&ddi=55` na URL

**Atualizar e-mail** (`/atualizar-email`)

- Smoke: input e botão "Salvar" visíveis
- Happy path robusto: tenta salvar `lucas.teste.e2e@gmail.com`; aceita tanto sucesso (drawer "Email atualizado!" → Finalizar → `/informacoes-pessoais`) quanto duplicata ("Email já cadastrado"), dependendo do estado atual da conta

**Endereço — fluxo completo** (`/atualizar-endereco`)

- Exclui endereço existente (se houver) → verifica estado vazio → clica "Adicionar"
- Busca endereço via autocomplete (`rua mora campo grande 303`) com debounce de 400 ms
- Seleciona primeira sugestão → preenche número (se ausente) e complemento no bottom sheet de detalhes → lida com CEP via ViaCEP (ativa "Sem CEP" se o lookup falhar)
- Aceita sucesso (drawer "Endereço atualizado!" → Finalizar via `router.push('/meu-perfil/endereco')`) ou "no change" (endereço já era idêntico — toast de erro da API)

---

### `e2e/servicos.spec.ts`

Testes públicos (não requerem `E2E_ACCESS_TOKEN`). Cobrem a rota `/servicos` e o fluxo de navegação por categoria.

- Exibe headings "Serviços", "Mais acessados" e "Categorias" na página principal
- Clicar no card "CADRio Agendamento" navega para a página do serviço (exibe "Acessar serviço" e "Principais informações")
- Clicar no botão da categoria "Cidade" navega para `/servicos/categoria/cidade`, exibe o heading da categoria e "Mais acessados", e clicar no primeiro card de serviço abre a página de detalhe

---

## CI — GitHub Actions (`.github/workflows/playwright.yml`)

Dispara em `push` e `pull_request` para o branch `**staging`**.

**Passos:**

1. `actions/checkout@v4`
2. `actions/setup-node@v4` com `node-version: lts/`*
3. `npm ci`
4. `npx playwright install --with-deps` (instala browsers + dependências de sistema)
5. `npm run build` (build de produção Next.js)
6. `npx playwright test` com os secrets:
  - `E2E_ACCESS_TOKEN`
  - `E2E_REFRESH_TOKEN`

---

## Limitações conhecidas

- **WebKit e firefox desativados**: TODO: add no futuro, porém com o tradeoff do tempo de execução da suite de testes.
- **Dados dinâmicos de categoria**: o nome exibido no `h1` da página de categoria vem da API; o teste usa `toContainText` para tolerar variações no nome retornado.
- **Dados dinâmicos da API**: asserts da home que dependem de categorias/nomes vindos da API podem flutuar; preferir `data-testid` ou contagens mínimas.
- **OTP / WhatsApp**: o teste de atualização de telefone envia um token real para `(21) 99999-9999` — não verifica o código de confirmação.
- **Estado da conta de teste**: testes de e-mail e endereço dependem do estado atual da conta associada ao `E2E_ACCESS_TOKEN`; o estado pode variar entre execuções.

---

## Próximos passos

- Adicionar cobertura para:
  - busca
  - cursos
  - mei
  - empregabilidade
- Incluir cobertura para WebKit/Firefox 
- Criar um projeto Playwright dedicado só para testes públicos (útil para PRs de forks sem secrets)
- Adicionar `data-testid` nos elementos mais usados pelos testes para desacoplar dos textos de UI

