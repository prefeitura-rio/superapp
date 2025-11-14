import { defineConfig } from 'orval'

export default defineConfig({
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
      baseUrl: process.env.NEXT_PUBLIC_BUSCA_SEARCH_API_URL,
      override: {
        mutator: {
          path: './custom-fetch-busca-search.ts',
          name: 'customFetchBuscaSearch',
        },
      },
    },
  },
})
