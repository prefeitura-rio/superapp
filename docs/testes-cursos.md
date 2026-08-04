# Testes — Cursos

Referência dos testes automatizados do módulo de **Cursos** (`/servicos/cursos/**`): catálogo de cenários E2E, catálogo de unit/integração e tabela de regressão.

Complementa a documentação geral de E2E em [`e2e-playwright.md`](./e2e-playwright.md) e segue o mesmo padrão de [`testes-empregabilidade.md`](./testes-empregabilidade.md).

---

## 1. Visão geral

O módulo cobre as rotas `/servicos/cursos/**` (home, detalhe, busca, categoria, FAQ, opções, meus cursos, certificados, alertas, fluxo de inscrição e troca de turma). Os testes estão divididos em duas camadas:

- **E2E (Playwright)** — `e2e/cursos.spec.ts`. Valida navegação e renderização contra um servidor Next.js real com dados de **homologação**. Públicos rodam sempre; autenticados dependem de `E2E_ACCESS_TOKEN`.
- **Unit / integração (Vitest + MSW)** — server actions de inscrição, troca de turma, cancelamento e leitura de inscrição, sem tocar a API real.

**Por que o submit final não é E2E?** O fluxo de inscrição (`confirmar-informacoes`) e a troca de turma (`trocar-turma`) terminam em ações **destrutivas/mutantes** (`Confirmar inscrição` / `Confirmar troca`). Os testes E2E abrem o fluxo e validam os steps do carousel, mas **não clicam** no botão final — mesmo critério de empregos. A lógica de submit é coberta por unit tests com MSW.

---

## 2. Arquitetura de testes

| Tipo | Ferramenta | Arquivo principal | Roda contra | Quando usar |
|------|------------|-------------------|-------------|-------------|
| E2E | Playwright | `e2e/cursos.spec.ts` | Servidor Next.js real (homolog) | Navegação, renderização, estado real |
| Unit / integração | Vitest + MSW | `src/actions/courses/__tests__/*` | Handlers MSW em Node | Actions de inscrição/troca/cancelamento |

**Base URL de cursos nos testes MSW:** `COURSES_BASE_API_URL` (`http://localhost:3002` em teste — ver `src/test/mocks/env.ts`). O `custom-fetch-course` prefixa essa URL. `getUserInfoFromToken` é mockado globalmente (`src/test/setup.ts`) retornando `{ cpf: '12345678901', name: 'Test User' }`.

---

## 3. Catálogo E2E

**Arquivo:** `e2e/cursos.spec.ts` — **22 testes** em **9 suítes** (12 públicos + 10 autenticados 🔐).

> **Helper local:** `getFirstCourseHref(page)` — abre `/servicos/cursos`, aguarda os cards client-side e retorna o href do primeiro card **visível** de curso. Evita hardcode de IDs.
>
> **Gotcha:** a home renderiza um carrossel ("Mais recentes") cujos itens off-screen têm largura/altura 0 (ocultos) e aparecem **antes** da grade "Todos os cursos" no DOM. Por isso os seletores de card e de chip de categoria usam `:visible` — sem isso, `.first()` selecionaria um item oculto do carrossel.

### 3.1 Home — público (4)

| Teste | O que verifica |
|-------|----------------|
| Logo | Header exibe `img[alt="Oportunidades Cariocas Logo"]` |
| Login | Header de visitante exibe o link `Login` |
| Cursos ou vazio | Heading `Todos os cursos` / card visível ou `Nenhum curso encontrado` |
| Card → detalhe | Clica no 1º card visível e verifica `h1` na página do curso |

### 3.2 Página do curso — público (2)

| Teste | O que verifica |
|-------|----------------|
| Título | `h1` com o título do curso |
| CTA de inscrição | Link para `confirmar-informacoes` (ou `trocar-turma`) presente quando disponível — tolera curso indisponível |

### 3.3 Busca — público (2)

| Teste | O que verifica |
|-------|----------------|
| Redirect | `/servicos/cursos/busca` → `/busca?tipo=cursos` + input `Do que você precisa?` |
| `?q=` | `/busca?tipo=cursos&q=curso` exibe `Resultados da Pesquisa` ou mensagem de vazio |

### 3.4 Categoria — público (2)

| Teste | O que verifica |
|-------|----------------|
| Navegação | Clica no 1º chip de categoria visível → `/servicos/cursos/categoria/[slug]` (h1 ou vazio) |
| Ícone de busca | Página de categoria exibe link `href="/servicos/cursos/busca"` |

