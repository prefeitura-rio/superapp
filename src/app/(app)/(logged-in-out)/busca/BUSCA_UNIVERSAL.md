# Busca Universal

Busca unificada do [pref.rio](http://pref.rio) que indexa serviços, cursos, vagas de emprego e oportunidades MEI em uma única interface, acessível pela rota`/busca`.

---

## Sumário

- [Visão geral](#visão-geral)
- [URL e parâmetros](#url-e-parâmetros)
- [Contextos de busca](#contextos-de-busca)
- [Fluxo de resultados](#fluxo-de-resultados)
- [Badges de tipo](#badges-de-tipo)
- [Navegação por resultado](#navegação-por-resultado)
- [Mais pesquisados / Mais recentes](#mais-pesquisados--mais-recentes)
- [Histórico de pesquisa](#histórico-de-pesquisa)
- [Arquitetura e arquivos](#arquitetura-e-arquivos)
- [API de catálogo](#api-de-catálogo)

---

## Visão geral

A busca universal substitui as buscas isoladas por verticais (serviços, empregos, cursos, MEI). Ela:

- Faz uma única chamada à API de catálogo (`/api/public/search`) e retorna resultados de todos os tipos.
- Prioriza o tipo do contexto atual em **"Resultados da Pesquisa"**.
- Exibe os demais tipos abaixo, em **"Você também pode estar procurando"**.
- Identifica cada resultado com um badge visual de tipo.

---

## URL e parâmetros

```
/busca?tipo=<contexto>&q=<query>
```


| Parâmetro | Obrigatório | Valores possíveis                       | Descrição                                                                                          |
| --------- | ----------- | --------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `tipo`    | Não         | `servicos`, `empregos`, `cursos`, `mei` | Define o contexto da busca. Ausência equivale a sem contexto (todos os tipos com igual prioridade) |
| `q`       | Não         | texto livre                             | Termo de busca. Sincronizado com o campo de input via `router.replace`                             |


**Exemplos:**

```
/busca                          → sem contexto (lista estática de populares)
/busca?tipo=servicos            → contexto serviços
/busca?tipo=empregos&q=pintor   → busca "pintor" priorizando empregos
/busca?tipo=cursos&q=excel      → busca "excel" priorizando cursos
/busca?tipo=mei                 → contexto MEI
```

---

## Contextos de busca

Cada contexto mapeia para um tipo da API de catálogo:


| `tipo` (URL) | Tipo na API       | Priorizado em                 |
| ------------ | ----------------- | ----------------------------- |
| `servicos`   | `service`         | Resultados da Pesquisa        |
| `empregos`   | `job`             | Resultados da Pesquisa        |
| `cursos`     | `course`          | Resultados da Pesquisa        |
| `mei`        | `mei_opportunity` | Resultados da Pesquisa        |
| *(ausente)*  | —                 | Todos os tipos com igual peso |


### Entrypoints por contexto


| Contexto   | Origem                                                       |
| ---------- | ------------------------------------------------------------ |
| `servicos` | Ícone de lupa na página `/servicos` → `/busca?tipo=servicos` |
| `empregos` | Busca na área de empregos → `/busca?tipo=empregos`           |
| `cursos`   | `/servicos/cursos/busca` redireciona → `/busca?tipo=cursos`  |
| `mei`      | Ícone de lupa no header MEI → `/busca?tipo=mei`              |


---

## Fluxo de resultados

```
usuário digita (> 2 caracteres)
        │
        ▼ debounce 500ms
GET /api/catalog-search?q=<query>   (per_page=50, sem filtro de tipo)
        │
        ▼
split client-side por type
        │
        ├── item.type === tipo do contexto  → primaryResults
        └── demais tipos                    → secondaryResults
        │
        ▼
Renderização:
┌─────────────────────────────────┐
│ Resultados da Pesquisa          │  ← primaryResults (com badge)
│  • item A  [Serviço]            │
│  • item B  [Serviço]            │
├─────────────────────────────────┤
│ Você também pode estar          │  ← secondaryResults (com badge)
│ procurando                      │     (só exibe se não vazio)
│  • item C  [Emprego]            │
│  • item D  [Curso]              │
└─────────────────────────────────┘
```

**Estado vazio (sem primários):**
Se não há `primaryResults` mas há `secondaryResults`, exibe a animação de "nenhum resultado encontrado" seguida da seção "Você também pode estar procurando" com os secundários.

Se não há resultados em nenhuma seção, exibe apenas a animação de vazio.

---

## Badges de tipo

Cada card de resultado exibe um badge identificando seu tipo:


| Tipo da API       | Badge       | Cor             |
| ----------------- | ----------- | --------------- |
| `service`         | **Serviço** | Azul            |
| `course`          | **Curso**   | Primária (roxo) |
| `job`             | **Emprego** | Verde           |
| `mei_opportunity` | **MEI**     | Laranja         |


---

## Navegação por resultado

Ao clicar em um resultado, o comportamento depende do tipo:


| Tipo              | Destino                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------- |
| `service`         | `/servicos/categoria/[tema]/[slug]` (rota interna) ou abre `ExternalLinkDrawer` se não tiver slug |
| `course`          | `/servicos/cursos/[id]`                                                                           |
| `job`             | `/servicos/empregos/[metadata.id]`                                                                |
| `mei_opportunity` | `/servicos/mei/[metadata.id]`                                                                     |


A lógica de navegação está centralizada em `handleCatalogItemClick` em [utils/navigation-helpers.ts](./utils/navigation-helpers.ts).

---

## Mais pesquisados / Mais recentes

Exibido quando o campo de busca está vazio (query ≤ 2 caracteres).

### Contextos `servicos` ou sem `tipo` — "Mais pesquisados"

Lista estática que navega diretamente para a página do serviço (sem acionar busca):


| Item                               | Destino                                                                             |
| ---------------------------------- | ----------------------------------------------------------------------------------- |
| IPTU 2026                          | `/servicos/categoria/taxas/iptu-2025-94ff5567`                                      |
| CADRio Agendamento                 | `/servicos/categoria/familia/cadrio-agendamento-770618f7`                           |
| Consulta de Multas                 | `/servicos/categoria/transporte/multa-de-transito-consulta-de-multa-1d76fc90`       |
| Alvará: Consulta prévia de local   | `/servicos/categoria/licencas/alvara-consulta-previa-de-local-a0cf6969`             |
| Licença Sanitária de Funcionamento | `/servicos/categoria/licencas/licenca-sanitaria-de-funcionamento-ffa3f857`          |
| Dívida Ativa: Débitos de IPTU      | `/servicos/categoria/tributos/consulta-de-debitos-de-iptu-em-divida-ativa-4a98e610` |


Para atualizar esta lista, edite a constante `STATIC_POPULAR` em [page.tsx](./page.tsx).

### Contextos `empregos`, `cursos`, `mei` — "Mais recentes"

Os 4 itens mais recentes do tipo do contexto, buscados dinamicamente via:

```
GET /api/catalog-search?types=<tipo>&per_page=4
```

Exibem apenas o título (sem badge/descrição), com skeleton de carregamento enquanto aguardam a resposta.

---

## Histórico de pesquisa

Exibido abaixo de "Mais pesquisados / Mais recentes" quando há itens e a query está vazia.

- **Chave localStorage:** `catalog-search-history`
- **Limite:** 10 itens (mais recente primeiro)
- **Gravado em:**
  - Toda busca confirmada (digitação + debounce ou enter)
  - Clique em item da lista "Mais pesquisados" (estática)
  - Clique em item da lista "Mais recentes" (dinâmica)
- **Remoção:** botão ✕ ao lado de cada item
- **Função utilitária:** `saveCatalogHistory(query)` exportada de [hooks/use-catalog-search.ts](./hooks/use-catalog-search.ts)

---

## Arquitetura e arquivos

```
src/app/(app)/(logged-in-out)/busca/
├── page.tsx                        # Página principal (client component)
├── loading.tsx                     # Skeleton de carregamento da rota
├── hooks/
│   └── use-catalog-search.ts       # Hook de estado, debounce, URL sync e histórico
└── utils/
    └── navigation-helpers.ts       # handleCatalogItemClick + handleBackNavigation

src/app/api/catalog-search/
└── route.ts                        # Rota server-side que proxia getApiPublicSearch

src/http-app-catalogo/
├── busca/busca.ts                  # Cliente HTTP gerado (getApiPublicSearch)
└── models/                         # Tipos gerados (ModelsSearchItem, ModelsItemType…)
```

### Por que existe a rota `/api/catalog-search`?

`customFetchAppCatalogo` usa `cookies()` do `next/headers`, que só executa em contexto server-side. A rota de API serve como proxy seguro, permitindo que o client component chame a busca sem expor tokens diretamente.

---

## API de catálogo

**Endpoint público:** `GET /api/public/search`

**Parâmetros relevantes:**


| Parâmetro            | Tipo       | Descrição                                                       |
| -------------------- | ---------- | --------------------------------------------------------------- |
| `q`                  | `string`   | Texto livre de busca                                            |
| `types`              | `string[]` | Filtrar por tipo: `service`, `course`, `job`, `mei_opportunity` |
| `page`               | `number`   | Página (default: 1)                                             |
| `per_page`           | `number`   | Itens por página, máx. 100 (default: 10)                        |
| `modalidade`         | `string`   | `presencial`, `digital`, `hibrido`                              |
| `bairro`             | `string`   | Bairro do Rio de Janeiro                                        |
| `gratuito`           | `boolean`  | `[course]` Apenas gratuitos                                     |
| `turno`              | `string`   | `[course]` `matutino`, `vespertino`, `noturno`                  |
| `regime_contratacao` | `string`   | `[job]` `CLT`, `PJ`, `temporario`                               |
| `modelo_trabalho`    | `string`   | `[job]` `presencial`, `remoto`, `hibrido`                       |
| `pcd`                | `boolean`  | `[job]` Apenas vagas PCD                                        |
| `faixa_salarial`     | `string`   | `[job]` `ate-2sm`, `2-4sm`, `acima-4sm`                         |
| `tema`               | `string`   | `[service]` Tema do serviço                                     |
| `segmento`           | `string`   | `[mei_opportunity]` Segmento do negócio                         |


A busca na rota `/api/catalog-search` atualmente encaminha apenas `q`, `types` e `per_page`. Os demais filtros podem ser adicionados conforme necessidade.