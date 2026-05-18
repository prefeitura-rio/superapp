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
  empregos.spec.ts            ← testes do módulo Oportunidades Cariocas (público + autenticado)
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

`**/meu-perfil/configuracoes`**

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

### `e2e/empregos.spec.ts`

Cobre o módulo **Oportunidades Cariocas** (`/servicos/empregos` e rotas relacionadas). Contém **69 testes** organizados em **11 grupos**.

> Documentação detalhada de todos os cenários, tabela de regressão e instruções de cobertura: [`docs/testes-empregabilidade.md`](./testes-empregabilidade.md).

> **Helper local:** `clickActionDrawer(page, labelText)` — mesma lógica do `meu-perfil.spec.ts`, navega até a área clicável de um `ActionDiv` pelo texto do label.
>
> **Helper local:** `getFirstVagaHref(page)` — abre a home de empregos, localiza o primeiro card de vaga disponível e retorna seu `href`. Usado para evitar hardcode de IDs de vaga.

**Home de empregos — público** (`Empregos — home (público)`)

- Logo "Oportunidades Cariocas Logo" e ícone de busca apontando para `/busca?tipo=empregos` visíveis
- Header deslogado exibe ícone de ajuda linkando para `/servicos/empregos/faq`
- Seções "Vagas mais recentes" e "Todas as vagas" com pelo menos 1 card
- Card "Candidaturas enviadas" **não** visível sem autenticação
- Clicar no primeiro card de vaga navega para `/servicos/empregos/[id]`

**Home de empregos — autenticado** (`Empregos — home (autenticado)`) — requer `E2E_ACCESS_TOKEN`

- Header logado exibe ícone de menu linkando para `/servicos/empregos/menu` (e **não** exibe ícone de ajuda)
- Card "Candidaturas enviadas" (quando presente) aponta para `/minhas-candidaturas` e exibe o subtexto correto
- Clicar no card "Candidaturas enviadas" navega para a tela de candidaturas

**Página da vaga — público** (`Empregos — página da vaga (público)`)

- Carrega com `h1`, texto "Inscrições até" e seção "Informações gerais"
- Labels de informações gerais: Valor da Vaga, Regime de contratação, Modelo de trabalho, Local de trabalho, Data limite de inscrição
- Botões Voltar e Compartilhar visíveis (`aria-label`)
- Botão "Fazer login para se candidatar" visível sem auth
- Link da empresa (quando há CNPJ) navega para `/servicos/empresas/[cnpj]`
- Card de etapas do processo seletivo visível quando a vaga tem etapas

**Página da vaga — autenticado** (`Empregos — página da vaga (autenticado)`) — requer `E2E_ACCESS_TOKEN`

- Exibe "Candidatar-se à vaga" ou card de feedback (`.or()` para tolerar ambos os estados)
- Botão "Candidatar-se à vaga" aponta para `/inscricao` quando presente
- Vaga com candidatura exibe card de feedback ("Sua inscrição foi enviada...", "Parabéns!", etc.)

**Fluxo de candidatura — autenticado** (`Empregos — fluxo de candidatura (autenticado)`) — requer `E2E_ACCESS_TOKEN`

- Página de inscrição exibe Meu Currículo, tela de bem-vindo ou confirmar informações (`.or()` sobre os 3 estados do carousel)
- Tela de bem-vindo (quando `is_first_login = true`): título "Bem vindo ao Cadastro de oportunidades de Emprego" e botão "Continuar" habilitado
- Tela de confirmar informações (quando dados estão incompletos): CPF no formato esperado e botão "Continuar"
- Meu Currículo no fluxo de inscrição: exibe botão "Continuar" no rodapé (ausente na versão standalone)

**Meu Currículo — standalone** (`Empregos — Meu Currículo (autenticado)`) — requer `E2E_ACCESS_TOKEN` — **seção mais extensa (~20 testes)**

