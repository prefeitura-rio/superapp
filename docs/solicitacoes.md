# Solicitações (chamados): histórico SGRC e Salesforce

Como funcionam `/minhas-solicitacoes`, `/consulta-protocolo` e `/solicitacoes/[id]`
depois da integração do histórico do 1746 legado (SGRC) com a API real do app-rmi.

> **Estado atual:** não há mais mock de chamados. O histórico SGRC vem do
> [app-rmi](https://github.com/prefeitura-rio/app-rmi); os chamados novos vêm do
> Salesforce via MuleSoft. O histórico SGRC fica atrás de `FEATURE_SGRC_HISTORICO`,
> desligada em produção até a feature estar pronta. A busca "Encontre sua
> solicitação" está desligada nas duas origens até o RMI ter um query param de busca.

## Feature flags e variáveis

**Duas flags, as duas server-side** (sem `NEXT_PUBLIC_`, lidas em runtime, só
`'true'` liga, ausente = desligada):

- `FEATURE_SALESFORCE` liga as telas e as rotas de chamados.
- `FEATURE_SGRC_HISTORICO` liga a parte SGRC dentro delas. Só tem efeito com
  `FEATURE_SALESFORCE=true`.

| Variável | Tipo | Papel nestas telas |
|---|---|---|
| `FEATURE_SALESFORCE` | Flag server-side, runtime | Liga as telas e as rotas `/api/chamados*` |
| `FEATURE_SGRC_HISTORICO` | Flag server-side, runtime | Liga o histórico SGRC: seletor em Minhas Solicitações, lista e consulta de protocolos `RIO-12345678-9`. Desligada, a carteira mantém o card legado |
| `FEATURE_HOME_SOLICITACOES` | Flag server-side, runtime | Só os cards de Solicitações da home e alguns links do footer. Exige `FEATURE_SALESFORCE=true`. Não afeta as telas abaixo |
| `BASE_API_URL_RMI` | URL (não é flag) | Histórico SGRC: lista e detalhe |
| `BASE_API_URL_PREF_RIO_CIDADAO` | URL (não é flag) | Salesforce logado: lista e detalhe |
| `BASE_API_URL_PREF_RIO_CHAMADOS_PUBLICO` | URL (não é flag) | Salesforce: consulta pública por protocolo |

Removidas: `USE_MOCK_CHAMADOS` (e `isSgrcHistoryMockEnabled`), junto com todos os
dados fictícios (`RIO-MOCK-*` e o histórico SGRC fixo). `NEXT_PUBLIC_FEATURE_CHAMADOS`
continua no `.env.example` só como referência legada, sem uso no código.

Valores por ambiente: [`agents/07-feature-flags-runtime.md`](agents/07-feature-flags-runtime.md).

### Combinações

| `FEATURE_SALESFORCE` | `FEATURE_SGRC_HISTORICO` | Minhas Solicitações | Consulta de protocolo | Card "Cuidados com a Cidade" |
|---|---|---|---|---|
| `false` | qualquer | `/not-found` (middleware) | `/not-found` | Visível (produção hoje) |
| `true` | ausente/`false` | Só Salesforce, sem seletor, com as abas | Só protocolo Salesforce; SGRC → "não encontrado" | Visível |
| `true` | `true` | Seletor, SGRC padrão + Salesforce | Os dois formatos | Oculto |

O histórico do 1746 aparece em **um** lugar só: a carteira ou Minhas Solicitações. Ele
só sai da carteira quando as duas flags estão ligadas (`shouldShowCaretakerCard`, em
`src/lib/maintenance-requests-utils.ts`), para não haver janela sem acesso aos chamados
antigos.

### O que muda com `FEATURE_SALESFORCE`

| Superfície | `false` (produção hoje) | `true` (staging) |
|---|---|---|
| `/minhas-solicitacoes`, `/consulta-protocolo`, `/solicitacoes/*` | Reescritas para `/not-found` (`src/middleware.ts:213`) | Ativas |
| `/api/chamados`, `/api/chamados/[protocolo]`, `/api/chamados-publico/[protocolo]` | 404 | Ativas |
| Banner "Você possui N solicitações" na home | Oculto | Visível (conta só Salesforce, ver [Limitações](#limitações-e-pendências)) |
| Menu global → Atendimentos | Sem links | Minhas solicitações, Consulta de protocolo, Ouvidoria, LAI |

### O que muda com `FEATURE_SGRC_HISTORICO` (com `FEATURE_SALESFORCE=true`)

| Superfície | `false` (ou ausente) | `true` |
|---|---|---|
| `/minhas-solicitacoes` | Só Salesforce, sem seletor (`page.tsx` renderiza `RequestsList` direto) | `OrigemChamados`: seletor "Data de abertura", SGRC como padrão |
| `GET /api/chamados?origem=sgrc` | 404, sem olhar sessão nem chamar o RMI | Lista do RMI |
| `GET /api/chamados/{RIO-12345678-9}` e `/api/chamados-publico/{RIO-12345678-9}` | 404, sem RMI nem Mule | Detalhe/consulta no RMI |
| Protocolo do Salesforce e `/api/chamados` sem `origem` | Inalterados | Inalterados |
| Carteira → card "Cuidados com a Cidade" | Visível | Oculto |

A flag chega aos client components da carteira pelo `ServerFeatureFlagsProvider`
(`sgrcHistorico`), lido no root layout a cada requisição.

### Como ligar em produção

1. Validar em staging (lá a flag fica `true`).
2. No Infisical de produção, criar `FEATURE_SGRC_HISTORICO=true` (com
   `FEATURE_SALESFORCE=true`).
3. Os pods recarregam sozinhos (`secrets.infisical.com/auto-reload`); não há build
   nem deploy. Para desligar, apagar a variável ou pôr `false`.

## Telas

| Rota | Acesso | O que faz |
|---|---|---|
| `/minhas-solicitacoes` | Logado | Lista os chamados do cidadão, com seletor de origem |
| `/consulta-protocolo` | Público | Consulta um protocolo: abre o detalhe direto ou lista os chamados do protocolo |
| `/solicitacoes/[id]?os=` | Público | Detalhe. Tenta a versão do titular e cai na pública |
| `/solicitacoes` | — | Redireciona: logado → `/minhas-solicitacoes`, senão → `/consulta-protocolo` |

## Arquitetura

O navegador só fala com o BFF (`src/app/api/`). O BFF escolhe o backend **pelo formato
do protocolo**:

| Formato | Exemplo | Backend |
|---|---|---|
| SGRC (`^RIO-\d{8}-\d$`) | `RIO-12345678-9` | app-rmi |
| Qualquer outro | `RIO-2026-00000001` | MuleSoft → Salesforce (inalterado) |

Os formatos não colidem, e o RMI responde 400 para protocolo do Salesforce. A
comparação aceita minúsculas e espaços: o protocolo é normalizado para maiúsculas antes
de ir ao RMI. A regex fica em `src/lib/chamados/sgrc.ts:20`.

```
Navegador
 ├─ /minhas-solicitacoes ─────────── page.tsx (server) ── listChamados() ──────────── MuleSoft (Salesforce)
 │     └─ origem SGRC (client) ──── GET /api/chamados?origem=sgrc&page=N ─────────── RMI GET /v1/citizen/{cpf}/maintenance-request
 │
 ├─ /solicitacoes/[id] ───────────── GET /api/chamados/{protocolo} ─┬─ SGRC ──────── RMI GET /v1/maintenance-request/{protocolo}
 │     (se não for o titular,                                       └─ outro ─────── MuleSoft (cidadão)
 │      cai na consulta pública)
 │
 └─ /consulta-protocolo ──────────── GET /api/chamados-publico/{protocolo} ─┬─ SGRC ─ RMI GET /v1/maintenance-request/{protocolo}
                                                                            └─ outro  MuleSoft (público)
```

Arquivos principais:

| Arquivo | Responsabilidade |
|---|---|
| `src/lib/chamados/sgrc.ts` | Regex do protocolo e mappers RMI → formato da tela. Funções puras |
| `src/app/api/chamados/route.ts` | Lista Salesforce e, com `?origem=sgrc`, lista SGRC |
| `src/app/api/chamados/[protocolo]/route.ts` | Detalhe do titular (SGRC ou Salesforce) |
| `src/app/api/chamados-publico/[protocolo]/route.ts` | Consulta pública (SGRC ou Salesforce) |
| `src/lib/dal.ts:170` | `getDalCitizenCpfMaintenanceRequest`, a mesma função da carteira |
| `src/http/` | Clients Orval do RMI (`npx orval --project rmi`) |
| `minhas-solicitacoes/components/origem-chamados.tsx` | Seletor de origem e carregamento paginado do SGRC |
| `minhas-solicitacoes/components/requests-list.tsx` | Abas, cards, paginação e busca (desligada) |
| `minhas-solicitacoes/helpers.ts` | `normalizeStatus`, `mapCategoria`, `formatDate` |

## Contrato das rotas BFF (parte SGRC)

Todas respondem 404 se `FEATURE_SALESFORCE` não for `'true'`. A parte SGRC (lista com
`origem=sgrc` e protocolo `RIO-12345678-9`) também responde 404 se
`FEATURE_SGRC_HISTORICO` não for `'true'`, antes de olhar a sessão e sem chamar RMI
nem Mule. O que vem abaixo vale com as duas ligadas. Respostas SGRC sempre
vêm com `Cache-Control: private, no-store`. Erros do RMI (texto em inglês, mensagens do
gateway) **nunca** chegam ao navegador: só o status e uma mensagem genérica em
português.

### `GET /api/chamados?origem=sgrc&page=N`

- **Sessão:** obrigatória. O CPF sai do token da sessão (`getUserInfoFromToken`), nunca
  do navegador. Token sem CPF de 11 dígitos responde 401 sem chamar o RMI.
- **Upstream:** `GET /v1/citizen/{cpf}/maintenance-request?page=N&per_page=10`.
- **`page`:** inteiro de até 6 dígitos; qualquer outra coisa vira 1. `per_page` é fixo
  em 10 (`POR_PAGINA_SGRC`) no servidor.
- **Cache:** passa pela DAL, com cache de dados do Next de até 10 min (tag
  `maintenance-{cpf}`, a mesma da carteira).

```json
{
  "protocolos": [
    {
      "protocolo": "RIO-48291037-6",
      "status": "Em andamento",
      "dataAbertura": "2026-09-12T11:20:00Z",
      "ordens_de_servico": [
        {
          "codigoOs": "17469001",
          "servico": "Lâmpada queimada",
          "categoria": "Reclamação",
          "status": "Em andamento",
          "dataAbertura": "2026-09-12T11:20:00Z",
          "isAcessoInformacao": false
        }
      ]
    }
  ],
  "pagination": { "page": 1, "perPage": 10, "total": 11, "totalPages": 2 }
}
```

Cada chamado do RMI vira um item com uma ordem de serviço. O formato é o mesmo da
lista Salesforce, para a tela reaproveitar o mapeamento.

| Situação | Resposta |
|---|---|
| Sem sessão / token sem CPF | 401 |
| RMI 4xx/5xx (400, 401, 403, 429, 500, 503…) | Mesmo status, `{ "error": "Não foi possível consultar os chamados" }` |
| Falha de rede ou corpo 200 que não é JSON | 502, mesma mensagem |

### `GET /api/chamados/{protocolo}` (detalhe do titular)

- **Sessão:** obrigatória (cookie `access_token`); sem ela, 401 sem chamar o RMI.
- **Upstream:** `GET /v1/maintenance-request/{protocolo}` com o Bearer da sessão. O RMI
  marca `titular: true` nos chamados cujo CPF é o do token.
- Ficam **só os chamados do titular**. Sem nenhum, responde 404, e a página
  `/solicitacoes/[id]` cai na consulta pública.
- Inclui descrição, logradouro, bairro e todos os andamentos.

### `GET /api/chamados-publico/{protocolo}` (consulta pública)

- **Sessão:** não exige. Se houver, o Bearer vai junto (o client do RMI sempre o anexa)
  e o RMI pode devolver rua e descrição. **O mapper descarta os dois**, seja quem for o
  titular.
- Mostra **todos** os chamados do protocolo, só com bairro e o último andamento.

| Situação (as duas rotas de detalhe) | Resposta |
|---|---|
| RMI 404, ou 400 (protocolo inválido) | 404, `{ "error": "Chamado não encontrado" }` |
| Outros erros do RMI | Mesmo status, `{ "error": "Não foi possível consultar o chamado" }` |
| Falha de rede ou corpo inválido | 502, mesma mensagem |

Formato do detalhe: o mesmo que o Salesforce já entrega à página
(`protocolo`, `status`, `dataAbertura`, `dataUltimaAtualizacao`, `loaded_at`,
`ordens_de_servico[]`), e por isso `/solicitacoes/[id]` e `/consulta-protocolo` não
mudaram.

## Mapeamento RMI → tela

| Tela | RMI | Observação |
|---|---|---|
| `protocolo` (lista) | `protocolo` ou primeiro item de `protocolos[]` no formato SGRC | Vazio → card **sem link** (não dá para abrir o detalhe) |
| `codigoOs` | `id_chamado` (lista: cai em `id`) | Vai na URL como `?os=` |
| `servico` (título) | `subtipo` → `tipo` → `categoria` → `—` | |
| `categoria` (legenda do card) | `categoria`, via `mapCategoria` | Reclamação/Elogio/Sugestão → Ouvidoria; Solicitação/Informação → Serviços; outro valor passa direto |
| Detalhe: "Categoria" / "Subcategoria" | `tipo` / `subtipo` | |
| `dataAbertura` | `data_inicio` | Data que não faz parse é descartada (tela mostra `—`) |
| "Prazo limite" | `data_alvo_finalizacao` | |
| "Órgão" | `nome_unidade_organizacional` | |
| Timeline | `andamentos[]` (`tipo` → evento, `data`, `descricao`) | Titular: todos, em ordem crescente. Público: só o último |
| "Dados atualizados em" | `loaded_at` | A carga mais antiga entre os chamados do protocolo |
| Descrição e endereço (rua + bairro) | `descricao`, `logradouro`, `bairro` | Só titular. Público vê só o bairro |
| "Origem do chamado", Ouvidoria, Recurso LAI | — | Não existem no SGRC: os cards não aparecem |

### Status

`normalizeStatus` (`helpers.ts:44`) não diferencia maiúsculas nem acentos. Os grupos são
os mesmos da carteira (`src/lib/maintenance-requests-utils.ts`):

| Selo | Status de origem |
|---|---|
| Aberto | Aberto, Novo, qualquer status desconhecido |
| Em andamento | Em andamento, Em espera, Pendente, Em andamento privado, Encaminhado à Comlurb - Resíduo |
| Concluído | Concluído, Fechado, qualquer "Fechado com…" / "Fechado de ofício…" |
| Cancelado | Cancelado, Recusado, Não constatado, Sem possibilidade de atendimento, Fechado sem solução |

## Privacidade e segurança

- A lista nunca manda CPF, descrição nem endereço ao navegador, mesmo que o RMI os
  devolva.
- O CPF da lista vem do token da sessão. O RMI (gateway com `ext_authz`) valida o token.
- A consulta pública nunca mostra rua nem descrição, mesmo com o titular logado.
- A regex estrita barra path traversal: o client gerado interpola o protocolo na URL
  sem encode, junto com o Bearer do cidadão. Nada fora de `RIO-\d{8}-\d` chega ao RMI.
- Os logs de erro registram só a mensagem do erro, sem CPF nem protocolo.

## Comportamento de `/minhas-solicitacoes`

- **Sem `FEATURE_SGRC_HISTORICO`:** só a lista do Salesforce, sem seletor, com as
  abas; o `?filtro=` do menu abre direto na aba pedida. O resto desta seção vale com
  a flag ligada.
- O seletor **"Data de abertura"** fica sempre visível:
  - "abertas até 26/11/2026": histórico SGRC, **padrão**.
  - "abertas a partir de 27/11/2026": Salesforce.
- **SGRC:** carrega no navegador, página a página (10 por vez). Só tem a aba "Todos".
  - Primeira carga: o mesmo skeleton da rota (`RequestsListSkeleton`, também usado
    em `loading.tsx`), para a troca de um pelo outro não piscar.
  - Troca de página e volta do Salesforce: a última página carregada fica na tela
    (`aria-busy`) até a próxima chegar. Só esmaece se a resposta passar de 150 ms.
  - Erro: aviso com "Tentar novamente".
- **Salesforce:** vem pronto do servidor, sem paginação, com as abas Todos, Serviços,
  Ouvidoria e Acesso à informação.
- **Busca "Encontre sua solicitação":** desligada nas duas origens (prop `searchable`,
  padrão `false`, em `requests-list.tsx:86`).
- **Links do menu com `?filtro=`** (Ouvidoria, LAI): a página abre no SGRC, que ignora o
  filtro e mostra "Todos". A aba pedida fica ativa ao trocar para "abertas a partir de
  27/11/2026". Comportamento mantido de propósito.

## Testes

| Arquivo | Cobre |
|---|---|
| `src/lib/chamados/sgrc.test.ts` | Regex, mapeamento da lista e do detalhe, privacidade |
| `src/__tests__/chamados-sgrc-rmi.test.ts` | As três rotas com o RMI simulado (MSW): sessão, CPF do token, paginação, erros sanitizados, despacho por formato, path traversal; com `FEATURE_SGRC_HISTORICO` desligada, 404 sem RMI nem Mule |
| `minhas-solicitacoes/__tests__/helpers.test.ts` | `normalizeStatus`, `formatDate` |
| `src/__tests__/origem-chamados-sgrc.test.tsx` | Origem padrão, paginação, erro/tentar de novo, troca de origem, busca oculta |
| `minhas-solicitacoes/__tests__/page-filtro.integration.test.tsx` | `?filtro=` nas duas origens; sem a flag, sem seletor e sem buscar o SGRC |
| `src/lib/__tests__/feature-flags.test.ts` | `isSgrcHistoricoEnabled` (só `'true'` liga) |
| `src/lib/__tests__/maintenance-requests-utils.test.ts` e `src/app/components/__tests__/wallet-home-cards.test.tsx` | Card "Cuidados com a Cidade" nas combinações das duas flags |
| `src/__tests__/chamados-*-erro-sanitizado.test.ts` | Erros do Salesforce |
| `e2e/home.spec.ts` ("Minhas solicitações pela aba do menu global") | `?filtro=`; troca de origem só com `FEATURE_SGRC_HISTORICO=true` (exige `E2E_ACCESS_TOKEN`) |

```bash
npx vitest run src/lib/chamados src/__tests__/chamados-sgrc-rmi.test.ts \
  src/__tests__/origem-chamados-sgrc.test.tsx "src/app/(app)/(logged-in)/minhas-solicitacoes" \
  src/lib/__tests__/feature-flags.test.ts src/lib/__tests__/maintenance-requests-utils.test.ts \
  src/app/components/__tests__/wallet-home-cards.test.tsx
```

### Teste manual

Com `.env` apontando para staging (`FEATURE_SALESFORCE=true`,
`FEATURE_SGRC_HISTORICO=true`, `BASE_API_URL_RMI=…`):

```bash
curl -i localhost:3000/api/chamados-publico/RIO-00000000-0   # 404 "Chamado não encontrado", private, no-store
curl -i localhost:3000/api/chamados?origem=sgrc              # 401 sem sessão
```

Com `FEATURE_SGRC_HISTORICO` ausente (reinicie o `next dev`), as duas chamadas respondem
`404 {"error":"Not found"}`.

Logado, abra `/minhas-solicitacoes` com um CPF que tenha chamados no 1746 legado.

## Limitações e pendências

- **Validar com dados reais.** O mapeamento segue o swagger do RMI e só foi conferido em
  staging com protocolos que não existem. Falta conferir título, categoria e datas com um
  CPF que tenha chamados.
- **Token expirado na consulta pública.** O RMI trata token inválido como anônimo, mas
  não foi testado se o gateway recusa um Bearer expirado antes. O middleware não roda
  em `/api/*`.
- **Banner da home** conta só chamados do Salesforce (chama `/api/chamados` sem
  `origem`).
- **Cache da lista SGRC:** até 10 min de atraso no cache de dados do Next (DAL). O
  detalhe é sempre `no-store`.
- **Dica de formato** em `/consulta-protocolo` ("RIO-12345678-9") descreve só o SGRC.
  Com `FEATURE_SGRC_HISTORICO` desligada, esse formato não é consultável. Dá para
  condicionar a dica pela flag (já disponível no client via `useServerFeatureFlags`).
- **Skeleton** (`minhas-solicitacoes/loading.tsx`) mostra o pill do seletor mesmo com
  `FEATURE_SGRC_HISTORICO` desligada, por um instante. Só estético.
- **Infisical:** remover `USE_MOCK_CHAMADOS` de staging e criar
  `FEATURE_SGRC_HISTORICO=true` em staging antes do deploy (fora do repo).

### Para reativar a busca

1. O RMI precisa aceitar um parâmetro de busca em
   `GET /citizen/{cpf}/maintenance-request`. Regenerar o client:
   `npx orval --project rmi`.
2. SGRC: repassar o termo em `/api/chamados?origem=sgrc` e buscar no servidor. O filtro
   local de `RequestsList` só enxerga a página atual e não serve para lista paginada.
3. Salesforce: basta `searchable` em `<RequestsList>` (a lista vem inteira).
