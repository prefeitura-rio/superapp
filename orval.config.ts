import { defineConfig } from 'orval'

export default defineConfig({
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
})