- *Estrutura*: heading "Meu Currículo", 4 accordions (Formação, Experiência Profissional, Situação atual, Termos de Uso), ausência do botão "Continuar" na versão standalone
- *Accordion Formação*: abre e exibe campos (Escolaridade, Tipo de formação, Nome do Curso, Nome da Instituição, Status, Ano de conclusão, Idiomas); botões "Adicionar outra formação" / "Adicionar outro idioma" inserem novos blocos; "Remover formação" / "Remover idioma" aparecem com 2+ itens e removem corretamente; "Cancelar" fecha o accordion; drawers de Escolaridade (todas as 9 opções), Status (Completo, Em andamento, Incompleto) e Idioma
- *Discard Changes*: fechar o accordion com dados não salvos abre o modal "Descartar alterações?"; "Cancelar" mantém o accordion aberto com os dados; "Descartar" fecha e reverte para o snapshot anterior
- *Accordion Experiência Profissional*: abre com campos Cargo, Empresa, "Meu emprego atual"; botões Salvar e Cancelar visíveis; drawer "Experiência comprovada em carteira" exibe opções Sim/Não
- *Accordion Situação atual*: campo "Encontra-se" (obrigatório); drawer com opções de situação; campo condicional "Há quanto tempo procurando emprego?" aparece ao selecionar situação de desemprego; drawers de Disponibilidade e Tipo de vínculo
- *Accordion Termos de Uso*: texto dos termos e checkbox visíveis; marcar checkbox exibe ícone check verde no título do accordion

**Página da empresa — público** (`Empregos — página da empresa (público)`)

- `h1` com nome da empresa, seção "Sobre a empresa" e "Vagas ofertadas pela empresa"
- Informações: Setor, Tamanho da empresa, Especializações
- Estado com vagas: VagaCards visíveis; estado sem vagas: "Nenhuma vaga aberta no momento."
- Botão Voltar retorna para a vaga anterior (via `router.back()`)

**Minhas candidaturas — autenticado** (`Empregos — minhas candidaturas (autenticado)`) — requer `E2E_ACCESS_TOKEN`

- Heading "Minhas candidaturas"
- Estado vazio: "Você ainda não possui candidaturas enviadas"
- Estado com candidaturas: badge de status (Em análise, Aprovado, Não selecionado, Vaga encerrada, Vaga descontinuada), barra de progresso ou "Esta vaga não possui etapas."
- Card com `idVaga` é um `<a>` com `href=/servicos/empregos/[id]` e navega para a página da vaga

**Menu de empregos — autenticado** (`Empregos — menu (autenticado)`) — requer `E2E_ACCESS_TOKEN`

- Heading "Menu" com 3 itens: "Minhas candidaturas" → `/minhas-candidaturas`, "Meu currículo" → `/curriculo`, "FAQ" → `/servicos/empregos/faq`
- Cada link é testado com clique + `waitForURL` + verificação do heading da página de destino

**Busca de empregos — público** (`Empregos — busca (público)`)

- Navega para `/busca?tipo=empregos` via ícone de busca; verifica input e seção "Mais recentes" com sugestões dinâmicas de vagas
- Digitar 3+ caracteres exibe "Resultados da Pesquisa" ou mensagem de vazio
- Resultados de vagas exibem badge "Emprego"
- Botão X limpa a busca e retorna ao estado inicial
- URL com `?q=` dispara busca automaticamente ao carregar

**FAQ de empregos — público** (`Empregos — FAQ (público)`)

- Heading "FAQ" e perguntas específicas de empregos: "O que é a Plataforma Oportunidades Cariocas?", candidatura, conta Gov.br, acompanhamento e status de candidaturas

---

### Padrões específicos do `empregos.spec.ts`

**Testes condicionais:** situações que dependem do estado do usuário (ex: ter ou não candidaturas) usam `.or()` do Playwright ou verificação com `.isVisible().catch(() => false)`:

```ts
await expect(candidatarBtn.or(feedbackCard).first()).toBeVisible({ timeout: 20000 })

const isVisible = await card.isVisible({ timeout: 5000 }).catch(() => false)
if (isVisible) { /* asserts apenas quando o estado existir */ }
```

**Sem hardcode de IDs:** todos os testes que precisam de uma vaga específica chamam `getFirstVagaHref(page)` para capturar o primeiro card disponível dinamicamente.

**Empresa condicional:** a página de empresa só é acessível quando a vaga tem CNPJ. Os testes verificam a existência do link antes de navegar e fazem `test.skip()` se não houver.

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
  - ~~busca~~ ✅ coberto em `empregos.spec.ts` (grupo "busca (público)")
  - cursos
  - mei
  - ~~empregabilidade~~ ✅ coberto em `empregos.spec.ts`
- Incluir cobertura para WebKit/Firefox 
- Criar um projeto Playwright dedicado só para testes públicos (útil para PRs de forks sem secrets)
- Adicionar `data-testid` nos elementos mais usados pelos testes para desacoplar dos textos de UI

