import { defineConfig } from 'orval'

// NOTE: Orval config runs at build time and cannot use runtime functions like getEnv() from server.ts
// However, we ensure this environment variable matches the one validated in server.ts
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
      baseUrl: process.env.NEXT_PUBLIC_BASE_API_URL,
      override: {
        mutator: {
          path: './custom-fetch.ts',
          name: 'customFetch',
        },
      },
    },
  },
})
