### Metodologia para gerar novos http clients com orval:

- No arquivo **orval.config.ts, trocar esses campos de acordo com a api:**
- **input**
- **target**
- **schema**
- **path**
- **baseUrl**
- **name**
- 

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
      biome: true,
      httpClient: 'fetch',
      clean: true,
      baseUrl: process.env.NEXT_PUBLIC_BASE_API_URL_APP_BUSCA_SEARCH,
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
      'https://raw.githubusercontent.com/prefeitura-rio/app-go-api/refs/heads/staging/docs/openapi-v3.json',
    output: {
      target: './src/http-courses/api.ts',
      schemas: './src/http-courses/models',
      mode: 'tags-split',
      client: 'fetch',
      biome: true,
      httpClient: 'fetch',
      clean: true,
      baseUrl: process.env.NEXT_PUBLIC_COURSES_BASE_API_URL,
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
      biome: true,
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

- https://raw.githubusercontent.com/prefeitura-rio/app-rmi/refs/heads/staging/docs/openapi-v3.json

```
  api: {
    input:
      'https://raw.githubusercontent.com/prefeitura-rio/app-rmi/refs/heads/staging/docs/openapi-v3.json',
    output: {
      target: './src/http-rmi/api.ts',
      schemas: './src/http-rmi/models',
      mode: 'tags-split',
      client: 'fetch',
      biome: true,
      httpClient: 'fetch',
      clean: true,
      baseUrl: process.env.NEXT_PUBLIC_RMI_BASE_API_URL,
      override: {
        mutator: {
          path: './custom-fetch-rmi.ts',
          name: 'customFetchRmi',
        },
      },
    },
  },
```
