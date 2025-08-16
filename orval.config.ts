import { defineConfig } from 'orval'

export default defineConfig({
  api: {
    input: './openapi.yaml',
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