### 3.5 FAQ — público (2)

| Teste | O que verifica |
|-------|----------------|
| Heading + pergunta | `h1 FAQ` e "O que é a Plataforma Oportunidades Cariocas?" |
| Perguntas | "Quem pode se inscrever?", "O que é a conta Gov.br", "Receberei certificado de conclusão do curso?" |

### 3.6 Home — autenticado 🔐 (2)

| Teste | O que verifica |
|-------|----------------|
| Menu | Header logado exibe link `/servicos/cursos/opcoes` |
| Perfil | Header logado exibe link `/meu-perfil` |

### 3.7 Menu / opções — autenticado 🔐 (2)

| Teste | O que verifica |
|-------|----------------|
| Estrutura | `h1 Menu` com Meus cursos (`/meus-cursos`), Certificados (`/certificados`), FAQ (`/faq`) |
| Navegação | Clicar em "Meus cursos" → heading `Meus cursos` |

### 3.8 Meus cursos / Certificados / Alertas — autenticado 🔐 (3)

| Teste | O que verifica |
|-------|----------------|
| Meus cursos | `h1 Meus cursos` com cards ou "Você ainda não possui nenhum curso." |
| Certificados | Heading `Certificados` ou "Você ainda não possui nenhum certificado." |
| Alertas | Item "Cursos de Tecnologia" visível |

### 3.9 Detalhe / inscrição / troca de turma — autenticado 🔐 (3)

| Teste | O que verifica |
|-------|----------------|
| CTA ou feedback | Inscrição OU "Trocar turma / horário" / "Cancelar inscrição" / "Inscrição recusada" |
| Fluxo de inscrição | Abre `confirmar-informacoes`, valida `back-button` + `Continuar`/`Confirmar inscrição` — **sem submeter**. Skip se já inscrito |
| Troca de turma | Se elegível, abre `trocar-turma` + valida `back-button` + `Continuar`/`Confirmar troca` — **sem submeter**. Skip se não inscrito |

---

## 4. Catálogo de unit / integração

### 4.1 `change-schedule.test.ts` — 8 testes

**Action:** `src/actions/courses/change-schedule.ts` → `PUT /api/v1/enrollments/:enrollmentId/schedule`

| Cenário | Esperado |
|---------|----------|
| 200 | `{ success: true }` + payload com `schedule_id` e `enrolled_unit` |
| Não autenticado (`cpf` vazio) | `{ success: false, error: 'Usuário não autenticado' }` |
| 400 com mensagem | `error` = mensagem da API |
| 400 sem mensagem | `error: 'Dados inválidos'` |
| 403 | `error: 'Você não tem permissão para esta ação'` |
| 404 | `error: 'Inscrição ou turma não encontrada'` |
| 500 | `error: 'Erro interno. Tente novamente.'` |
| Falha de rede | `success: false` com `error` definido |

### 4.2 `delete-enrollment.test.ts` — 5 testes

**Action:** `src/actions/courses/delete-enrollment.ts` → `DELETE /api/v1/courses/:courseId/enrollments/:enrollmentId`

| Cenário | Esperado |
|---------|----------|
| 200 | `{ success: true }` |
| Não autenticado | `{ success: false, error: 'User not authenticated' }` |
| 404 | `{ success: false, error: 'Erro ao cancelar inscrição' }` |
| 500 | `{ success: false, error: 'Erro ao cancelar inscrição' }` |
| Falha de rede | `{ success: false, error: 'Erro ao cancelar inscrição' }` |

### 4.3 `get-user-enrollment.test.ts` — 7 testes

**Action:** `src/actions/courses/get-user-enrollment.ts` → `GET /api/v1/courses/:courseId/enrollments?search=<cpf>&limit=1` (via DAL). A action lê `data.data.enrollments[]` e retorna a inscrição cujo `cpf` bate com o do usuário.

| Cenário | Esperado |
|---------|----------|
| CPF bate | Retorna o objeto da inscrição |
| Nenhum CPF bate | `null` |
| Lista vazia | `null` |
| Estrutura inesperada | `null` |
| Erro da API (500) | `null` |
| Não autenticado | `null` |
| Falha de rede | `null` |

### 4.4 `course-history.test.ts` — 8 testes

**Utilitário:** `src/actions/courses/course-history.ts` (histórico de cursos visitados em `localStorage`).

