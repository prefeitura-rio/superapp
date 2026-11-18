# 07 — Feature Flags de Runtime

## Variáveis

| Variável | Tipo | Default se ausente |
|---|---|---|
| `FEATURE_SALESFORCE` | Server-side (sem `NEXT_PUBLIC_`) | `false` — seguro |
| `USE_MOCK_CHAMADOS` | Server-side (sem `NEXT_PUBLIC_`) | `false` — seguro |
| `FEATURE_HOME_SOLICITACOES` | Server-side (sem `NEXT_PUBLIC_`) | `false` — seguro |

Ambas são lidas em **runtime** via `process.env`. Não exigem rebuild da imagem
Docker — apenas um **restart dos pods** (rolling restart).

```
Infisical → K8s secret update → rolling restart → reflete em segundos
```

---

## Configuração por ambiente

### Produção — integração Salesforce não pronta (estado atual)

| Variável | Valor | Efeito |
|---|---|---|
| `FEATURE_SALESFORCE` | `false` | Rotas de chamados retornam 404; busca usa Typesense; footer/menu sem links de Atendimentos |
| `USE_MOCK_CHAMADOS` | `false` | Nenhum dado fictício de chamados é servido |
| `FEATURE_HOME_SOLICITACOES` | `false` | Cards de Solicitações ocultos na home |

### Produção — integração Salesforce pronta (flip futuro)

| Variável | Valor | Efeito |
|---|---|---|
| `FEATURE_SALESFORCE` | `true` | Rotas de chamados ativas; busca usa app-catalogo; footer/menu completos |
| `USE_MOCK_CHAMADOS` | `false` | Integração real com Salesforce, sem mocks |
| `FEATURE_HOME_SOLICITACOES` | `true` | Cards de Solicitações visíveis na home |
| `SALESFORCE_SEARCH_ENABLED` | `true` | Habilita itens `source='salesforce'` na busca (ver nota) |

### Staging (homologação)

| Variável | Valor | Efeito |
|---|---|---|
| `FEATURE_SALESFORCE` | `true` | Integração Salesforce ativa para validação |
| `USE_MOCK_CHAMADOS` | `true` | Dados fictícios de chamados SGRC para testes de UI |
| `FEATURE_HOME_SOLICITACOES` | `true` | Cards de Solicitações visíveis na home |
| `SALESFORCE_SEARCH_ENABLED` | `false` | Itens Salesforce filtrados da busca até `tema_geral` estar populado |

---

## O que cada flag controla

### FEATURE_SALESFORCE

| Superfície | `false` | `true` |
|---|---|---|
| Middleware | Bloqueia `/minhas-solicitacoes`, `/consulta-protocolo`, `/carta-de-servicos` | Libera |
| `/api/chamados/*` e `/api/chamados-publico/*` | 404 | Ativo |
| Busca (`/api/catalog-search`) | Typesense (app-busca-search) | MuleSoft (app-catalogo) |
| Home — banner de solicitações em andamento | Oculto | Visível |
| Footer — links de Atendimentos (Ouvidoria, LAI…) | Ocultos | Visíveis |
| Menu global — seção Atendimentos e item Carta de serviços | Ocultos | Visíveis |
| Carteira — card "Cuidados com a Cidade" (legado 1746) | Visível | Oculto |

Client components nunca leem `FEATURE_SALESFORCE` em `process.env` (no
navegador é sempre `undefined`): recebem o valor por prop de um Server
Component ou por `useRuntimeFeatureFlags()` (`src/providers/feature-flags-provider.tsx`),
alimentado pelo `RootLayout`.

### FEATURE_HOME_SOLICITACOES

Exige `FEATURE_SALESFORCE=true` para ter efeito — sem o backend Salesforce ativo
os cards não têm dados para exibir. Permite ocultar o bloco da home mantendo
as rotas, API, busca e banner ativos.

| Superfície | `false` | `true` |
|---|---|---|
| Home — cards de Solicitações (`RequestsSectionCards`) | Ocultos | Visíveis |

### USE_MOCK_CHAMADOS

| Superfície | `false` | `true` |
|---|---|---|
| `/api/chamados?origem=sgrc` | 501 Not Implemented | Serve lista SGRC fictícia |
| `/api/chamados/[protocolo]` | Vai à API real | Serve mock para protocolos SGRC e `RIO-MOCK-001..005` |
| Minhas Solicitações | Apenas dados Salesforce | Painel de histórico SGRC + protocolos mock na lista |

---

## Nota: SALESFORCE_SEARCH_ENABLED

Variável adicional em `src/app/api/catalog-search/route.ts`, independente das duas acima.

O `app-catalogo` retorna itens com `source='salesforce'` misturados aos
`source='typesense'`. Itens Salesforce não possuem `tema_geral` no metadata,
o que impede a construção da URL de detalhe e abre o bottom sheet de
redirecionamento externo no lugar da página do serviço.

Manter `false` (ou ausente) até que a Carta de Serviços no Salesforce tenha
`tema_geral` populado para todos os serviços.
