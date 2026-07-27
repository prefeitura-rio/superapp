import { defineConfig } from 'orval'

export default defineConfig({
  api: {
    input: './pref-rio-cidadao-api.yaml',
    output: {
      target: './src/http-pref-rio-cidadao/api.ts',
      schemas: './src/http-pref-rio-cidadao/models',
      mode: 'tags-split',
      client: 'fetch',
      formatter: 'biome',
      httpClient: 'fetch',
      clean: true,
      baseUrl: process.env.BASE_API_URL_PREF_RIO_CIDADAO,
      override: {
        mutator: {
          path: './custom-fetch-pref-rio-cidadao.ts',
          name: 'customFetchPrefRioCidadao',
        },
      },
    },
  },
})