| Cenário | Esperado |
|---------|----------|
| `getVisitedCourses` sem histórico | `[]` |
| `getVisitedCourses` ordena por `visitedAt` desc | mais recente primeiro |
| `getVisitedCourses` com JSON inválido | `[]` + limpa a chave |
| `addVisitedCourse` | adiciona com timestamp |
| `addVisitedCourse` dedup | readicionar move para o topo (sem duplicar) |
| `addVisitedCourse` cap | mantém no máximo 10 itens |
| `removeVisitedCourse` | remove por id |
| `clearVisitedCourses` | limpa tudo |

### 4.5 `change-schedule-client.integration.test.tsx` — 4 testes

**Componente:** `.../cursos/[slug]/trocar-turma/components/change-schedule-client.tsx` (integração — Swiper/toast/action mockados; mesmo padrão de `confirm-inscription-client.integration.test.tsx`).

| Cenário | Esperado |
|---------|----------|
| Render (curso online) | Slide de seleção de turma + `back-button` + botão "Confirmar troca" |
| Botão voltar | `router.push('/servicos/cursos/[slug]')` |
| Selecionar turma + confirmar | `changeSchedule` chamado com `enrollmentId`/`courseId`/`scheduleId` + slide de sucesso |
| Erro da action | `toast.error` com a mensagem retornada |

### 4.6 Cobertura pré-existente (não alterada)

| Arquivo | Cobre |
|---------|-------|
| `src/actions/courses/__tests__/submit-inscription.test.ts` | `submitCourseInscription` (happy path, presencial/online, 400/409, rede) |
| `src/lib/__tests__/course-utils.test.ts` | Parsing/filtros de curso (ver `docs/en-us/COURSE_FILTERING_LOGIC.md`) |
| `.../confirmar-informacoes/components/__tests__/confirm-inscription-client.integration.test.tsx` | Componente do fluxo de confirmação |

---

## 5. Tabela de regressão

Legenda: ✅ Coberto · ⚠️ Coberto parcialmente · ❌ Descoberto

| Fluxo crítico | E2E | Unit/Integração | Notas |
|---------------|-----|-----------------|-------|
| Browse público (home, cards, detalhe) | ✅ | — | 6 testes E2E |
| Busca de cursos (`/busca?tipo=cursos`) | ✅ | — | Redirect + resultados |
| Categoria | ✅ | — | Navegação + ícone de busca (skip se sem categorias) |
| FAQ | ✅ | — | Heading + perguntas |
| CTA de inscrição deslogado | ✅ | — | Presença do link p/ confirmar-informacoes |
| Header/menu autenticado | ✅ | — | opcoes + perfil |
| Meus cursos / Certificados / Alertas | ✅ | — | Estados com dados ou vazio |
| Detalhe autenticado (CTA ou feedback) | ✅ | — | `.or()` tolera ambos estados |
| Fluxo de inscrição — steps | ⚠️ | ✅ | E2E cobre steps sem submit; submit via `submit-inscription.test.ts` |
| Envio de inscrição (`submitCourseInscription`) | — | ✅ | Pré-existente |
| Troca de turma (`changeSchedule`) | ⚠️ | ✅ | E2E abre o fluxo (skip se inelegível); action via `change-schedule.test.ts`; client via `change-schedule-client.integration.test.tsx` |
| Cancelar inscrição (`deleteEnrollment`) | — | ✅ | `delete-enrollment.test.ts` |
| Leitura de inscrição (`getUserEnrollment`) | — | ✅ | `get-user-enrollment.test.ts` |
| Histórico de cursos visitados (`course-history`) | — | ✅ | `course-history.test.ts` |
| Filtros de curso (`course-utils`) | — | ✅ | Pré-existente |

---

## 6. Como executar

### E2E (Playwright)

```bash
# Todos os testes de cursos
npx playwright test e2e/cursos.spec.ts

# Só os públicos (sem E2E_ACCESS_TOKEN)
npx playwright test e2e/cursos.spec.ts --grep "público"

# Só autenticados
npx playwright test e2e/cursos.spec.ts --grep "autenticado"
```

> Requer as base URLs de homolog (`COURSES_BASE_API_URL`, `BASE_API_URL_APP_BUSCA_SEARCH`, …) no ambiente/`.env.local`. Ver [`e2e-playwright.md`](./e2e-playwright.md). Testes autenticados exigem `E2E_ACCESS_TOKEN` em `.env.e2e` (pulam com `test.skip` se ausente).

### Unit / integração (Vitest)

```bash
# Todas as actions de cursos
npm run test:run -- "courses"

# Arquivo específico
npm run test:run -- "change-schedule"
npm run test:run -- "delete-enrollment"
npm run test:run -- "get-user-enrollment"
```
