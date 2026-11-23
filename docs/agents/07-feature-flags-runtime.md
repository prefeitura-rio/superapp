# 07 — Feature Flags de Runtime

## Variáveis

| Variável | Tipo | Default se ausente |
|---|---|---|
| `FEATURE_SALESFORCE` | Server-side (sem `NEXT_PUBLIC_`) | `false` — seguro |
| `FEATURE_HOME_SOLICITACOES` | Server-side (sem `NEXT_PUBLIC_`) | `false` — seguro |
| `FEATURE_SGRC_HISTORICO` | Server-side (sem `NEXT_PUBLIC_`) | `false` — seguro |
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
| `FEATURE_HOME_SOLICITACOES` | `false` | Cards de Solicitações ocultos na home |
| `FEATURE_SGRC_HISTORICO` | ausente ou `false` | Sem efeito (as telas de chamados não existem) |

### Produção — Salesforce pronto, histórico SGRC ainda não

| Variável | Valor | Efeito |
|---|---|---|
| `FEATURE_SALESFORCE` | `true` | Rotas de chamados ativas; busca usa app-catalogo; footer/menu completos |
| `FEATURE_HOME_SOLICITACOES` | `true` | Cards de Solicitações visíveis na home |
| `FEATURE_SGRC_HISTORICO` | ausente ou `false` | Minhas Solicitações só com Salesforce, sem seletor; protocolo SGRC "não encontrado"; carteira mantém "Cuidados com a Cidade" |
| `SALESFORCE_SEARCH_ENABLED` | `true` | Habilita itens `source='salesforce'` na busca (ver nota) |

### Produção — tudo pronto (flip futuro)

| Variável | Valor | Efeito |
|---|---|---|
| `FEATURE_SALESFORCE` | `true` | Rotas de chamados ativas; busca usa app-catalogo; footer/menu completos |
| `FEATURE_HOME_SOLICITACOES` | `true` | Cards de Solicitações visíveis na home |
| `FEATURE_SGRC_HISTORICO` | `true` | Histórico do 1746 em Minhas Solicitações; o card da carteira sai |
| `SALESFORCE_SEARCH_ENABLED` | `true` | Habilita itens `source='salesforce'` na busca (ver nota) |

### Staging (homologação)

| Variável | Valor | Efeito |
|---|---|---|
| `FEATURE_SALESFORCE` | `true` | Integração Salesforce ativa para validação |
| `FEATURE_HOME_SOLICITACOES` | `true` | Cards de Solicitações visíveis na home |
| `FEATURE_SGRC_HISTORICO` | `true` | Histórico do 1746 (RMI) em Minhas Solicitações para validação. **Criar no Infisical antes do deploy**: sem ela, o histórico some de staging |
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
| Carteira — card "Cuidados com a Cidade" (legado 1746) | Visível | Oculto só com `FEATURE_SGRC_HISTORICO=true` (ver abaixo) |

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

### FEATURE_SGRC_HISTORICO

Histórico do 1746 legado (SGRC), servido pelo app-rmi (`BASE_API_URL_RMI`).
Exige `FEATURE_SALESFORCE=true` para ter efeito (as telas não existem sem ela).
Função: `isSgrcHistoricoEnabled()` em `src/lib/feature-flags.ts`; chega aos
client components pelo `ServerFeatureFlagsProvider` (`sgrcHistorico`). Fluxo
completo em [`../solicitacoes.md`](../solicitacoes.md).

| Superfície | `false` (ou ausente) | `true` |
|---|---|---|
| `/api/chamados?origem=sgrc&page=N` | 404, sem sessão nem RMI | `GET /citizen/{cpf}/maintenance-request` (CPF da sessão, 10 por página) |
| `/api/chamados/[protocolo]` e `/api/chamados-publico/[protocolo]` com `RIO-12345678-9` | 404, sem RMI nem Mule | `GET /maintenance-request/{protocolo}` |
| Os mesmos, com protocolo do Salesforce (`RIO-2026-00000001`) | MuleSoft/Salesforce | MuleSoft/Salesforce |
| Minhas Solicitações | Só Salesforce, sem seletor, com as abas | Seletor "Data de abertura": "abertas até 26/11/2026" (SGRC, padrão) e "abertas a partir de 27/11/2026" (Salesforce) |
| Carteira — card "Cuidados com a Cidade" | Visível | Oculto (com `FEATURE_SALESFORCE=true`) |

> **Por que a carteira acompanha:** o card mostra o mesmo histórico do RMI. Ele
> só sai quando as duas flags estão ligadas, para o histórico mudar da carteira
> para Minhas Solicitações de uma vez, sem janela em que o cidadão fique sem os
> chamados antigos. Regra em `shouldShowCaretakerCard`
> (`src/lib/maintenance-requests-utils.ts`).

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
