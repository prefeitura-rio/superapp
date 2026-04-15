import { defineConfig } from 'orval'

export default defineConfig({
  api: {
    input:
      'https://raw.githubusercontent.com/prefeitura-rio/app-catalogo/refs/heads/staging/docs/openapi-v3.json',
    output: {
      target: './src/http-app-catalogo/api.ts',
      schemas: './src/http-app-catalogo/models',
      mode: 'tags-split',
      client: 'fetch',
      biome: true,
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
