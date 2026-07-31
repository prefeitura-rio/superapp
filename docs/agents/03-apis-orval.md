# 03 — APIs e Orval

## Clientes gerados

| Pasta | Backend (GitHub) | Mutator (raiz do repo) | Base URL (env) |
|-------|------------------|------------------------|----------------|
| `src/http/` | [app-rmi](https://github.com/prefeitura-rio/app-rmi) | `custom-fetch.ts` | `BASE_API_URL_RMI` / variantes `NEXT_PUBLIC_*` |
| `src/http-courses/` | [app-go-api](https://github.com/prefeitura-rio/app-go-api) | `custom-fetch-course.ts` | `COURSES_BASE_API_URL` |
| `src/http-busca-search/` | [app-busca-search](https://github.com/prefeitura-rio/app-busca-search) | `custom-fetch-busca-search.ts` | `BASE_API_URL_APP_BUSCA_SEARCH` |
| `src/http-app-catalogo/` | [app-catalogo](https://github.com/prefeitura-rio/app-catalogo) | `custom-fetch-app-catalogo.ts` | `BASE_API_URL_APP_CATALOGO` |
| `src/http-agent-api/` | [superapp-agent-api](https://github.com/prefeitura-rio/superapp-agent-api) | `custom-fetch-agent-api.ts` | `AGENT_API_BASE_URL` |
| `src/http-pref-rio-carta-servicos/` | Spec local `pref-rio-carta-servicos-api.yaml` (MuleSoft) | `custom-fetch-pref-rio-carta-servicos.ts` | `BASE_API_URL_PREF_RIO_CARTA_SERVICOS` |
| `src/http-pref-rio-cidadao/` | Spec local `pref-rio-cidadao-api.yaml` (MuleSoft) | `custom-fetch-pref-rio-cidadao.ts` | `BASE_API_URL_PREF_RIO_CIDADAO` |
| `src/http-pref-rio-chamados-publico/` | Spec local `pref-rio-chamados-publico-api.yaml` (MuleSoft) | `custom-fetch-pref-rio-chamados-publico.ts` | `BASE_API_URL_PREF_RIO_CHAMADOS_PUBLICO` |

A maioria dos mutators injeta `Authorization: Bearer` a partir dos cookies de sessão. As exceções são **Carta de Serviços** e **Chamados Público** — APIs públicas sem Bearer do cidadão (auth M2M na camada Mule).

## Orval — config ativa única

[`orval.config.ts`](../../orval.config.ts) aponta para **um** target por vez (hoje: app-go-api → `src/http-courses/`).

Para regenerar outro client: copiar o bloco da API desejada de [`../orval-apis.md`](../orval-apis.md) para o `api:` em `orval.config.ts`, rodar `npx orval`, e **não** commititar mudanças de config “trocada” sem combinar com o time.

Specs Pref.Rio (`pref-rio-carta-servicos-api.yaml`, `pref-rio-cidadao-api.yaml`, `pref-rio-chamados-publico-api.yaml`) ficam na raiz do repo — não há URL GitHub externa.

## Regras

- Preferir funções geradas em `src/http*` em vez de `fetch` manual.
- Não editar arquivos gerados à mão; regenere a partir da OpenAPI.
- Spec OpenAPI do `app-go-api` vive no repo Go (`docs/swagger.yaml`); mudanças de contrato = PR em [app-go-api](https://github.com/prefeitura-rio/app-go-api), depois regenerar o client aqui.
- Specs Pref.Rio: editar o YAML correspondente na raiz (`pref-rio-carta-servicos-api.yaml`, `pref-rio-cidadao-api.yaml` ou `pref-rio-chamados-publico-api.yaml`), copiar o bloco em `orval-apis.md` para `orval.config.ts` e rodar `npx orval`.
- Caching server-side: ver `src/lib/dal.ts`.
- Proxies browser-facing: `src/app/api/`.

## Quando o código da API não está no checkout

No Jira / Claude Code no GitHub, só o `superapp` está clonado. Nesse caso:

1. Use o client Orval e tipos já gerados em `src/http*`.
2. Se precisar inspecionar a API, abra o repo GitHub correspondente (tabela acima), a OpenAPI raw, ou os YAML locais `pref-rio-*.yaml` — não invente shape de response.
3. Se faltar endpoint, documente a dependência no PR com link para o outro repo — não invente backend neste repositório.

## Docs relacionadas

- [`../orval-apis.md`](../orval-apis.md) — receitas por API
- [`../integracao-busca-api.md`](../integracao-busca-api.md)
- Overview: [00-overview.md](00-overview.md)
