import { defineConfig } from 'orval'

export default defineConfig({
  api: {
    input: './rmi_swagger.yaml',
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
})
