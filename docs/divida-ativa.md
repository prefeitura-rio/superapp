# Dívida Ativa Imobiliária

Módulo do portal do cidadão para os serviços de dívida ativa imobiliária que saem dos
portlets Liferay 6.2 da Prefeitura: cadastro de imóveis, parcelamento de débitos e
acompanhamento de requerimentos.

> **Estado atual: Marco 1 (fundação).** O módulo existe no superapp atrás de
> `NEXT_PUBLIC_FEATURE_DIVIDA_ATIVA`, com contrato OpenAPI real (`api-imoveis`), client
> Orval, mutator, mappers e uma landing. Parcelamento e acompanhamento têm rota com estado
> "em construção". Cadastro de Imóveis ("Meus Imóveis") é o Marco 2 e **não** entra neste
> PR.
>
> As regras fiscais continuam nos sistemas corporativos (DAM/PGM). Este módulo é camada de
> apresentação sobre a API de integração em Quarkus (`api-imoveis`), escrita fora deste repo.

## Sumário

- [Visão geral](#visão-geral)
- [Login obrigatório](#login-obrigatório)
- [A landing e a fronteira do escopo](#a-landing-e-a-fronteira-do-escopo)
- [Feature flag](#feature-flag)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Estrutura de arquivos](#estrutura-de-arquivos)
- [Contrato real (`api-imoveis`)](#contrato-real-api-imoveis)
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

**Fase 1 é a fundação** (gating, contrato, client, mappers, landing). Nenhum dos três
serviços aparece nela como fluxo completo.

## Login obrigatório

O módulo inteiro exige sessão id.rio. A proteção **não vem do nome do grupo de rotas**
`(logged-in)` — nome de pasta não tem efeito nenhum no middleware. Ela vem de `/divida-ativa`
estar **fora** da allowlist `publicRoutes` de `src/middleware.ts`: rota que não casa com a
allowlist e não tem `access_token` é redirecionada para o login, com a URL de origem
preservada para o retorno.

Consequência prática: **o módulo não pode morar sob `/servicos/*`**. Aquele prefixo está na
allowlist com curinga, então qualquer rota abaixo dele é pública. `src/__tests__/middleware.test.ts`
trava esse comportamento.

CPF sempre de `getUserInfoFromToken()`, nunca de parâmetro de rota ou query.

## A landing e a fronteira do escopo

`/divida-ativa` é só a porta de entrada. Lista **cinco** serviços; a diferença entre cinco e
três é deliberada.

| Serviço na landing | Destino |
|---|---|
| Emitir guia à vista ou liquidar débitos | **externo** — portal legado |
| Emitir guia – parcela em atraso (regularização) | **externo** — portal legado |
| Emitir segunda via de guia de pagamento | **externo** — portal legado |
| Parcelar débitos | interno, Fase 3 (Marco 3) — hoje "em construção" |
| Acompanhar requerimento de parcelamento | interno, Fase 3 (Marco 3) — hoje "em construção" |

Os três primeiros foram **retirados do escopo de modernização pela diretoria**: continuam
existindo no portal legado e não são reconstruídos aqui. A landing os oferece como link
externo para não deixar um buraco na jornada do cidadão.

Todo link externo passa por um bottom sheet de confirmação (`ExternalLinkDrawer`). As URLs
ficam em `src/constants/divida-ativa-links.ts`.

> Nenhuma página deste repo é prerenderizada: o root layout lê `headers()` para o nonce da
> CSP, então tudo é renderizado sob demanda.

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
allowlist é invertida — o valor `'false'`, usado em dev e em staging, significa *tudo
visível*. Ela não esconderia o módulo no ambiente onde ele precisa ficar escondido. O
padrão booleano segue o precedente de `NEXT_PUBLIC_FEATURE_CHAMADOS`.

Valores por ambiente:

| Ambiente | Valor | Onde |
|---|---|---|
| Local | `true` | `.env.example` / `.env` |
| CI (quality gate) | `true` | `pr-quality-gate.yaml` |
| Staging | `false` | `deploy-staging.yaml` |
| Produção | `false` | `release-production.yaml` |

Ligar em produção é decisão de release do time Pref.Rio. Como `NEXT_PUBLIC_*` é congelada
no build, mudar o valor exige rebuild.

### A flag também controla o ponto de entrada

O card "Dívida Ativa" da home (`src/constants/most-accessed-services.ts`) troca de destino
junto com a flag: ligada, leva ao módulo; desligada, segue apontando para a página do
catálogo.

O card não aparece em `/servicos`: aquela página renderiza `<MostAccessedServiceCards
limit={4} />` e Dívida Ativa é o sexto item. A entrada é pela home.

## Variáveis de ambiente

| Variável | Tipo | Resolvida | Observação |
|---|---|---|---|
| `BASE_API_URL_DIVIDA_ATIVA` | server-only | runtime | URL da API de integração. **Nunca** `NEXT_PUBLIC_`, nunca no Dockerfile nem nos workflows. `custom-fetch-divida-ativa.ts` lança erro explícito se estiver ausente |
| `NEXT_PUBLIC_FEATURE_DIVIDA_ATIVA` | pública | build time | Gating. Está em `.env.example`, `Dockerfile` (ARG + ENV), `pr-quality-gate.yaml`, `deploy-staging.yaml`, `release-production.yaml` |

Ambas estão em `TEST_ENV` / `setupTestEnv()` de `src/test/mocks/env.ts`.

> ⚠️ **Provisionamento pendente:** `BASE_API_URL_DIVIDA_ATIVA` precisa ser criada no segredo
> gerenciado pelo Infisical (`app-secrets`) para staging e produção. Isso vive fora deste
> repositório e **não sai de um PR daqui**.

## Estrutura de arquivos

```
divida-ativa-api.yaml                 # contrato real (raiz)
custom-fetch-divida-ativa.ts          # mutator do Orval (raiz)
src/app/(app)/(logged-in)/divida-ativa/   # rotas — fora de /servicos/*, exigem login
src/app/components/divida-ativa/      # componentes do módulo
src/http-divida-ativa/                # GERADO pelo Orval — não editar à mão
src/types/divida-ativa.ts             # tipos de visão (linguagem do produto)
src/lib/divida-ativa-mappers.ts       # camada anti-corrupção
src/lib/divida-ativa-utils.ts         # máscara e normalização da inscrição (client-safe)
src/middleware.ts                     # bloco de gating
```

### Rotas neste PR

| Rota | O que faz |
|---|---|
| `/divida-ativa` | Landing: cinco serviços |
| `/divida-ativa/parcelamento` · `/acompanhamento` | Estado "em construção" até a Fase 3 |

**Nenhum componente, página ou teste de UI importa de `src/http-divida-ativa/`.** O tipo
gerado é consumido pelos mappers e pelos testes de fiação do contrato. Componentes falam
só a linguagem de `src/types/divida-ativa.ts`.

## Contrato real (`api-imoveis`)

`divida-ativa-api.yaml` é uma **cópia fiel** do documento OpenAPI que a API serve em
`/swagger` (`http://10.5.225.173:8080/swagger` na instância de desenvolvimento). Não
editamos o arquivo: a procedência fica no commit. Quando a API virar repo no GitHub,
migrar o `input` do Orval para a URL.

O Quarkus **não** expõe `/q/openapi` (dá 404). O path é `/swagger`, e `/swagger?format=json`
funciona. **Não há prefixo `/v1`.**

O client é gerado inteiro, inclusive para fluxos fora do escopo 2026 (guia à vista,
certidões, 2ª via). **Gerado não é implementado:** esses endpoints não têm chamador neste PR.

**Identidade:** o cidadão é derivado do Bearer token pela própria API (claim
`preferred_username` do realm `idrio_cidadao`). Nenhum endpoint recebe CPF por path, query
ou body.

O teste `src/__tests__/divida-ativa-contrato.test.ts` trava a fiação: client Orval →
mutator → MSW → mappers → tipos de visão, hoje sobre os endpoints de imóveis que o spec
já declara.

## Camada de mapeamento

`src/lib/divida-ativa-mappers.ts` converte o tipo gerado no tipo de visão. Os mappers são
deliberadamente **tolerantes**: aceitam a forma que a API devolve hoje e também formas
que ela pode passar a devolver.

Duas garantias travadas em `src/lib/__tests__/divida-ativa-mappers.test.ts`:

- **Nunca `NaN` na tela.** `parseValorMonetario()` devolve `null` para ausente ou não numérico.
- **Nunca data inválida.** `parseDataApi()` rejeita datas que o `Date` "corrige" sozinho.

O mapper **descarta** o `cpf` que a resposta traz. Identidade vem do token (LGPD).

## Desenvolvendo sem a API

O MSW deste repo é test-only. Para rodar `npm run dev` contra o contrato:

```bash
npx @stoplight/prism-cli mock divida-ativa-api.yaml -p 3009
```

Com `BASE_API_URL_DIVIDA_ATIVA=http://localhost:3009` no `.env`.

## Regenerar o client

`orval.config.ts` aceita **uma API por vez**. O fluxo é: colar o bloco abaixo no campo
`api:`, rodar `npx orval`, commitar `src/http-divida-ativa/` e **reverter o
`orval.config.ts`**. O bloco está em [`orval-apis.md`](./orval-apis.md).

**Nunca editar `src/http-divida-ativa/` à mão.** `src/http-divida-ativa/**` está no
override de lint do `biome.json`.
