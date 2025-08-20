import { defineConfig } from 'orval'

export default defineConfig({
  api: {
    input:
      'https://raw.githubusercontent.com/prefeitura-rio/app-rmi/refs/heads/staging/docs/openapi-v3.json',
    output: {
      target: './src/http/api.ts',
      schemas: './src/http/models',
      mode: 'tags-split',
      client: 'fetch',
      biome: true,
      httpClient: 'fetch',
      clean: true,
      override: {
        mutator: {
          path: './custom-fetch.ts',
          name: 'customFetch',
        },
      },
    },
  },
})
