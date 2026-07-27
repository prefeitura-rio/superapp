import { defineConfig } from 'orval'

export default defineConfig({
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
})
