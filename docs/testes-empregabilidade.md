# Testes — Empregabilidade (Oportunidades Cariocas)

Referência completa dos testes automatizados do módulo de empregabilidade: catálogo de cenários, mapa de cobertura e tabela de regressão.

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura de Testes](#2-arquitetura-de-testes)
3. [Catálogo E2E](#3-catálogo-e2e)
4. [Catálogo de Integração](#4-catálogo-de-integração)
5. [Tabela de Regressão](#5-tabela-de-regressão)
6. [Como Usar a Tabela de Regressão](#6-como-usar-a-tabela-de-regressão)
7. [Como Executar os Testes](#7-como-executar-os-testes)

---

## 1. Visão Geral

O módulo cobre as rotas `/servicos/empregos/**` e `/busca?tipo=empregos`. Os testes estão divididos em duas camadas complementares:

- **E2E (Playwright):** valida navegação, renderização e fluxos contra um servidor Next.js real com dados de homologação. Ideal para estados que dependem do banco (ex: usuário já inscrito em uma vaga).
- **Integração (Vitest + MSW):** intercepta chamadas HTTP sem tocar banco real. Ideal para lógica de negócio, tratamento de erros de API e fluxos cujo estado é imprevisível em E2E.

**Por que não usar E2E para o fluxo de inscrição inteiro?** O usuário E2E pode já estar inscrito na vaga, tornando o botão "Candidatar-se à vaga" invisível e o fluxo impossível de reproduzir de forma determinística. Testes de integração com MSW resolvem isso ao controlar exatamente o que cada endpoint retorna.

---

## 2. Arquitetura de Testes

| Tipo | Ferramenta | Arquivo principal | Roda contra | Quando usar |
|------|------------|-------------------|-------------|-------------|
| E2E | Playwright | `e2e/empregos.spec.ts` | Servidor Next.js real (homolog) | Navegação, renderização, estado real do banco |
| Integração | Vitest + MSW | `src/app/.../__tests__/*.test.*` | Handlers MSW em Node | Lógica de submit, tratamento de erros, fluxos de componente |

```
E2E (Playwright)
  └── browser → Next.js → APIs de homologação → banco real

Integração (Vitest + MSW)
  └── Node → componente/action → MSW intercepta fetch → resposta mockada
```

**Infraestrutura MSW** (`src/test/mocks/handlers.ts`):

| Handler | Método | Resposta padrão |
|---------|--------|-----------------|
| `/api/v1/empregabilidade/curriculo/:cpf` | GET | `200` — objeto currículo vazio |
| `/api/v1/empregabilidade/candidaturas` | POST | `201` — `{ id: "candidatura-123" }` |

Para simular erros em testes individuais, use `server.use()` para sobrescrever o handler padrão por escopo de teste (o `afterEach` restaura automaticamente via `server.resetHandlers()`).

---

## 3. Catálogo E2E

**Arquivo:** `e2e/empregos.spec.ts` — **69 testes** em **11 suítes**

### 3.1 Home de Empregos — Público (6 testes)

| Teste | O que verifica |
|-------|----------------|
| Logo e ícone de busca | Logo "Oportunidades Cariocas" e link `a[href="/busca?tipo=empregos"]` visíveis |
| Header deslogado | Ícone de ajuda aponta para `/servicos/empregos/faq` |
| Seção "Vagas mais recentes" | Heading e ao menos 1 card de vaga |
| Seção "Todas as vagas" | Heading visível |
| Ausência do card de candidaturas | Texto "Candidaturas enviadas" não aparece sem auth |
| Clique no card de vaga | Navega para `/servicos/empregos/[id]` |

### 3.2 Home de Empregos — Autenticado (4 testes) `🔐`

| Teste | O que verifica |
|-------|----------------|
| Header logado | Menu em `/servicos/empregos/menu` visível; ícone de ajuda ausente |
| Card "Candidaturas enviadas" | Link aponta para `/minhas-candidaturas` com subtexto correto (quando presente) |
| Clique no card | Navega para `/servicos/empregos/minhas-candidaturas` (quando presente) |
| Ausência do FAQ no header | `header a[href="/servicos/empregos/faq"]` com count 0 |

### 3.3 Busca de Empregos — Público (6 testes)

| Teste | O que verifica |
|-------|----------------|
| Navegar via ícone | Input de busca e seção "Mais recentes" visíveis em `/busca?tipo=empregos` |
| Sugestões dinâmicas | Lista de vagas mais recentes carregada antes de pesquisar |
| Digitar 3+ caracteres | Seção "Resultados da Pesquisa" ou mensagem de vazio aparece |
| Badge "Emprego" | Resultados de vagas exibem badge verde (quando há resultados) |
| Limpar via botão X | Volta ao estado inicial com "Mais recentes" |
| Busca via URL `?q=` | Parâmetro `q` dispara busca automaticamente ao carregar a página |

### 3.4 Página da Vaga — Público (6 testes)

| Teste | O que verifica |
|-------|----------------|
| Carregamento | `h1`, "Inscrições até" e seção "Informações gerais" |
| Labels de informações | Valor, Regime, Modelo, Local, Data limite |
| Botões de ação | Voltar e Compartilhar visíveis |
| CTA deslogado | "Fazer login para se candidatar" visível |
| Link de empresa | Navega para `/servicos/empresas/[cnpj]` quando CNPJ presente |
| Etapas do processo | Card de etapas visível quando a vaga tem etapas |

### 3.5 Página da Vaga — Autenticado (3 testes) `🔐`

| Teste | O que verifica |
|-------|----------------|
| CTA ou feedback | "Candidatar-se à vaga" **ou** card de feedback (`.or()` — tolera ambos os estados) |
| Link de inscrição | Botão aponta para `/[id]/inscricao` quando presente |
| Vaga com candidatura | Card de feedback e etapas visíveis ao acessar de "Minhas candidaturas" |

### 3.6 Fluxo de Candidatura — Autenticado (5 testes) `🔐`

> Testes condicionais: pulam com `test.skip` se o usuário já está inscrito na vaga encontrada por `getFirstVagaHref`.

| Teste | O que verifica |
|-------|----------------|
| Estado inicial da página | Um dos 3 estados do carousel: bem-vindo, confirmar informações ou currículo |
| Tela bem-vindo | Título "Bem vindo ao Cadastro..." e botão "Continuar" habilitado |
| Tela confirmar informações | CPF formatado e botão "Continuar" visíveis |
| Currículo no fluxo | Botão "Continuar" no rodapé (ausente na versão standalone) |
| Redirect sem auth | Acesso a `/inscricao` sem cookies redireciona para autenticação |

### 3.7 Meu Currículo — Standalone — Autenticado (22 testes) `🔐`

| Grupo | Testes |
|-------|--------|
| Estrutura geral | Heading, 4 accordions, ausência do botão "Continuar" |
| Accordion Formação | Abertura, campos (Escolaridade, Tipo, Nome do Curso, Instituição, Status, Ano, Idiomas), adicionar/remover formações e idiomas, cancelar fecha accordion, drawers com todas as opções |
| Discard Changes | Modal ao fechar com dados não salvos; "Cancelar" mantém, "Descartar" reverte |
| Accordion Experiência Profissional | Campos Cargo/Empresa/"Meu emprego atual", botões Salvar/Cancelar, drawer Experiência comprovada (Sim/Não) |
| Accordion Situação atual | Campo "Encontra-se", campo condicional de tempo de desemprego, drawers Disponibilidade e Tipo de vínculo, botões Salvar/Cancelar |
| Accordion Termos de Uso | Texto dos termos, checkbox, ícone check verde após aceitar |

### 3.8 Página da Empresa — Público (4 testes)

| Teste | O que verifica |
|-------|----------------|
| Carregamento | Nome, "Sobre a empresa", "Vagas ofertadas pela empresa" |
| Informações | Setor, Tamanho da empresa, Especializações |
| Estado com/sem vagas | Cards de vagas **ou** "Nenhuma vaga aberta no momento." |
| Botão Voltar | Retorna para a vaga anterior |

### 3.9 Minhas Candidaturas — Autenticado (6 testes) `🔐`

| Teste | O que verifica |
|-------|----------------|
| Heading | "Minhas candidaturas" visível |
| Estado vazio | "Você ainda não possui candidaturas enviadas" |
| Badges de status | Em análise, Aprovado, Não selecionado, Vaga encerrada, Vaga descontinuada |
| Estrutura do card | `<a>` com `href=/servicos/empregos/[id]` |
| Clique no card | Navega para a vaga (tolerando vaga removida) |
| Progresso | `[role="progressbar"]` ou "Esta vaga não possui etapas." |

### 3.10 Menu de Empregos — Autenticado (4 testes) `🔐`

| Teste | O que verifica |
|-------|----------------|
| Estrutura | Heading "Menu" com 3 itens e hrefs corretos |
| Minhas candidaturas | Clique navega e exibe heading correto |
| Meu currículo | Clique navega e exibe heading correto |
| FAQ | Clique navega e exibe heading correto |

### 3.11 FAQ de Empregos — Público (3 testes)

| Teste | O que verifica |
|-------|----------------|
| Heading | "FAQ" visível |
| Perguntas básicas | Plataforma, candidatura, conta Gov.br |
| Perguntas de acompanhamento | Como acompanhar candidatura, significado dos status |

---

## 4. Catálogo de Integração

### 4.1 `enviar-candidatura-action.test.ts` — 10 testes

**Arquivo:** `src/app/(app)/(logged-in-out)/servicos/(servicos)/empregos/[id]/inscricao/__tests__/enviar-candidatura-action.test.ts`

Testa a server action que faz `GET /curriculo/:cpf` + `POST /candidaturas`.

| Grupo | Teste | Cenário MSW |
|-------|-------|-------------|
| Sucesso | Happy path | GET 200 + POST 201 → `{ success: true }` |
| Sucesso | Com respostas adicionais | Payload contém `respostas_info_complementares` |
| Sucesso | Array vazio de respostas | Payload não contém `respostas_info_complementares` |
| Erro candidatura | 400 com message | Retorna `error: "Usuário já inscrito nesta vaga"` |
| Erro candidatura | 400 sem message | Retorna `error: "Oops! Algo deu errado."` |
| Erro candidatura | 500 | Retorna `error: "Não foi possível enviar sua candidatura."` |
| Erro candidatura | Falha de rede | `success: false` com `error` definido |
| Erro currículo | 404 | Retorna `error: "Não foi possível carregar seu currículo."` |
| Erro currículo | Falha de rede | `success: false` com `error` definido |
| Erro auth | CPF ausente no token | Retorna `error: "CPF não encontrado. Faça login novamente."` |

### 4.2 `confirmar-informacoes-content.integration.test.tsx` — 13 testes

**Arquivo:** `src/app/(app)/(logged-in-out)/servicos/(servicos)/empregos/[id]/inscricao/confirmar-informacoes/__tests__/confirmar-informacoes-content.integration.test.tsx`

Testa o componente de confirmação de dados pessoais antes de se candidatar.

| Grupo | Teste |
|-------|-------|
| Exibição | CPF formatado (`123.456.789-01`) |
| Exibição | Nome em title case |
| Exibição | Celular preenchido não exibe alerta |
| Exibição | E-mail preenchido não exibe alerta |
| Campos obrigatórios | Phone nulo → "Informe seu celular" + botão desabilitado |
| Campos obrigatórios | Email nulo → "Informe seu e-mail" + botão desabilitado |
| Campos obrigatórios | `phoneNeedsUpdate: true` → alerta + botão desabilitado |
| Campos obrigatórios | `emailNeedsUpdate: true` → alerta + botão desabilitado |
| Botão habilitado | Phone + email ok → botão não desabilitado |
| Botão habilitado | Clique chama `onContinuar` 1x |
| Botão habilitado | Sem `onContinuar` → navega para `/inscricao/curriculo` |
| Campos opcionais | Gênero ausente → "Informe seu gênero" |
| Campos opcionais | Sem campos opcionais → botão permanece habilitado |

### 4.3 `perguntas-adicionais-content.integration.test.tsx` — 12 testes

**Arquivo:** `src/app/(app)/(logged-in-out)/servicos/(servicos)/empregos/[id]/inscricao/confirmar-informacoes/perguntas-adicionais/__tests__/perguntas-adicionais-content.integration.test.tsx`

Testa o componente de perguntas adicionais da vaga (schema Zod dinâmico por tipo de campo).

| Grupo | Teste |
|-------|-------|
| Renderização | Heading "Perguntas adicionais" |
| Renderização | Campo `resposta_curta` exibe título |
| Renderização | Campo `resposta_numerica` exibe título |
| Renderização | Campo `selecao_unica` exibe título |
| Renderização | Campo `selecao_multipla` exibe título |
| Renderização | Mix dos 4 tipos todos visíveis |
| Renderização | Botão "Finalizar inscrição" visível |
| Validação | Campo obrigatório vazio → toast de erro de validação |
| Submit | Chama `onEnviarCandidatura` com respostas formatadas |
| Submit | Chama `onEnviarCandidatura` com `vagaId` correto |
| Erro da action | `success: false` com error → toast com a mensagem |
| Erro da action | `success: false` sem error → toast genérico |

---

## 5. Tabela de Regressão

Legenda: ✅ Coberto · ⚠️ Coberto parcialmente · ❌ Descoberto

| Fluxo crítico | E2E | Integração | Notas |
|---------------|-----|------------|-------|
| Browse público de vagas (home, cards, vaga detalhe) | ✅ | — | 15 testes E2E cobrem home + detalhe público |
| Busca de empregos (`/busca?tipo=empregos`) | ✅ | — | 6 testes E2E; resultados dependem de dados reais |
| CTA deslogado na vaga → link de login | ✅ | — | E2E verifica presença do botão |
| Detalhe da vaga autenticado (CTA ou feedback) | ✅ | — | `.or()` tolera ambos os estados |
| Fluxo de inscrição — carousel de steps | ⚠️ | — | E2E cobre cada step individualmente; submit final não é E2E por risco de estado |
| Envio de candidatura (action `enviarCandidatura`) | — | ✅ | 10 cenários MSW cobrindo happy path, erros 400/500, currículo ausente, CPF ausente |
| Confirmar informações pessoais | ⚠️ | ✅ | E2E cobre renderização; integração cobre enable/disable do botão e callbacks |
| Perguntas adicionais da vaga | — | ✅ | 12 cenários: todos os tipos de campo, validação Zod, submit, erros |
| Meu Currículo — Formação | ✅ | — | 10 testes E2E (campos, add/remove, drawers, cancel) |
| Meu Currículo — Experiência Profissional | ✅ | — | 3 testes E2E (campos, salvar/cancelar, drawer comprovada) |
| Meu Currículo — Situação atual | ✅ | — | 5 testes E2E (campo encontra-se, condicional desemprego, drawers) |
| Meu Currículo — Termos de Uso | ✅ | — | 2 testes E2E (checkbox, badge verde) |
| Meu Currículo — Discard Changes | ✅ | — | Modal de descarte com cancelar e descartar |
| Save das seções do currículo (actions) | ❌ | ❌ | `save-formacao-action`, `save-experiencia-action`, `save-situacao-action` sem testes |
| Minhas Candidaturas | ✅ | — | 6 testes E2E (estados, badges, navegação) |
| Página da Empresa | ✅ | — | 4 testes E2E (condicional — só cobre quando vaga tem CNPJ) |
| Menu de Empregos | ✅ | — | 4 testes E2E (links + navegação) |
| FAQ | ✅ | — | 3 testes E2E (heading + perguntas) |

---

## 6. Como Usar a Tabela de Regressão

### Quando consultar

- **Antes de abrir um PR** que toca qualquer arquivo de empregabilidade: verifique se o fluxo afetado tem cobertura adequada.
- **Após refatorar um componente**: confirme que os testes de integração correspondentes ainda cobrem os cenários críticos.
- **Ao adicionar uma nova etapa ao fluxo de inscrição**: marque o fluxo como ⚠️ ou ❌ até que testes sejam adicionados.
- **Ao corrigir um bug**: adicione um teste que reproduza o bug antes do fix e atualize a tabela.

### O que cada coluna significa

| Coluna | Descrição |
|--------|-----------|
| **E2E** | Testado contra dados reais de homologação via Playwright |
| **Integração** | Testado com MSW interceptando HTTP, sem banco real |

| Símbolo | Significado |
|---------|-------------|
| ✅ | Cobertura completa para os cenários críticos do fluxo |
| ⚠️ | Cobertura parcial — navegação testada mas lógica de negócio ou erros não cobertos |
| ❌ | Sem cobertura — qualquer mudança neste fluxo é risco de regressão silenciosa |

### Como atualizar a tabela

1. **Novo teste adicionado:** altere o símbolo da célula correspondente. Se era ❌, mude para ⚠️ ou ✅ conforme a profundidade da cobertura.
2. **Fluxo modificado:** se a mudança invalida um teste existente, marque como ⚠️ até o teste ser atualizado.
3. **Nova feature:** adicione uma nova linha com ❌ em ambas as colunas e crie os testes antes de marcar como ✅.

### O que fazer quando um fluxo está ❌

1. Identifique se é melhor cobrir via **E2E** (fluxo de navegação, estado real) ou **Integração** (lógica de submit, erros de API).
2. Para integração: siga o padrão de `enviar-candidatura-action.test.ts` — importe a função/componente, use `server.use()` para cenários de erro.
3. Para E2E: siga o padrão de `empregos.spec.ts` — use `test.skip` para condicionais de estado e `getFirstVagaHref` para evitar IDs hardcoded.
4. Atualize esta tabela após criar os testes.

### Lacuna conhecida prioritária

As server actions de save do currículo estão ❌ em ambas as colunas:

- `save-formacao-action.ts`
- `save-experiencia-action.ts`
- `save-situacao-action.ts`
- `save-termos-accept-action.ts`

O padrão para cobri-las é o mesmo de `enviar-candidatura-action.test.ts`: importar a action, mockar o handler MSW do endpoint correspondente, testar happy path + erros.

---

## 7. Como Executar os Testes

### Testes de Integração (Vitest)

```bash
# Todos os testes de integração (modo watch)
npm test

# Todos os testes uma vez
npm run test:run

# Arquivo específico por nome
npm run test:run -- "enviar-candidatura-action"
npm run test:run -- "confirmar-informacoes-content"
npm run test:run -- "perguntas-adicionais-content"

# Todos os testes de empregabilidade de integração
npm run test:run -- "empregos"

# Com relatório de cobertura
npm run test:coverage

# UI interativa do Vitest
npm run test -- --ui
```

### Testes E2E (Playwright)

```bash
# Todos os testes E2E
npm run test:e2e

# Só o spec de empregos
npx playwright test e2e/empregos.spec.ts

# Suite específica por nome
npx playwright test --grep "busca"
npx playwright test --grep "Meu Currículo"
npx playwright test --grep "minhas candidaturas"

# Somente testes públicos (sem E2E_ACCESS_TOKEN)
npx playwright test --grep "público"

# Com UI interativa
npm run test:e2e:ui

# Modo headed (browser visível)
npx playwright test e2e/empregos.spec.ts --headed

# Ver relatório HTML após execução
npx playwright show-report
```

### Variáveis de ambiente para E2E

Crie um arquivo `.env.e2e` na raiz (não commitar):

```bash
E2E_ACCESS_TOKEN=<jwt-de-homologacao>
E2E_REFRESH_TOKEN=<refresh-token-opcional>
```

Testes autenticados (marcados com `🔐` no catálogo) são automaticamente pulados com `test.skip` quando `E2E_ACCESS_TOKEN` não está definido — o pipeline não falha, mas a cobertura fica reduzida.
