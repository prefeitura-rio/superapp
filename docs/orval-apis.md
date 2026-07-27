### Metodologia para gerar novos http clients com orval:

- No arquivo **orval.config.ts, trocar esses campos de acordo com a api:**
- **input**
- **target**
- **schema**
- **path**
- **baseUrl**
- **name**
- Copiar o bloco da API desejada abaixo para o `api:` em `orval.config.ts`, rodar `npx orval`, e **não** commitar a config trocada sem combinar com o time.

> ### app-busca-search

> ### https://services.staging.app.dados.rio/app-busca-search/swagger/index.html#/

* https://raw.githubusercontent.com/prefeitura-rio/app-busca-search/refs/heads/staging/docs/openapi-v3.json

```
 api: {
    input:
      'https://raw.githubusercontent.com/prefeitura-rio/app-busca-search/refs/heads/staging/docs/openapi-v3.json',
    output: {
      target: './src/http-busca-search/api.ts',
      schemas: './src/http-busca-search/models',
      mode: 'tags-split',
      client: 'fetch',
      formatter: 'biome',
      httpClient: 'fetch',
      clean: true,
      baseUrl: process.env.BASE_API_URL_APP_BUSCA_SEARCH,
      override: {
        mutator: {
          path: './custom-fetch-busca-search.ts',
          name: 'customFetchBuscaSearch',
        },
      },
    },
  },
```

> ### app-go-api

* https://raw.githubusercontent.com/prefeitura-rio/app-go-api/refs/heads/staging/docs/openapi-v3.json

```
  api: {
    input:
      'https://raw.githubusercontent.com/prefeitura-rio/app-go-api/refs/heads/main/docs/swagger.yaml',
    output: {
      target: './src/http-courses/api.ts',
      schemas: './src/http-courses/models',
      mode: 'tags-split',
      client: 'fetch',
      formatter: 'biome',
      httpClient: 'fetch',
      clean: true,
      baseUrl: process.env.COURSES_BASE_API_URL,
      override: {
        mutator: {
          path: './custom-fetch-course.ts',
          name: 'customFetch',
        },
      },
    },
  },

```

> ## API HEIMDALL

- https://raw.githubusercontent.com/prefeitura-rio/heimdall/refs/heads/main/docs/api/openapi.json

```
  api: {
    input:
      'https://raw.githubusercontent.com/prefeitura-rio/heimdall/refs/heads/main/docs/api/openapi.json',
    output: {
      target: './src/http-heimdall/api.ts',
      schemas: './src/http-heimdall/models',
      mode: 'tags-split',
      client: 'fetch',
      formatter: 'biome',
      httpClient: 'fetch',
      clean: true,
      baseUrl: process.env.NEXT_PUBLIC_HEIMDALL_BASE_API_URL,
      override: {
        mutator: {
          path: './custom-fetch-heimdall.ts',
          name: 'customFetchHeimdall',
        },
      },
    },
  },
```

> ## API RMI

- https://raw.githubusercontent.com/prefeitura-rio/app-rmi/refs/heads/main/docs/swagger.json

```
 api: {
    input:
      'https://raw.githubusercontent.com/prefeitura-rio/app-rmi/refs/heads/main/docs/swagger.json',
    output: {
      target: './src/http/api.ts',
      schemas: './src/http/models',
      mode: 'tags-split',
      client: 'fetch',
      formatter: 'biome',
      httpClient: 'fetch',
      clean: true,
      baseUrl: process.env.NEXT_PUBLIC_RMI_BASE_API_URL,
      override: {
        mutator: {
          path: './custom-fetch.ts',
          name: 'customFetch',
        },
      },
    },
  },
```

> ## API Agent (Curriculo)

* https://raw.githubusercontent.com/prefeitura-rio/superapp-agent-api/refs/heads/main/openapi.yaml

```
  api: {
    input:
      'https://raw.githubusercontent.com/prefeitura-rio/superapp-agent-api/refs/heads/main/openapi.yaml',
    output: {
      target: './src/http-agent-api/api.ts',
      schemas: './src/http-agent-api/models',
      mode: 'tags-split',
      client: 'fetch',
      formatter: 'biome',
      httpClient: 'fetch',
      clean: true,
      baseUrl: process.env.AGENT_API_BASE_URL,
      override: {
        mutator: {
          path: './custom-fetch-agent-api.ts',
          name: 'customFetchAgentApi',
        },
      },
    },
  },
```

> ## API Pref.Rio — Carta de Serviços (MuleSoft)

* Spec local: `./pref-rio-carta-servicos-api.yaml` (raiz do repo)

```
  api: {
    input: './pref-rio-carta-servicos-api.yaml',
    output: {
      target: './src/http-pref-rio-carta-servicos/api.ts',
      schemas: './src/http-pref-rio-carta-servicos/models',
      mode: 'tags-split',
      client: 'fetch',
      formatter: 'biome',
      httpClient: 'fetch',
      clean: true,
      baseUrl: process.env.BASE_API_URL_PREF_RIO_CARTA_SERVICOS,
      override: {
        mutator: {
          path: './custom-fetch-pref-rio-carta-servicos.ts',
          name: 'customFetchPrefRioCartaServicos',
        },
      },
    },
  },
```

> ## API Pref.Rio — Cidadão (MuleSoft)

* Spec local: `./pref-rio-cidadao-api.yaml` (raiz do repo)

```
  api: {
    input: './pref-rio-cidadao-api.yaml',
    output: {
      target: './src/http-pref-rio-cidadao/api.ts',
      schemas: './src/http-pref-rio-cidadao/models',
      mode: 'tags-split',
      client: 'fetch',
      formatter: 'biome',
      httpClient: 'fetch',
      clean: true,
      baseUrl: process.env.BASE_API_URL_PREF_RIO_CIDADAO,
      override: {
        mutator: {
          path: './custom-fetch-pref-rio-cidadao.ts',
          name: 'customFetchPrefRioCidadao',
        },
      },
    },
  },
```

> ## API Pref.Rio — Chamados Público (MuleSoft)

* Spec local: `./pref-rio-chamados-publico-api.yaml` (raiz do repo)

```
  api: {
    input: './pref-rio-chamados-publico-api.yaml',
    output: {
      target: './src/http-pref-rio-chamados-publico/api.ts',
      schemas: './src/http-pref-rio-chamados-publico/models',
      mode: 'tags-split',
      client: 'fetch',
      formatter: 'biome',
      httpClient: 'fetch',
      clean: true,
      baseUrl: process.env.BASE_API_URL_PREF_RIO_CHAMADOS_PUBLICO,
      override: {
        mutator: {
          path: './custom-fetch-pref-rio-chamados-publico.ts',
          name: 'customFetchPrefRioChamadosPublico',
        },
      },
    },
  },
```
