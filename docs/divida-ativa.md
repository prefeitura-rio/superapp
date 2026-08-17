# Dívida Ativa Imobiliária

Módulo do portal do cidadão para os serviços de dívida ativa imobiliária que saem dos
portlets Liferay 6.2 da Prefeitura: cadastro de imóveis, parcelamento de débitos e
acompanhamento de requerimentos.

> **Estado atual: Fase 1 concluída e Fase 2 ("Meus Imóveis") entregue.** Existem gating,
> contrato provisório, client gerado, camada de mapeamento, landing, DAL, Server Actions e o
> cadastro de imóveis completo (lista, inclusão em três telas e exclusão). As regras fiscais
> continuam nos sistemas corporativos (DAM/PGM); este módulo é camada de apresentação sobre
> uma API de integração em Quarkus que está sendo escrita fora deste repo.
>
> Parcelamento e acompanhamento (Fase 3) já têm rota, com um estado provisório explicando que
> o serviço está sendo construído — a landing linka para eles desde o primeiro PR e um 404
> seria pior do que uma explicação.

## Sumário

- [Visão geral](#visão-geral)
- [A landing e a fronteira do escopo](#a-landing-e-a-fronteira-do-escopo)
- [Feature flag](#feature-flag)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Estrutura de arquivos](#estrutura-de-arquivos)
- [Contrato provisório](#contrato-provisório)
- [Tabela de premissas do contrato](#tabela-de-premissas-do-contrato)
- [Camada de mapeamento](#camada-de-mapeamento)
- [Desenvolvendo sem a API](#desenvolvendo-sem-a-api)
- [Regenerar o client](#regenerar-o-client)

## Visão geral

Três serviços reconstruídos aqui, entregues em fases:

| Serviço | Rota | Fase | Marco |
|---|---|---|---|
| Cadastro de Imóveis ("Meus Imóveis") | `/divida-ativa/imoveis` | 2 | Marco 2 — 18/09/2026 |
| Parcelamento de débitos | `/divida-ativa/parcelamento` | 3 | Marco 3 — 23/10/2026 |
| Acompanhamento de requerimento | `/divida-ativa/acompanhamento` | 3 | Marco 3 — 23/10/2026 |

A numeração acompanha o plano de implementação: **Fase 1 é a fundação** (o que já existe —
gating, contrato, client, mappers, landing), e por isso nenhum serviço aparece nela. Cite
sempre o marco junto da fase — parcelamento e acompanhamento dividem a mesma fase.

Front-end e back-end foram desenvolvidos em paralelo e independentes: as telas são
construídas contra um **contrato OpenAPI provisório escrito por nós**, e a integração com a
API real é uma fase dedicada no fim. É isso que a [camada de mapeamento](#camada-de-mapeamento)
protege.

## Login obrigatório

O módulo inteiro exige sessão id.rio. A proteção **não vem do nome do grupo de rotas**
`(logged-in)` — nome de pasta não tem efeito nenhum no middleware. Ela vem de `/divida-ativa`
estar **fora** da allowlist `publicRoutes` de `src/middleware.ts`: rota que não casa com a
allowlist e não tem `access_token` é redirecionada para o login, com a URL de origem
preservada para o retorno.

Consequência prática: **o módulo não pode morar sob `/servicos/*`**. Aquele prefixo está na
allowlist com curinga, então qualquer rota abaixo dele é pública, independente da pasta em que
o arquivo esteja. Foi por isso que a landing saiu de `/servicos/divida-ativa` para
`/divida-ativa`. `src/__tests__/middleware.test.ts` trava esse comportamento.

CPF sempre de `getUserInfoFromToken()`, nunca de parâmetro de rota ou query.

## A landing e a fronteira do escopo

`/divida-ativa` lê **uma** informação do cidadão: quantos imóveis ele cadastrou, para o
contador do card "Meus imóveis". A leitura é feita pelo DAL com `no-store` e, se falhar, o
card fica sem o número em vez de derrubar a página — a lista de serviços não pode cair por
causa de um contador. Fora isso, a landing continua sendo só a porta de entrada.

Ela lista **cinco** serviços, e essa diferença entre cinco e três é deliberada.

> Nenhuma página deste repo é prerenderizada: o root layout lê `headers()` para o nonce da
> CSP, então tudo é renderizado sob demanda. `export const dynamic = 'force-static'` seria
> inerte aqui — não use.

| Serviço na landing | Destino |
|---|---|
| Emitir guia à vista ou liquidar débitos | **externo** — portal legado |
| Emitir guia – parcela em atraso (regularização) | **externo** — portal legado |
| Emitir segunda via de guia de pagamento | **externo** — portal legado |
| Parcelar débitos | interno, Fase 3 (Marco 3) |
| Acompanhar requerimento de parcelamento | interno, Fase 3 (Marco 3) |

Os três primeiros foram **retirados do escopo de modernização pela diretoria**: continuam
existindo no portal legado e não são reconstruídos aqui. A landing os oferece como link
externo para não deixar um buraco na jornada do cidadão.

Todo link externo passa por um bottom sheet de confirmação (`ExternalLinkDrawer`), porque o
design exige aviso explícito sempre que o cidadão sai do ambiente nativo do app — **mesmo
para um portal oficial da Prefeitura**. As URLs ficam em `src/constants/divida-ativa-links.ts`.

### Divergências entre o design e o escopo

O Figma é a especificação (copy inclusive), mas ele foi desenhado a partir do portal legado e
não conhece todas as regras de negócio. Duas divergências conhecidas:

- **"Meus Imóveis" não existe no Figma, mas é requisito de projeto.** O desenho vai direto da
  landing para uma tela de consulta com três campos livres (nº da inscrição imobiliária, nº da
  CDA, nº da execução fiscal). O cadastro de imóveis é **requisito de produto confirmado** e
  entra na Fase 2 (Marco 2 — 18/09).

  O papel dele é preciso: **no modo de busca por inscrição imobiliária**, o cidadão escolhe um
  imóvel já salvo em vez de digitar o número. Não é um fluxo paralelo à consulta nem uma porta
  de entrada concorrente — é conveniência **dentro de um dos três modos**. Os outros dois
  modos (CDA e execução fiscal) não passam por "Meus Imóveis".

  **Resolvido em 17/08/2026:** o Figma novo cobre a lista, a inclusão em três telas e o aviso
  de exclusão, e a landing ganhou o card "Meus imóveis" com contador. Continua **em aberto** o
  seletor de imóvel salvo dentro do campo de inscrição imobiliária da tela de consulta — ele
  pertence à Fase 3, junto com a própria tela de consulta.

  Duas decisões do time sobre esse Figma, tomadas em 17/08/2026:

  - O protótipo novo desenhou os itens de serviço **sem** o chevron que o desenho anterior
    tinha. Tratado como esquecimento: o chevron foi mantido.
  - O campo da inscrição aparece no Figma em duas variantes (campo aberto e dígitos separados
    estilo OTP). Como a inscrição pode ter **7 ou 8** dígitos, o formato de posições fixas foi
    descartado: é campo aberto com máscara aplicada a cada tecla.
- **A consulta aceita três identificadores**, mas o contrato provisório só modela a inscrição
  imobiliária. Consulta por nº de CDA e por nº de execução fiscal precisam entrar no contrato
  antes da Fase 3 (Marco 3 — 23/10) — está registrado como premissa P18.

## Feature flag

O módulo inteiro está atrás de `NEXT_PUBLIC_FEATURE_DIVIDA_ATIVA`. **Ausente ou diferente de
`'true'` esconde tudo**: o bloco em `src/middleware.ts` reescreve para `/not-found` tanto a
raiz quanto qualquer rota filha.

```ts
const isDividaAtivaEnabled = process.env.NEXT_PUBLIC_FEATURE_DIVIDA_ATIVA === 'true'
const isDividaAtivaRoute =
  path === '/divida-ativa' || path.startsWith('/divida-ativa/')
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

### A flag também controla o ponto de entrada

O card "Dívida Ativa" da home (`src/constants/most-accessed-services.ts`) troca de destino
junto com a flag: ligada, leva ao módulo; desligada, segue apontando para a página do
catálogo, exatamente como antes.

Sem isso o módulo fica **inalcançável pela navegação** quando a flag é ligada para
homologação — o middleware libera a rota, mas nada no app leva até ela e o testador precisa
digitar a URL. Apontar o card em definitivo, removendo o condicional, é decisão de release do
time Pref.Rio.

> O card não aparece em `/servicos`: aquela página renderiza `<MostAccessedServiceCards
> limit={4} />` e Dívida Ativa é o sexto item da lista. É comportamento anterior a este
> módulo, independente da flag. A entrada é pela home.

> **Nota:** o time Pref.Rio pretende evoluir o middleware para um mecanismo de allowlist com
> curinga de path (`/divida-ativa/*`). Quando isso acontecer, este bloco booleano
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
src/app/(app)/(logged-in)/divida-ativa/   # rotas — fora de /servicos/*, exigem login
src/app/components/divida-ativa/      # componentes do módulo
src/actions/divida-ativa/             # Server Actions (mutações)
src/http-divida-ativa/                # GERADO pelo Orval — não editar à mão
src/types/divida-ativa.ts             # tipos de visão (linguagem do produto)
src/lib/divida-ativa-mappers.ts       # camada anti-corrupção
src/lib/divida-ativa-utils.ts         # máscara e normalização da inscrição (client-safe)
src/lib/dal.ts                        # leituras do módulo (no-store)
src/middleware.ts                     # bloco de gating
```

### Rotas

| Rota | O que faz |
|---|---|
| `/divida-ativa` | Landing: card "Meus imóveis" com contador + cinco serviços |
| `/divida-ativa/imoveis` | Lista dos imóveis do cidadão, com exclusão por imóvel |
| `/divida-ativa/imoveis/novo` | Campo da inscrição imobiliária, com máscara |
| `/divida-ativa/imoveis/novo/confirmar?inscricao=` | Consulta ao sistema fiscal e confirmação |
| `/divida-ativa/imoveis/novo/sucesso` | "Imóvel adicionado!" |
| `/divida-ativa/parcelamento` · `/acompanhamento` | Estado provisório até a Fase 3 |

### O cadastro de um imóvel são três telas e duas chamadas

A tela do campo **não** chama a API: ela valida o formato e leva os dígitos para a URL da
confirmação. Quem consulta é o Server Component de `confirmar`, e quem grava é a Server Action
disparada pelo botão "Confirmar". Essa separação é a premissa P20 — no legado, consultar já
cadastrava.

A inscrição trafega **somente com dígitos** em toda a pilha (URL, action e API). A máscara
(`0.521.766-3`) é aplicada só na exibição, por `formatarInscricaoImobiliaria`. Abaixo de sete
dígitos a função não mascara: como a inscrição pode ter 7 ou 8, não há como saber onde cai o
verificador antes disso.

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
| `imoveis` | `GET/POST /v1/imoveis`, `GET /v1/imoveis/consulta/{inscricaoImobiliaria}`, `GET/DELETE /v1/imoveis/{inscricaoImobiliaria}` |
| `debitos` | `GET /v1/imoveis/{inscricaoImobiliaria}/debitos` |
| `simulacao` | `POST /v1/parcelamentos/simulacoes` |
| `requerimentos` | **abertura:** `POST /v1/requerimentos`, `POST /v1/requerimentos/documentos` |
| `acompanhamento` | **pós-abertura:** `GET /v1/requerimentos`, `GET /v1/requerimentos/{protocolo}`, `GET .../comprovante`, `POST .../cancelamento` |

O corte entre `requerimentos` e `acompanhamento` é **abrir** × **acompanhar depois de aberto**,
não leitura × escrita — o cancelamento é `POST` e está em `acompanhamento`. A tag decide a pasta
gerada, então é ela que diz de onde importar.

**Identidade:** o cidadão é derivado do Bearer token (Keycloak) pela própria API. Nenhum
endpoint recebe CPF por path, query ou body — nem deve passar a receber.

## Tabela de premissas do contrato

Esta é a dívida técnica declarada da Fase 1. Cada linha é uma decisão que tomamos no lugar da
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
| P9 | `TipoDocumento` | `DOCUMENTO_IDENTIDADE`, `CPF`, `COMPROVANTE_RESIDENCIA`, `PROCURACAO`, `CONTRATO_SOCIAL`, `OUTRO` | `mapper + tela` — a lista vira opções do formulário de requerimento (Fase 3) |

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
| P15 | Upload de documentos | `POST /v1/requerimentos/documentos` devolve um `documentoId`, citado depois na criação do requerimento (upload em duas etapas) | Desacopla o envio do arquivo do envio do formulário e contorna o limite de 1 MB de Server Action | `fluxo` — **é a premissa mais frágil da tabela.** Não há precedente de upload neste repo e o mecanismo (limite de Server Action × route handler multipart × upload direto) ainda não foi decidido com Vladimir/Lucas |
| P16 | Comprovante em PDF | `GET /v1/requerimentos/{protocolo}/comprovante` devolve `application/pdf` como blob | O mutator já trata `application/pdf` | `mapper` se vier como URL assinada em JSON |
| P17 | Validade da simulação | `validaAte` é instante; passado ele, é preciso simular de novo | Valor fiscal muda com encargos diários | `mapper + tela` — a tela precisa de um estado "simulação expirada" |
| P19 | `proprietario` no `Imovel` | A API devolve o nome do proprietário como consta no sistema fiscal | O design exibe o campo na lista de imóveis e na tela de confirmação do cadastro; o contrato original não tinha o campo | `mapper + tela` — sem ele, os dois cards perdem uma linha |
| P20 | Consulta × cadastro | São **dois** endpoints: `GET /v1/imoveis/consulta/{inscricao}` só consulta o sistema fiscal e `POST /v1/imoveis` grava | No portal legado a consulta já gravava o imóvel automaticamente. A separação foi acordada com o Vladimir em 17/08/2026: a consulta responde à tela "Confirme sua inscrição" e o cadastro só acontece no "Confirmar" do cidadão | `fluxo` — se a API mantiver o comportamento do legado, o imóvel entra na lista antes de o cidadão confirmar, e a tela de confirmação perde o sentido |
| P21 | Tamanho da inscrição imobiliária | 7 **ou** 8 dígitos, incluindo o verificador | Levantado pelo time em 17/08/2026 contra o legado; o contrato antes exemplificava 11 dígitos | `mapper` para o transporte; `mapper + tela` se o intervalo mudar, porque a máscara e a validação de formato do front assumem esse intervalo |
| P18 | Identificador da consulta | O contrato só modela busca por **inscrição imobiliária** | O contrato foi escrito a partir do plano, antes de o design ser lido | `fluxo` — **lacuna conhecida, não é aposta.** O design pede também nº da CDA e nº da execução fiscal, e não existe endpoint que aceite nenhum dos dois. Precisa entrar no contrato antes da Fase 3 (Marco 3 — 23/10). Ver detalhamento abaixo |

### Premissas que exigem confirmação explícita

Estas não quebram nada visivelmente, e por isso são as mais perigosas:

- **P6** (`percentualDesconto` percentual vs. fração) — erro silencioso de 100×.
- **P10** (`message` de erro é exibível ao cidadão) — se não for, estaríamos mostrando texto
  técnico interno para o cidadão.
- **P15** (upload em duas etapas) — depende de decisão de arquitetura que ainda não existe.

### P18 em detalhe — os três modos de busca

Os três identificadores do design **não são sinônimos**: são níveis diferentes.

| Identificador | Identifica | Onde o cidadão vê | Cardinalidade |
|---|---|---|---|
| Inscrição imobiliária | o **imóvel** | carnê de IPTU | 1 imóvel → N CDAs |
| Número da CDA | uma **dívida** inscrita | carta de cobrança da PGM | 1 CDA → 1 imóvel |
| Nº da execução fiscal | um **processo judicial** | citação da Justiça | 1 execução → N CDAs |

Hoje **todo** o contrato é indexado por inscrição imobiliária — inclusive o cadastro de imóvel,
cujo único campo obrigatório é ela. Não existe caminho para quem só tem a carta de cobrança ou
a citação na mão.

Por que isso é `fluxo` e não `mapper`: não é divergência de formato, é **capacidade
inexistente**. Nenhum mapper responde "de qual imóvel é a CDA 2023/0012345-6?" se a API não
sabe responder. E a navegação que o módulo assume é `imóvel → débitos → simulação →
requerimento`; entrar por CDA é entrar no meio dela, e entrar por execução fiscal pode trazer
várias CDAs de uma vez.

**Já decidido:** "Meus Imóveis" alimenta **apenas** o modo inscrição imobiliária (seleção em
vez de digitação). Os modos CDA e execução fiscal não passam por ele.

**Em aberto com Vladimir + produto, antes da Fase 3:**

1. A API ganha busca por CDA e por execução fiscal?
2. Elas devolvem o **imóvel** (e o cidadão cai no fluxo normal) ou a **lista de dívidas** direto?
3. Uma execução fiscal pode abranger mais de um imóvel? Se puder, a tela precisa de um passo de
   desambiguação.
4. Entrando por CDA ou execução, o imóvel precisa estar cadastrado em "Meus Imóveis" para
   seguir com o parcelamento?

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

## Próximo passo — trocar o contrato provisório pelo real

A API em Quarkus do Vladimir já roda na máquina dele, alcançável pela rede interna. A troca do
contrato é o começo da fase de integração. O roteiro, na ordem:

1. **Obter o documento OpenAPI.** Quarkus expõe em `/q/openapi` (YAML), `/q/openapi?format=json`
   e o Swagger UI em `/q/swagger-ui`. Precisa do `http://<ip>:<porta>` da máquina dele.
2. **Commitar como `divida-ativa-api.yaml`**, substituindo o provisório, e anotar no commit de
   onde e quando veio. **Não** apontar o `input` do Orval direto para a máquina dele: o
   precedente de URL neste repo (app-go-api, app-busca-search) são specs hospedadas no GitHub,
   alcançáveis pelo CI e por qualquer dev. Um notebook não é isso. Quando a API dele virar repo
   no GitHub, aí sim migrar para a URL.
3. **Regenerar o client** pelo fluxo da seção anterior e deixar o `npm run typecheck` apontar as
   divergências. A fronteira anti-corrupção faz a quebra se concentrar em
   `divida-ativa-mappers.ts`, no DAL e nas Server Actions — os componentes só conhecem
   `src/types/divida-ativa.ts` e não devem precisar mudar. Se um componente quebrar, a fronteira
   vazou: conserte a fronteira.
4. **Atualizar os handlers MSW** para as formas reais. Sem isso a suíte continua validando o
   contrato que nós inventamos.
5. **Reconciliar a tabela de premissas** acima, marcando cada uma como confirmada ou divergente.
   Três não se resolvem no mapper e precisam de decisão de produto: **P20** (se a API consultar e
   já cadastrar num passo só, como o legado, a tela "Confirme sua inscrição" perde o sentido),
   **P19** (sem `proprietario`, a lista e a confirmação perdem uma linha cada) e **P21** (se a
   inscrição não for de 7–8 dígitos, mudam a máscara e a validação de formato do formulário).

Dois cuidados:

- **A máquina dele não pode virar dependência de teste.** O MSW continua sendo o limite de rede
  da suíte; a API real serve para verificação manual e para reconciliar o contrato. Teste
  amarrado ao IP dele quebra toda vez que ele fechar o notebook.
- **CORS não é problema**, mas **auth pode ser**: as chamadas saem do servidor Next para a
  máquina dele, não do browser. O mutator sempre manda `Authorization: Bearer` com o
  `access_token` do cookie — vale confirmar antes contra qual realm Keycloak a instância local
  valida, ou se valida.

Para desenvolver sem depender dele, o mock por Prism descrito em
[Desenvolvendo sem a API](#desenvolvendo-sem-a-api) continua valendo.
