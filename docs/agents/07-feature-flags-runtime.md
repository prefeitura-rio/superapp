# 07 — Feature Flags de Runtime

## Variáveis

| Variável | Tipo | Default se ausente |
|---|---|---|
| `FEATURE_SALESFORCE` | Server-side (sem `NEXT_PUBLIC_`) | `false` — seguro |
| `USE_MOCK_CHAMADOS` | Server-side (sem `NEXT_PUBLIC_`) | `false` — seguro |
| `FEATURE_HOME_SOLICITACOES` | Server-side (sem `NEXT_PUBLIC_`) | `false` — seguro |
| `REWRITE_SERVICE_URLS_TO_HML` | Server-side (sem `NEXT_PUBLIC_`) | `false` — seguro |

Todas são lidas em **runtime** via `process.env`. Não exigem rebuild da imagem
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
| Middleware | Bloqueia `/minhas-solicitacoes`, `/consulta-protocolo`, `/carta-de-servicos`, `/termos-de-uso` | Libera |
| `/api/chamados/*` e `/api/chamados-publico/*` | 404 | Ativo |
| Busca (`/api/catalog-search`) | Typesense (app-busca-search) | MuleSoft (app-catalogo) |
| Home — banner de solicitações em andamento | Oculto | Visível |
| Footer — Termos de uso, Política de privacidade | Ocultos | Visíveis |
| Menu global — Termos de uso e política de privacidade | Oculto | Visível |
| Mapa do site — seção Atendimento | Oculta | Visível |
| Mapa do site — links Carta de serviços e Termos de uso (Informações) | Ocultos | Visíveis |
| Carteira — card "Cuidados com a Cidade" (legado 1746) | Visível | Oculto |

### FEATURE_HOME_SOLICITACOES

Exige `FEATURE_SALESFORCE=true` para ter efeito — sem o backend Salesforce ativo
os cards não têm dados para exibir. Permite ocultar o bloco da home mantendo
as rotas, API, busca e banner ativos.

| Superfície | `false` | `true` |
|---|---|---|
| Home — cards de Solicitações (`RequestsSectionCards`) | Ocultos | Visíveis |
| Footer — Ouvidoria, Lei de acesso à informação, Carta de serviços | Ocultos (requer ambas as flags) | Visíveis (requer ambas as flags) |

> **Nota:** os links do footer de Ouvidoria, LAI e Carta de serviços dependem
> de **ambas** as flags (`FEATURE_SALESFORCE=true` **e** `FEATURE_HOME_SOLICITACOES=true`).
> A razão é que esses links apontam para formulários externos do 1746 que só fazem
> sentido quando o backend Salesforce está ativo e o bloco de atendimento está habilitado.

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

---

## REWRITE_SERVICE_URLS_TO_HML (paliativo)

> **Solução paliativa, para casos específicos.** O ideal é corrigir os links
> **na origem (Salesforce)**. Se a lista de exceções crescer ou o padrão se
> repetir em muitos serviços, **não escale esta solução**: corrija o cadastro
> da Carta de Serviços.

**Problema.** O banco do Salesforce foi populado a partir da base de produção.
Com `FEATURE_SALESFORCE=true` em staging/localhost, alguns serviços (por
exemplo `/servicos/categoria/licencas/alvara-consulta-previa-de-local`) trazem
botões "Acessar serviço" que apontam para o gateway de **produção**
(`gateway-idrio.apps.rio.gov.br`), impedindo testar o fluxo de homologação.

**O que faz.** Reescreve, no servidor, URLs de produção para o equivalente de
homologação antes de chegarem ao usuário.

| Ativação | Regra |
|---|---|
| `FEATURE_SALESFORCE=true` **e** `REWRITE_SERVICE_URLS_TO_HML=true` | Reescreve |
| Qualquer outra combinação (inclusive variável ausente) | Não toca em nada |

Por padrão, só o `.env` local define a variável. **Não** está no Infisical de
staging (logo staging continua com os links de produção) e **nunca** deve ser
definida em produção.

**Onde é aplicado** (todos server-side):

| Superfície | Arquivo |
|---|---|
| Botões "Acessar serviço" e canais digitais | `src/lib/carta-servicos/mappers.ts` |
| Links `<a>` dentro dos textos HTML | `src/lib/carta-servicos/sanitize-service-html.ts` |
| PDF da Carta (botões e canais) | `src/lib/carta-servicos/pdf/carta-pdf-content.ts` |

**Regras** (`src/lib/carta-servicos/environment-url-rewrite.ts`):

1. Troca de host por tabela (`HOST_MAP`): gateway, Carioca Digital Services,
   peticionamento e Scuff.
2. No gateway, o parâmetro `urlServico` também é reescrito (decodifica,
   reescreve, recodifica).
3. `URL_OVERRIDES`: URL completa de produção para URL completa de homologação,
   para quando o **caminho** também muda (ex.: `alvara-de-licenca-para-estabelecimento`
   vira `alvara-consulta-previa-de-local`). Consultada antes da troca de host.
4. URLs inválidas, relativas, `mailto:`, `tel:` ou hosts fora da tabela voltam intactas.

**Para adicionar um caso:** novo par de hosts em `HOST_MAP`, ou nova entrada em
`URL_OVERRIDES`, com teste em `src/lib/carta-servicos/__tests__/environment-url-rewrite.test.ts`.

**Fora do escopo:** resultados de busca com `item.url` e links do ticket 1746
(`TICKET_FORM_BASE_URL`, que já tem variável própria).

**Para testar localmente** (`.env`):

```
FEATURE_SALESFORCE=true
REWRITE_SERVICE_URLS_TO_HML=true
```
