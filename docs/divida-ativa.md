# Dívida Ativa Imobiliária

Módulo do portal do cidadão para os serviços de dívida ativa imobiliária que saem dos
portlets Liferay 6.2 da Prefeitura: cadastro de imóveis, parcelamento de débitos e
acompanhamento de requerimentos.

> **Estado atual: Fase 0 (fundação).** Existe a fundação — gating, contrato provisório,
> client gerado e camada de mapeamento. **Não existe UI de produto ainda.** As regras
> fiscais continuam nos sistemas corporativos (DAM/PGM); este módulo é camada de
> apresentação sobre uma API de integração em Quarkus que está sendo escrita fora deste repo.

## Sumário

- [Visão geral](#visão-geral)
- [Feature flag](#feature-flag)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Estrutura de arquivos](#estrutura-de-arquivos)
- [Contrato provisório](#contrato-provisório)
- [Tabela de premissas do contrato](#tabela-de-premissas-do-contrato)
- [Camada de mapeamento](#camada-de-mapeamento)
- [Desenvolvendo sem a API](#desenvolvendo-sem-a-api)
- [Regenerar o client](#regenerar-o-client)

## Visão geral

Três serviços, entregues em fases:

| Serviço | Rota | Fase |
|---|---|---|
| Cadastro de Imóveis ("Meus Imóveis") | `/servicos/divida-ativa/imoveis` | 1 |
| Parcelamento de débitos | `/servicos/divida-ativa/parcelamento` | 2 |
| Acompanhamento de requerimento | `/servicos/divida-ativa/acompanhamento` | 3 |

Front-end e back-end foram desenvolvidos em paralelo e independentes: as telas são
construídas contra um **contrato OpenAPI provisório escrito por nós**, e a integração com a
API real é uma fase dedicada no fim. É isso que a [camada de mapeamento](#camada-de-mapeamento)
protege.

## Feature flag

O módulo inteiro está atrás de `NEXT_PUBLIC_FEATURE_DIVIDA_ATIVA`. **Ausente ou diferente de
`'true'` esconde tudo**: o bloco em `src/middleware.ts` reescreve para `/not-found` tanto a
raiz quanto qualquer rota filha.

```ts
const isDividaAtivaEnabled = process.env.NEXT_PUBLIC_FEATURE_DIVIDA_ATIVA === 'true'
const isDividaAtivaRoute =
  path === '/servicos/divida-ativa' || path.startsWith('/servicos/divida-ativa/')
```

**Por que um booleano e não a allowlist `NEXT_PUBLIC_FEATURE_FLAG`:** a semântica da
allowlist é invertida — o valor `'false'`, que é o usado em dev e em staging, significa
*tudo visível*. Ela não esconderia o módulo justamente no ambiente onde ele precisa ficar
escondido durante a homologação. O padrão booleano segue o precedente de
`NEXT_PUBLIC_FEATURE_CHAMADOS`.

Valores por ambiente:

| Ambiente | Valor | Onde |
|---|---|---|
| Local | `true` | `.env.example` / `.env` |
| CI (quality gate) | `true` | `pr-quality-gate.yaml` |
| Staging | `false` | `deploy-staging.yaml` |
| Produção | `false` | `release-production.yaml` |

Ligar em produção é decisão de release do time Pref.Rio, não de um PR de feature. Como
`NEXT_PUBLIC_*` é congelada no build, mudar o valor exige rebuild.

> **Nota:** o time Pref.Rio pretende evoluir o middleware para um mecanismo de allowlist com
> curinga de path (`/servicos/divida-ativa/*`). Quando isso acontecer, este bloco booleano
> pode ser substituído — o comportamento esperado (raiz e filhas ocultas por padrão) é o
> mesmo, e `src/__tests__/middleware.test.ts` cobre esse contrato.

## Variáveis de ambiente

| Variável | Tipo | Resolvida | Observação |
|---|---|---|---|
| `BASE_API_URL_DIVIDA_ATIVA` | server-only | runtime | URL da API de integração. **Nunca** `NEXT_PUBLIC_`, nunca no Dockerfile nem nos workflows. `custom-fetch-divida-ativa.ts` lança erro explícito se estiver ausente |
| `NEXT_PUBLIC_FEATURE_DIVIDA_ATIVA` | pública | build time | Gating. Está nos seis lugares exigidos: `.env.example`, `Dockerfile` (ARG + ENV), `pr-quality-gate.yaml` (build do Playwright e dry-run do Docker), `deploy-staging.yaml`, `release-production.yaml` |

Ambas estão em `TEST_ENV` / `setupTestEnv()` de `src/test/mocks/env.ts` para os testes que
exercitam o mutator.

> ⚠️ **Provisionamento pendente:** `BASE_API_URL_DIVIDA_ATIVA` precisa ser criada no segredo
> gerenciado pelo Infisical (`app-secrets`) para staging e produção. Isso vive fora deste
> repositório e **não sai de um PR daqui** — alguém precisa provisionar.

## Estrutura de arquivos

```
divida-ativa-api.yaml                 # contrato provisório (raiz)
custom-fetch-divida-ativa.ts          # mutator do Orval (raiz)
src/http-divida-ativa/                # GERADO pelo Orval — não editar à mão
src/types/divida-ativa.ts             # tipos de visão (linguagem do produto)
src/lib/divida-ativa-mappers.ts       # camada anti-corrupção
src/middleware.ts                     # bloco de gating
```

### A fronteira que precisa ser respeitada

**Nenhum componente, página ou teste de UI importa de `src/http-divida-ativa/`.** O tipo
gerado é consumido apenas pelo DAL, pelas Server Actions e pelos mappers. Componentes falam
só a linguagem de `src/types/divida-ativa.ts` (`imovel.inscricao`, `debito.situacao`).

É essa fronteira que faz a troca do contrato ser um ajuste de mapper em vez de uma varredura
de telas. Se um dia o typecheck acusar erro de contrato dentro de um componente, a fronteira
vazou: conserte a fronteira, não só o erro.

## Contrato provisório

`divida-ativa-api.yaml` é uma **proposta escrita unilateralmente pelo time de front**, não
ratificada pela equipe da API. Ele existe para destravar o desenvolvimento das telas em
paralelo ao back-end.

Recursos, agrupados pelas tags que viram as pastas do client gerado:

| Tag | Operações |
|---|---|
| `imoveis` | `GET/POST /v1/imoveis`, `GET/DELETE /v1/imoveis/{inscricaoImobiliaria}` |
| `debitos` | `GET /v1/imoveis/{inscricaoImobiliaria}/debitos` |
| `simulacao` | `POST /v1/parcelamentos/simulacoes` |
| `requerimentos` | `POST/GET /v1/requerimentos`, `POST /v1/requerimentos/documentos`, `GET /v1/requerimentos/{protocolo}`, `GET .../comprovante`, `POST .../cancelamento` |
| `acompanhamento` | consulta de requerimentos por protocolo |

**Identidade:** o cidadão é derivado do Bearer token (Keycloak) pela própria API. Nenhum
endpoint recebe CPF por path, query ou body — nem deve passar a receber.

## Tabela de premissas do contrato

Esta é a dívida técnica declarada da Fase 0. Cada linha é uma decisão que tomamos no lugar da
equipe da API, para que a revisão dela seja uma sentada de conferência em vez de arqueologia.

**Como ler a coluna "Impacto se vier diferente":** `mapper` significa que a divergência se
resolve em `src/lib/divida-ativa-mappers.ts` sozinho; `mapper + tela` significa que a tela
ganha ou perde um estado (precisa de design); `fluxo` significa mudança de navegação, que é
impacto de cronograma e precisa ser escalado antes de implementar.

### Formatos e tipos

| # | Campo / assunto | Formato assumido | Por quê | Impacto se vier diferente |
|---|---|---|---|---|
| P1 | Valores monetários (`valorPrincipal`, `valorAtualizado`, `valorTotal`, `valorParcela`, `valorEntrada`) | `number` (double), reais com centavos | É o que o OpenAPI expressa naturalmente e evita erro de arredondamento na exibição | `mapper` — `parseValorMonetario()` já aceita string decimal e string pt-BR (`"1.234,56"`, com ou sem `R$`) |
| P2 | Datas sem hora (`dataVencimento`, `dataReferenciaValor`, `vencimentoPrimeiraParcela`) | ISO `YYYY-MM-DD` | Padrão OpenAPI `format: date` | `mapper` — `parseDataApi()` já aceita também `DD/MM/YYYY`, formato comum no legado |
| P3 | Datas com hora (`cadastradoEm`, `abertoEm`, `atualizadoEm`, `validaAte`) | ISO 8601 com offset (`2026-08-04T13:45:00-03:00`) | Preserva o fuso do Rio sem depender do servidor | `mapper` — a parte de data é extraída antes do `T` |
| P4 | `inscricaoImobiliaria` | string **somente dígitos** | A máscara de exibição é decisão de design, não de transporte | `mapper` — `apenasDigitos()` normaliza na entrada. Se a API passar a exigir máscara no *envio*, muda também a Server Action |
| P5 | `numeroCda` | string livre, formato `AAAA/NNNNNNN-D` | É como o portlet legado exibe | `mapper` |
| P6 | `percentualDesconto` | `number`, percentual (`10` = 10%) e não fração (`0.1`) | Ambiguidade real; assumimos o que o legado exibe | `mapper + tela` — se vier fração, o número na tela fica 100× errado **sem quebrar nada**. Confirmar explicitamente |

### Enums

| # | Campo | Valores assumidos | Impacto se vier diferente |
|---|---|---|---|
| P7 | `SituacaoCda` | `EM_ABERTO`, `AJUIZADA`, `PARCELADA`, `QUITADA`, `SUSPENSA`, `CANCELADA` | `mapper` para renomear; **`mapper + tela`** para um valor novo, que precisa de rótulo e cor no design |
| P8 | `SituacaoRequerimento` | `EM_ANALISE`, `AGUARDANDO_DOCUMENTACAO`, `DEFERIDO`, `INDEFERIDO`, `CANCELADO` | idem P7 |
| P9 | `TipoDocumento` | `DOCUMENTO_IDENTIDADE`, `CPF`, `COMPROVANTE_RESIDENCIA`, `PROCURACAO`, `CONTRATO_SOCIAL`, `OUTRO` | `mapper + tela` — a lista vira opções do formulário da Fase 2 |

Valor de enum desconhecido **não quebra a tela**: os mappers devolvem `'desconhecida'`. Isso é
proposital — uma situação nova no sistema fiscal não pode derrubar a página do cidadão. Mas
`'desconhecida'` precisa ter um tratamento visual definido no design.

### Decisões de modelagem

| # | Assunto | Decisão assumida | Por quê | Impacto se vier diferente |
|---|---|---|---|---|
| P10 | Envelope de erro | `{ errors: [{ code, message }] }`, com `message` institucional em pt-BR exibível ao cidadão | Espelha o formato das outras APIs Pref.Rio, para o front ter um tratamento de erro só | `mapper` — mas se `message` **não** for exibível ao cidadão, cada estado de erro precisa de copy do design (`mapper + tela`) |
| P11 | Listagens | Envelope `{ data: [...] }`, **sem paginação** | O cidadão tem poucos imóveis e poucas CDAs por imóvel | `fluxo` se vier paginado — a lista ganha paginação, que é tela nova |
| P12 | `possuiDebitos` no `Imovel` | A API devolve o booleano junto da lista | Evita N+1 chamadas para montar a lista de imóveis | `mapper + tela` — sem ele, ou a lista perde o indicador, ou vira uma chamada por imóvel |
| P13 | `valorTotalAtualizado` | Calculado **pela API**, não somado no front | Soma de valor fiscal é regra de negócio; o front nunca recalcula | `mapper + tela` — se a API não devolver, é preciso decidir com a diretoria se o front pode somar |
| P14 | `parcelavel` por CDA | Elegibilidade decidida pela API, por CDA | O front nunca infere elegibilidade de parcelamento | `fluxo` se a elegibilidade for do conjunto e não da CDA — muda a seleção na tela de débitos |
| P15 | Upload de documentos | `POST /v1/requerimentos/documentos` devolve um `documentoId`, citado depois na criação do requerimento (upload em duas etapas) | Desacopla o envio do arquivo do envio do formulário e contorna o limite de 1 MB de Server Action | `fluxo` — **é a premissa mais frágil da tabela.** Ver DEP-3: não há precedente de upload neste repo e o mecanismo ainda não foi decidido |
| P16 | Comprovante em PDF | `GET /v1/requerimentos/{protocolo}/comprovante` devolve `application/pdf` como blob | O mutator já trata `application/pdf` | `mapper` se vier como URL assinada em JSON |
| P17 | Validade da simulação | `validaAte` é instante; passado ele, é preciso simular de novo | Valor fiscal muda com encargos diários | `mapper + tela` — a tela precisa de um estado "simulação expirada" |

### Premissas que exigem confirmação explícita

Estas não quebram nada visivelmente, e por isso são as mais perigosas:

- **P6** (`percentualDesconto` percentual vs. fração) — erro silencioso de 100×.
- **P10** (`message` de erro é exibível ao cidadão) — se não for, estaríamos mostrando texto
  técnico interno para o cidadão.
- **P15** (upload em duas etapas) — depende de decisão de arquitetura que ainda não existe.

## Camada de mapeamento

`src/lib/divida-ativa-mappers.ts` converte o tipo gerado no tipo de visão. Os mappers são
deliberadamente **tolerantes**: aceitam o formato que assumimos e também os formatos que o
legado costuma devolver.

Duas garantias que os testes travam (`src/lib/__tests__/divida-ativa-mappers.test.ts`):

- **Nunca `NaN` na tela.** `parseValorMonetario()` devolve `null` para ausente ou não
  numérico. Um `NaN` atravessaria a formatação e chegaria ao cidadão como `"NaN"`.
- **Nunca data inválida.** `parseDataApi()` rejeita datas que o `Date` "corrige" sozinho
  (`2023-02-31` viraria 03/03).

Booleanos de consequência fiscal usam comparação estrita (`api.parcelavel === true`): na
dúvida é `false`. **Nunca oferecer parcelamento por conta própria.**

## Desenvolvendo sem a API

O MSW deste repo é test-only (não existe `public/mockServiceWorker.js`; ele só é montado por
`src/test/setup.ts`). Para rodar `npm run dev` contra o contrato, suba um mock a partir do
próprio spec:

```bash
npx @stoplight/prism-cli mock divida-ativa-api.yaml -p 3009
```

Com `BASE_API_URL_DIVIDA_ATIVA=http://localhost:3009` no `.env`. Não exige mudança no repo
nem dependência nova.

Nos **testes**, o caminho é MSW no limite de rede — handlers default em
`src/test/mocks/handlers.ts`, sobrescritos por teste com `server.use()`. Nunca stub de `fetch`.

> Este mock de dev some na fase de integração, junto com o contrato provisório.

## Regenerar o client

`orval.config.ts` aceita **uma API por vez** e `docs/orval-apis.md` pede para não commitar a
config trocada sem combinar com o time. O fluxo é: colar o bloco abaixo no campo `api:`,
rodar `npx orval`, commitar `src/http-divida-ativa/` e **reverter o `orval.config.ts`**.

O bloco está registrado em [`orval-apis.md`](./orval-apis.md) junto com os das outras APIs.

```ts
api: {
  input: './divida-ativa-api.yaml',
  output: {
    target: './src/http-divida-ativa/api.ts',
    schemas: './src/http-divida-ativa/models',
    mode: 'tags-split',
    client: 'fetch',
    formatter: 'biome',
    httpClient: 'fetch',
    clean: true,
    baseUrl: process.env.BASE_API_URL_DIVIDA_ATIVA,
    override: {
      mutator: {
        path: './custom-fetch-divida-ativa.ts',
        name: 'customFetchDividaAtiva',
      },
    },
  },
},
```

`src/http-divida-ativa/**` está no override de lint do `biome.json`, junto com
`http-agent-api` — código gerado não segue as mesmas regras.

**Nunca editar `src/http-divida-ativa/` à mão.**
