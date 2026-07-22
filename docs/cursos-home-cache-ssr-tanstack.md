# Home de cursos: SSR + TanStack Query (cache unificado)

## Por que isso existe

Na home `/servicos/cursos` há duas seções que podem mostrar o **mesmo curso**:

- **Mais recentes** — primeiros 4 da listagem
- **Todos os cursos** — página paginada (20 por página)

Se cada seção tiver fetch/cache próprio, os cards correspondentes podem ficar **desatualizados entre si** (TTL ou snapshot diferente). Por isso a página 1 usa **um único snapshot** compartilhado.

---

## Como SSR e TanStack Query convivem

Não é “só SSR” nem “só TanStack”. É um pipeline em duas camadas:

```
┌─────────────────────────────────────────────────────────────┐
│  Servidor (RSC)                                             │
│  page.tsx → getDalCourses (mesmos params da API de busca)   │
│  Next Data Cache: force-cache + revalidate 300s             │
│  Passa initialCoursesPage como props para o client          │
└───────────────────────────┬─────────────────────────────────┘
                            │ props (HTML + payload RSC)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Client (TanStack Query)                                    │
│  useAllCoursesPage(page, { initialData, initialDataUpdatedAt })│
│  queryKey: ['all-courses', page]                            │
│  staleTime: 5 min (igual ao revalidate do DAL)              │
│                                                             │
│  Mais recentes  ──┐                                         │
│                   ├── leem o MESMO cache da page 1          │
│  Todos os cursos ─┘                                         │
└─────────────────────────────────────────────────────────────┘
```

### Papel do SSR

1. Busca a **página 1** no servidor com os mesmos parâmetros de `/api/courses/search`:
   - `page: 1`
   - `limit: 20` (`COURSES_PAGE_SIZE`)
   - `status: COURSE_LISTING_STATUS_CSV`
   - `sort: availability`
2. Usa o DAL (`getDalCourses`) → cache Next.js de **5 minutos** (`revalidate: 300`), tag `courses`.
3. Entrega `initialCoursesPage` (`courses` + `pagination`) para `CoursePageClient`.

Benefícios: HTML já com dados (sem flash vazio na page 1), SEO, e uma entrada de Data Cache alinhada à BFF de busca.

### Papel do TanStack Query

1. Hidrata `['all-courses', 1]` com esse snapshot SSR (`initialData` + `initialDataUpdatedAt`).
2. **Mais recentes** e **Todos os cursos** chamam o mesmo hook `useAllCoursesPage` → mesmo `queryKey` → mesmo TTL.
3. Páginas `> 1` buscam no client via `GET /api/courses/search` (mesmo `staleTime`).
4. Depois de 5 min (`COURSES_LIST_STALE_MS`), a query fica stale e pode refetch — ainda batendo na mesma BFF/DAL.

`initialDataUpdatedAt` (capturado uma vez na montagem do client) evita que o TanStack trate o snapshot SSR como “já velho” e refetch imediato no hydrate.

### O que continua só no client (propositalmente)

Inscrições do usuário (**Meus cursos**, status de enrollment) **não** vão no SSR da listagem pública. Continuam em TanStack Query (`useUserEnrollments`) via rotas `/api/user/cursos/inscricoes` com `Cache-Control: private, no-store`, para o CDN não misturar dados autenticados. Ver [cursos-tanstack-query-migration.md](./cursos-tanstack-query-migration.md).

---

## Fluxo por seção

| Seção | Fonte na page 1 | Fonte nas pages > 1 |
|---|---|---|
| Mais recentes | `useAllCoursesPage(1)` → `slice(0, 4)` após excluir cursos inscritos | Oculta |
| Todos os cursos | Mesmo `useAllCoursesPage(1)` hidratado | `useAllCoursesPage(n)` → `/api/courses/search` |

Exclusão de cursos inscritos vale só para **Mais recentes** (`filterCoursesExcludingMyCourses`). **Todos os cursos** mostra a lista completa da página. Quando o mesmo curso aparece nas duas, os dados vêm do **mesmo cache entry**.

---

## Camadas de TTL (alinhadas)

| Camada | Valor | Onde |
|---|---|---|
| Next Data Cache (DAL) | 300s | `getDalCourses` em `src/lib/dal.ts` |
| TanStack Query | 5 min (`COURSES_LIST_STALE_MS`) | `src/lib/courses-list-query.ts` / `useAllCoursesPage` |

Antes, “Todos os cursos” usava `staleTime: 2 min` e um fetch SSR diferente (limit 100, sem `status`/`sort`) — caches independentes e pipelines distintos.

---

## Arquivos relevantes

| Arquivo | Função |
|---|---|
| `src/app/(app)/.../cursos/page.tsx` | RSC: fetch page 1 + categorias |
| `src/app/components/courses/courses-client.tsx` | Wiring: passa `initialData` para as duas seções |
| `src/app/components/courses/all-courses.tsx` | UI + paginação de “Todos os cursos” |
| `src/app/components/recently-added-courses.tsx` | UI de “Mais recentes” (apresentacional) |
| `src/hooks/courses/use-all-courses-page.ts` | Hook compartilhado |
| `src/lib/courses-list-query.ts` | Constantes, `queryKey`, `fetchCoursesPage` |
| `src/app/api/courses/search/route.ts` | BFF usada no refetch / páginas seguintes |
| `src/lib/dal.ts` | `getDalCourses` + Data Cache |

---

## Regras para não reintroduzir o bug

1. **Não** buscar listagem pública com params diferentes entre SSR e `/api/courses/search` na home.
2. **Não** dar `staleTime` diferente para “Mais recentes” vs “Todos os cursos”.
3. **Não** alimentar “Mais recentes” com props SSR isoladas e “Todos” com outra query — ambos devem usar `['all-courses', 1]` na page 1.
4. Dados de enrollment continuam client-only; não misturar no cache público do DAL.
