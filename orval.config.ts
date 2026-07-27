import { defineConfig } from 'orval'

export default defineConfig({
  api: {
    input: './pref-rio-chamados-publico-api.yaml',
    output: {
      target: './src/http-pref-rio-chamados-publico/api.ts',
      schemas: './src/http-pref-rio-chamados-publico/models',
      mode: 'tags-split',
      client: 'fetch',
      formatter: 'biome',
      httpClient: 'fetch',
      clean: true,
      baseUrl: process.env.BASE_API_URL_PREF_RIO_CHAMADOS_PUBLICO,
      override: {
        mutator: {
          path: './custom-fetch-pref-rio-chamados-publico.ts',
          name: 'customFetchPrefRioChamadosPublico',
        },
      },
    },
  },
})
