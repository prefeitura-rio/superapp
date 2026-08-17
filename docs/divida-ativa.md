# Dívida Ativa Imobiliária

Módulo do portal do cidadão para os serviços de dívida ativa imobiliária que saem dos
portlets Liferay 6.2 da Prefeitura: cadastro de imóveis, parcelamento de débitos e
acompanhamento de requerimentos.

> **Estado atual: Fase 1 concluída, Fase 2 ("Meus Imóveis") entregue e integrada à API real.**
> Existem gating, contrato real, client gerado, camada de mapeamento, landing, DAL, Server
> Actions e o cadastro de imóveis (lista, inclusão, exclusão). As regras fiscais continuam nos
> sistemas corporativos (DAM/PGM); este módulo é camada de apresentação sobre a API de
> integração em Quarkus (`api-imoveis`), escrita fora deste repo.
>
> **O contrato provisório foi substituído pelo real em 17/08/2026**, colhido de
> `http://10.5.225.173:8080/swagger` e conferido por chamada ao vivo contra a instância de
> homologação. A [tabela de premissas](#tabela-de-premissas-do-contrato) traz o veredito de
> cada uma.
>
> ⚠️ **Duas coisas ficaram quebradas de propósito, esperando decisão de produto:**
>
> - **`/divida-ativa/imoveis/novo/confirmar` não funciona para imóvel novo.** A API não tem
>   consulta sem cadastro — ver [P20](#p20-em-detalhe--a-tela-de-confirmação-perdeu-a-fonte-de-dados).
> - **Nada da Fase 3 foi integrado.** A API não liga schema de resposta às operações de dívida
>   ativa, então os oito endpoints que a fase precisa chegam sem tipo.
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

## Contrato real (`api-imoveis`)

`divida-ativa-api.yaml` é uma **cópia fiel** do documento OpenAPI que a API do Vladimir serve
em `/swagger`. Não editamos o arquivo: a procedência fica no commit e aqui. Quando a API dele
virar repo no GitHub, migrar o `input` do Orval para a URL — um notebook alcançável só pela
rede interna não serve de fonte para o CI.

> O Quarkus dele **não** expõe `/q/openapi` (dá 404). O path é `/swagger`, e
> `/swagger?format=json` funciona.

Recursos, agrupados pelas tags que viram as pastas do client gerado. Note que **não há prefixo
`/v1`**:

| Tag → pasta | Operações que usamos | Situação |
|---|---|---|
| `Imoveis` → `imoveis/` | `GET/POST /imoveis`, `DELETE /imoveis/{id}`, `GET /imoveis/{inscricao}/consulta` | **integradas** |
| `Imoveis` → `imoveis/` | `GET /imoveis/{inscricao}/parcelamentos`, `.../segunda-via` | fora do escopo 2026 |
| `Divida Ativa` → `divida-ativa/` | consulta principal, `consultar`, `datas-vencimento`, `parcelamentos/simular`, `requerimentos` | Fase 3, **sem tipo** |
| `Divida Ativa` → `divida-ativa/` | `emitir/*`, `simular/*`, `guias/*`, `certidoes/*` | fora do escopo 2026 |
| `Divida Ativa - Requerimentos` → `divida-ativa-requerimentos/` | `GET /divida-ativa/requerimentos`, `.../cancelar`, `.../comprovante`, `validar-senha` | Fase 3, **sem tipo** |
| `Infra` → `infra/` | `heartbeat`, `versao` | não usadas |

O client é gerado inteiro, inclusive para os fluxos fora do escopo — o Orval não sabe recortar
e não vamos editar o spec de outra equipe. **Gerado não é implementado:** os endpoints fora do
escopo simplesmente não têm chamador.

### O que "sem tipo" significa

**25 das 31 operações não declaram schema de resposta** — só `"200": description: OK`. Os
schemas existem e são bons (`DividaAtivaConsultaResponse`, `CdaResponse`, `GuiaDamResponse`,
`OpcaoDividaAtivaResponse`), mas não estão referenciados por resposta nenhuma, então o Orval
gera `data: void`. Ligar os `@APIResponse` é o pedido de maior alavancagem que temos com o
Vladimir: é o que decide se a Fase 3 nasce tipada.

**Identidade:** o cidadão é derivado do Bearer token pela própria API, que extrai o CPF da
claim `preferred_username` do realm `idrio_cidadao`. Nenhum endpoint recebe CPF por path,
query ou body — nem deve passar a receber. A resposta de imóvel **devolve** o `cpf`, e o
mapper o descarta de propósito.

> **Risco latente de identidade.** O token do superapp não tem claim `cpf` (verificado em
> 17/08/2026), então `getUserInfoFromToken()` cai no `preferred_username` — o mesmo valor que a
> API usa. As duas pontas coincidem **por acidente**. Se alguém adicionar uma claim `cpf` ao
> realm, o nosso lado passa a usá-la e o dele não, e o vínculo imóvel↔cidadão sai errado sem
> nenhum sinal de erro.

## Tabela de premissas do contrato

Estas eram as decisões que tomamos no lugar da equipe da API enquanto o contrato era nosso.
**Reconciliadas em 17/08/2026** contra o contrato real e contra 13 chamadas à instância de
homologação.

Placar: **3 confirmadas, 6 resolvidas no mapper, 10 dependendo de decisão de produto, 2 sem
resposta possível** — o spec não diz e o dado de teste não permitiu inferir.

**Como ler a coluna "Veredito":**

| Veredito | Significa |
|---|---|
| ✅ confirmada | veio como assumimos; nada a fazer |
| 🔧 mapper | divergiu, e o ajuste morreu em `divida-ativa-mappers.ts` / DAL / actions. **Já feito** |
| 🎨 produto | o dado não existe ou tem outra semântica; precisa de decisão de produto ou design |
| ❓ sem resposta | o spec não declara e o dado de homologação não permitiu verificar |

### Formatos e tipos

| # | Campo / assunto | Assumido | Veredito | O que a API real faz |
|---|---|---|---|---|
| P1 | Valores monetários | `number` (double) | ❓ | **String** em todos os campos, mas qual convenção segue desconhecido: todos os valores voltaram `null` no imóvel de teste, que não tem CDA em aberto. `parseValorMonetario()` aceita as duas formas, então provavelmente não haverá trabalho — mas isso é aposta |
| P2 | Datas sem hora | ISO `YYYY-MM-DD` | 🔧 | `dd/MM/yyyy` (`"24/04/2026"`), não ISO. `parseDataApi()` já aceitava — a tolerância deliberada dos mappers pagou aqui. **Na saída** a API exige `dd/MM/yyyy` (`GuiaOperacaoRequest`), e não existe serializador nessa direção; será preciso na Fase 3 |
| P3 | Datas com hora | ISO 8601 com offset | 🔧 | `LocalDateTime` **sem fuso**, com centésimos: `2026-06-22T15:40:46.477`. `parseDataApi()` corta no `T` e resolve. Registre que não há fuso no dado |
| P4 | Inscrição imobiliária | string somente dígitos | ✅ | Confirmada: "a API considera apenas digitos e normaliza para 8 posicoes". Aceita máscara e aceita sem zeros à esquerda |
| P5 | `numeroCda` | campo `numeroCda`, `AAAA/NNNNNNN-D` | 🔧 | Chama-se `cdaId` na resposta e `numCda` nos filtros. Formato não documentado — confirmar antes da Fase 3 |
| P6 | `percentualDesconto` | percentual e não fração | 🎨 | **Não existe percentual em lugar nenhum do spec.** Só valores absolutos em string (`descontoPrincipal`, `valorTotalDesconto`). O risco de erro de 100× evaporou; em troca, o "%" do Figma não tem fonte |

### Enums

| # | Campo | Valores assumidos | Veredito | O que a API real faz |
|---|---|---|---|---|
| P7 | `SituacaoCda` | 6 valores em SCREAMING_CASE | 🎨 | **Não há enum, e não há um eixo só.** `situacaoPrincipal` (texto livre do DAM, ex.: `"Concedido"`) + `codSituacaoCda` (int), mais um par paralelo `situacaoHonorarios`/`codSituacaoHonorarios`, mais um terceiro eixo `faseCobranca`/`faseCobrancaId`. Nosso tipo de visão tem **uma** `situacao` |
| P8 | `SituacaoRequerimento` | 5 valores | ❓ | `GET /divida-ativa/requerimentos` não declara schema e devolveu `[]` (array cru) para o CPF de teste. Não há como confirmar nem refutar |
| P9 | `TipoDocumento` | 6 valores | 🎨 | Não existe tipo **por documento**: `documentos: [{ nomeArquivo, conteudoBase64 }]`. Existe um `tipoDoc` solto no requerimento, aparentemente do correspondente |

Nenhum dos três está em uso hoje: os mappers de Fase 3 foram removidos na integração, porque
traduziam de valores que a API não emite. Os **tipos de visão** (`'em_aberto'`, `'em_analise'`)
ficaram em `src/types/divida-ativa.ts` como vocabulário de produto para a Fase 3.

Quando voltarem, mantenha a regra: valor desconhecido **não quebra a tela**, cai em
`'desconhecida'`. Uma situação nova no sistema fiscal não pode derrubar a página do cidadão —
mas `'desconhecida'` precisa de tratamento visual definido no design. E prefira mapear pelo
**código numérico** a mapear pela string de exibição do DAM, que é rótulo, não contrato.

### Decisões de modelagem

| # | Assunto | Decisão assumida | Veredito | O que a API real faz |
|---|---|---|---|---|
| P10 | Envelope de erro | `{ errors: [{ code, message }] }`, `message` exibível | 🔧🎨 | `{ error: string }` singular, **sem `code`**. A exibibilidade depende do status: 400 traz mensagem de negócio em português; 401 traz `"HTTP 401 Unauthorized"`; 404 vem **sem corpo**; 502 vaza `"WS Fazenda IPTU"`. Sem `code`, o status é o único discriminador — `mapApiToMensagemErro(data, status)` só exibe 400. Duas mensagens vêm **sem acento** |
| P11 | Listagens | Envelope `{ data: [...] }`, sem paginação | 🔧 | Sem paginação ✅, mas **sem envelope**: array cru. O spec tipava objeto singular (anotação errada), e o DAL fazia `result.data?.data` — devolveria lista vazia **em silêncio**. Absorvido por `normalizarListaImoveis()`, que aceita as três formas |
| P12 | `possuiDebitos` no imóvel | A API devolve o booleano junto da lista | 🎨 | Ausente, e por decisão de arquitetura: `GET /imoveis` "consulta somente o banco local. Nao chama WS Fazenda nem ePortal". Mapeado para `null` = "não sabemos". A alternativa N+1 é inviável: as chamadas ao ePortal levam 15 s cada |
| P13 | `valorTotalAtualizado` | Calculado pela API | 🎨 | `totalDebitos` é **contagem** (`int32`), não soma. Não há total monetário agregado. Com principal e honorários separados e valores em string, somar no front é pior do que era quando escrevemos isto |
| P14 | `parcelavel` por CDA | Elegibilidade decidida pela API, por CDA | ✅ | Confirmada e mais rica: `selecionavelParcelamento` por CDA, mais `habilitadaAvistaPrincipal`, `habilitadaLiquidacaoHonorarios` e pares equivalentes por fluxo. Cuidado com `emissaoGuiaHabilitada`, cuja polaridade é ambígua |
| P15 | Upload em duas etapas | `POST .../documentos` devolve `documentoId` | 🎨 | Não são duas etapas: `conteudoBase64` **inline** no mesmo POST do requerimento. Sem `documentoId`, sem multipart. Caiu justamente a solução que existia para o limite de 1 MB de Server Action (`experimental.serverActions.bodySizeLimit`), e base64 infla ~33% |
| P16 | Comprovante em PDF | `application/pdf` como blob | 🔧 | **URL**, o ramo alternativo que a premissa previu. Também `urlPdf` nas guias. Atenção: `/guias/{n}/pdf` é descrito como "URL **publica** de PDF" — guia de dívida acessível por quem tiver o link |
| P17 | Validade da simulação | `validaAte` é instante | ❓🎨 | Campo não existe. **E o fluxo é outro:** `GET /datas-vencimento?tipo=PARCELAMENTO` devolveu dez datas permitidas, não consecutivas, e `simular` recebe a escolhida. O cidadão **escolhe a data** antes de simular — passo de tela que o Figma não tem |
| P19 | `proprietario` no imóvel | A API devolve o nome do proprietário | 🎨 | Ausente de `ImovelResponse`, que traz só `id`, `cpf`, `dataInclusao`, `endereco`, `numInscricao`. O nome existe como `nomeContribuinte`, mas na CDA, só após a consulta de dívida ativa. Mapeado para `null`: a linha desaparece da lista e da confirmação |
| P20 | Consulta × cadastro | Dois endpoints, um que só consulta | 🎨 | **A premissa caiu.** Ver [detalhamento](#p20-em-detalhe--a-tela-de-confirmação-perdeu-a-fonte-de-dados) |
| P21 | Tamanho da inscrição | 7 **ou** 8 dígitos | ✅ | Confirmada no transporte. Duas ressalvas: a API aceita **menos** de 7 dígitos e a nossa validação não, o que impede testar manualmente com o dado `18` da instância dele; e a resposta vem sempre com 8, então a máscara ganha um `0.` à esquerda que o carnê não tem |
| P22 | `bairro` como campo próprio | *(premissa nova, descoberta na integração)* | 🎨 | Não existe: vem embutido na string de endereço (`"RUA SANTO AFONSO, 216 / LOJA A - TIJUCA"`). Fatiar pelo último `" - "` é frágil (endereço com hífen no nome quebra). Mapeado para `null` |
| P18 | Identificador da consulta | Só inscrição imobiliária | 🎨 | **Meia vitória.** `POST /imoveis/{inscricao}/divida-ativa/consultar` aceita quatro critérios — `numInscricao`, `numCda`, `numExecucaoFiscal` e um que não esperávamos, `numGuiaPagamento` (RN-001/RN-002, critério único). Mas a inscrição continua **no path**, e a tag diz "autorizacao por imovel cadastrado": quem só tem a carta de cobrança ainda não entra. Ver detalhamento abaixo |

### Achados novos, fora da tabela

A reconciliação levantou coisas que nenhuma premissa previa:

- **As chamadas ao ePortal levam 10 a 16 segundos.** Medido: `/consulta` 16,0 s,
  `/parcelamentos` 15,4 s, a consulta principal 10,7 s na primeira chamada. Os endpoints que só
  leem o banco local respondem em menos de 100 ms. Um Server Component que aguarda 16 s
  renderiza página em branco por 16 s — a tela de consulta da Fase 3 precisa de `Suspense` com
  streaming e um estado de carregamento que o Figma não tem.
- **`emissaoGuiaHabilitada` tem polaridade ambígua.** O nome diz "habilitada"; a descrição diz
  "Flag bruta do DAM `isCdaBlqueadaEmissaoGuia==1` (legado habilita)". Erro silencioso da mesma
  classe que o P6 original: ofereceria ou esconderia emissão de guia para a CDA errada.
- **O spec declara `scheme: basic`** em `securitySchemes`, enquanto todas as descrições falam de
  JWT no Keycloak e o teste ao vivo confirma comportamento de Bearer. Bug de documentação.
- **Nenhuma operação tem `operationId`**, e as tags têm espaço e hífen — é isso que define os
  nomes de pasta e de função do client gerado (`getImoveisInscricaoDividaAtivaDatasVencimento`).
- **502 não está documentado.** `POST /imoveis` com inscrição inexistente devolve 502; o spec
  prevê 400/401/503. Ganho: a falha **não deixa registro gravado** — verificado.
- **A API cobre todo o escopo que a diretoria retirou** (guia à vista, liquidação,
  regularização, 2ª via, certidões), além de dois serviços que a nossa landing não tem
  (`ADIANTAMENTO` e `FAQ`, com `urlExterna` para o DAM Internet).
- **A consulta principal devolve o menu pronto.** `opcoes` traz sete serviços com `disponivel`,
  `mensagem` e `urlExterna`, em português correto e acentuado. Na Fase 3 isso substitui lógica
  que íamos escrever à mão. Não serve para a landing, que é por cidadão e não por inscrição.
- **`protocoloRequerimentoAberto` por CDA** permite a tela dizer "já existe requerimento aberto
  para esta dívida" em vez de deixar o cidadão abrir um segundo e ser indeferido.

### As duas premissas mais perigosas hoje

- **P1** (formato dos valores monetários) — não foi possível verificar: todos os campos de valor
  voltaram `null`, porque o imóvel de teste não tem CDA em aberto. É a única premissa de formato
  que segue sendo aposta, e ela chega à tela como dinheiro.
- **P15** (upload) — o mecanismo mudou para base64 inline e o limite de 1 MB de Server Action
  volta a ser problema, sem a solução em duas etapas que existia no papel.

### O passo de senha — decisão que muda o desenho da Fase 3

Não estava em premissa nenhuma porque o contrato provisório não imaginava reautenticação.

A senha aparece em **dois** lugares: existe `POST /divida-ativa/validar-senha` (INT-24 /
RN-036) e um campo `senha` dentro de `RequerimentoParcelamentoRequest`, ao lado de
`tipoAutenticacao` e `declaracaoAceita`. O resumo do endpoint de requerimento diz "docs base64 +
**reauth senha** + declaracao".

Se `senha` for obrigatória no corpo, o requerimento **não pode ser enviado** sem um passo que o
Figma não tem — e `tipoAutenticacao` sugere que existe mais de um caminho aceito.

O agravante é de segurança, não de escopo: o cidadão já está autenticado por Keycloak. Pedir a
senha do id.rio num formulário nosso reintroduz credencial fora do IdP, e passaria a trafegar
senha em texto claro pelo nosso servidor. Se a regra exigir reauth, o caminho aceitável é o
Keycloak (step-up via `acr_values`; o token atual vem com `acr: 0`), não um campo nosso.

> **Não testamos `validar-senha` de propósito.** Chamar com senha errada arriscaria acionar a
> detecção de força bruta do Keycloak e bloquear uma conta real.

### P20 em detalhe — a tela de confirmação perdeu a fonte de dados

A premissa dizia que havia dois endpoints. Não há.

- `GET /imoveis/{inscricao}/consulta` exige o imóvel **já cadastrado** (404 se não estiver) e a
  própria descrição avisa: "Nao chama o WSFazenda_Iptu neste endpoint".
- `POST /imoveis` é quem consulta a Fazenda — e **grava no mesmo passo**, como o legado.

Não existe como mostrar o endereço antes de cadastrar. `/divida-ativa/imoveis/novo/confirmar`
está no repositório, compila e é coberto por testes, mas **cai sempre no estado "não
encontrado"** para um imóvel novo. Fica assim, atrás da feature flag, até a decisão. Três
saídas:

| | Saída | Custo |
|---|---|---|
| **A** | Pedir ao Vladimir um modo consulta (`?persistir=false` ou endpoint de preview) | Preserva o Figma inteiro. Do lado dele é pular o insert — provavelmente a mudança mais barata da lista. **É o que pedir primeiro** |
| **B** | Inverter: gravar no "Adicionar" e a tela passa a confirmar o que já foi salvo, com `DELETE` como desfazer | Mantém as três telas, muda a semântica e exige copy nova. Um imóvel rejeitado esteve cadastrado por alguns segundos — mas verificamos que falha não deixa lixo gravado |
| **C** | Assumir o legado: campo → sucesso, com o endereço na tela de sucesso | Mais barato de implementar, some uma tela do Figma |

### P18 em detalhe — os três modos de busca

Os três identificadores do design **não são sinônimos**: são níveis diferentes.

| Identificador | Identifica | Onde o cidadão vê | Cardinalidade |
|---|---|---|---|
| Inscrição imobiliária | o **imóvel** | carnê de IPTU | 1 imóvel → N CDAs |
| Número da CDA | uma **dívida** inscrita | carta de cobrança da PGM | 1 CDA → 1 imóvel |
| Nº da execução fiscal | um **processo judicial** | citação da Justiça | 1 execução → N CDAs |

A capacidade **existe** no contrato real: `POST /imoveis/{inscricao}/divida-ativa/consultar`
recebe `ConsultaFiltroRequest` com `numInscricao`, `numCda`, `numExecucaoFiscal` e
`numGuiaPagamento`, em critério único (RN-001/RN-002). A resposta é a mesma
`DividaAtivaConsultaResponse` da consulta principal, então quem entra por CDA **cai no fluxo
normal** — responde a pergunta 2.

O problema é que **a inscrição continua no path**. Para buscar pela CDA é preciso já saber a
inscrição, e a tag reforça: "autorizacao por imovel cadastrado". Quem chega só com a carta de
cobrança na mão continua sem caminho — a capacidade está lá, o ponto de entrada não.

**Já decidido:** "Meus Imóveis" alimenta **apenas** o modo inscrição imobiliária (seleção em
vez de digitação). Os modos CDA e execução fiscal não passam por ele.

**Estado das quatro perguntas, depois da reconciliação:**

1. ~~A API ganha busca por CDA e por execução fiscal?~~ **Sim**, já tem — inclusive por número
   de guia de pagamento, que não esperávamos.
2. ~~Devolvem o imóvel ou a lista de dívidas?~~ **O imóvel**, junto das CDAs e do menu: é a
   mesma resposta da consulta principal.
3. **Em aberto:** uma execução fiscal pode abranger mais de um imóvel? Se puder, a tela precisa
   de um passo de desambiguação — e a resposta atual, indexada por uma inscrição só, não o
   suporta.
4. **Respondida na prática — e é o problema:** sim, o imóvel precisa estar cadastrado. Isso
   torna "Meus Imóveis" pré-requisito dos três modos, não conveniência de um, e contradiz a
   decisão de produto acima. **Precisa de conversa com o Vladimir e com produto.**

## Camada de mapeamento

`src/lib/divida-ativa-mappers.ts` converte o tipo gerado no tipo de visão. Os mappers são
deliberadamente **tolerantes**: aceitam a forma que a API devolve hoje e também as formas que
ela pode passar a devolver.

**A tolerância se pagou na integração.** `parseDataApi()` já aceitava `dd/MM/yyyy` "porque o
legado costuma devolver assim" — e é exatamente o que a API real devolve. Custo da troca de
contrato nas datas: zero.

**`normalizarListaImoveis()` é o mapper mais importante do arquivo.** Ele existe porque o tipo
gerado *mente*: o spec tipa `GET /imoveis` como objeto singular e a API devolve array cru. Sem
ele o DAL fazia `result.data?.data`, que num array resolve para `undefined` e cai no `[]` — o
cidadão com imóvel veria "nenhum imóvel cadastrado", **sem erro e sem log**. Foi o bug mais
concreto que a reconciliação encontrou, e há teste travando os dois lados.

`mapApiToMensagemErro(data, status)` recebe o status de propósito: sem campo `code` no envelope
de erro, o status é o único jeito de separar a mensagem que serve ao cidadão (400) da que vaza
nome de sistema interno (5xx). Ver P10.

Duas garantias que os testes travam (`src/lib/__tests__/divida-ativa-mappers.test.ts`):

- **Nunca `NaN` na tela.** `parseValorMonetario()` devolve `null` para ausente ou não
  numérico. Um `NaN` atravessaria a formatação e chegaria ao cidadão como `"NaN"`.
- **Nunca data inválida.** `parseDataApi()` rejeita datas que o `Date` "corrige" sozinho
  (`2023-02-31` viraria 03/03).

Booleanos de consequência fiscal usam comparação estrita (`=== true`): na dúvida é `false`.
**Nunca oferecer parcelamento por conta própria.** Cuidado especial com
`emissaoGuiaHabilitada`, cuja polaridade o próprio spec deixa ambígua.

**Ausência de dado é `null`, não `false`.** `possuiDebitos` é `boolean | null` justamente por
isso: a API não sabe dizer se há débito na listagem, e `false` ali seria uma afirmação que
ninguém fez. Não troque por `false` para simplificar um `if`.

O mapper **descarta** o `cpf` que a resposta traz. Identidade vem do token; CPF não atravessa a
fronteira para o tipo de visão (LGPD). Há teste travando isso.

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

> O Prism continua útil depois da integração: ele monta o mock a partir do spec **real**, então
> serve para desenvolver quando a máquina do Vladimir está desligada. O que ele não reproduz é o
> que só o dado real mostrou — os 15 s das chamadas ao ePortal e os valores em `null`.

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

## A integração — o que foi feito e o que ficou

A troca do contrato aconteceu em 17/08/2026. O que está pronto:

- Spec real commitado como `divida-ativa-api.yaml`, client regenerado, `orval.config.ts`
  revertido.
- Mappers, DAL e Server Actions adaptados: array cru, envelope de erro `{ error }` exibível só
  em 400, exclusão pelo id local, `cpf` descartado.
- Handlers MSW nos paths reais (sem `/v1`) e com payloads da forma real. Os antigos apontavam
  para endpoints que não existem — a suíte validava ficção.
- Mappers de Fase 3 **removidos** (`mapApiToDebito`, `mapApiToListaDebitos`, `mapApiToSimulacao`,
  `mapApiToRequerimento`, `mapSituacao*`) junto dos testes deles. Traduziam de valores que a API
  não emite; manter era manter teste verde sobre contrato refutado.
- Tabela de premissas reconciliada acima.

### O que ficou pendente, e de quem depende

| Pendência | Depende de |
|---|---|
| Tela `confirmar` funcional (P20) | decisão de produto entre A, B e C |
| Passo de senha na Fase 3 | Vladimir (é obrigatório?) + produto |
| Toda a integração de Fase 3 | Vladimir ligar os `@APIResponse` |
| Formato dos valores monetários (P1) | Vladimir dar uma inscrição de teste com CDA em aberto |
| Linha de proprietário na lista (P19) | Vladimir incluir, ou produto tirar do Figma |
| Indicador de débito na lista (P12) | produto confirmar que a tela fica de pé sem ele |
| Estado de carregamento para as chamadas de 15 s | design |
| Serializador `dd/MM/yyyy` na saída | nada — é só escrever, mas só a Fase 3 usa (YAGNI) |

### Dois cuidados que continuam valendo

- **A máquina dele não pode virar dependência de teste.** O MSW continua sendo o limite de rede
  da suíte; a API real serve para verificação manual. Teste amarrado ao IP dele quebra toda vez
  que ele fechar o notebook.
- **Auth está confirmada.** As chamadas saem do servidor Next, e o mutator manda
  `Authorization: Bearer` com o `access_token` do cookie. A instância valida contra o realm
  `idrio_cidadao` de homologação — o mesmo do `.env` do superapp. Ver a ressalva sobre a claim
  `cpf` na seção do contrato.

Para desenvolver sem depender dele, o mock por Prism descrito em
[Desenvolvendo sem a API](#desenvolvendo-sem-a-api) continua valendo.
