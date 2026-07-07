import { defineConfig } from 'orval'

const appCatalogoOpenApi =
  process.env.APP_CATALOGO_OPENAPI_URL ??
  'https://raw.githubusercontent.com/prefeitura-rio/app-catalogo/refs/heads/main/docs/openapi-v3.json'

export default defineConfig({
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
      baseUrl: process.env.NEXT_PUBLIC_COURSES_BASE_API_URL,
      override: {
        mutator: {
          path: './custom-fetch-course.ts',
          name: 'customFetch',
        },
      },
    },
  },
  appCatalogo: {
    input: appCatalogoOpenApi,
    output: {
      target: './src/http-app-catalogo/api.ts',
      schemas: './src/http-app-catalogo/models',
      mode: 'tags-split',
      client: 'fetch',
      formatter: 'biome',
      httpClient: 'fetch',
      clean: true,
      baseUrl: process.env.NEXT_PUBLIC_BASE_API_URL_APP_CATALOGO,
      override: {
        mutator: {
          path: './custom-fetch-app-catalogo.ts',
          name: 'customFetchAppCatalogo',
        },
      },
    },
  },
})
