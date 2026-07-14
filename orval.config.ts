import { defineConfig } from 'orval'

export default defineConfig({
  api: {
    input:
      'https://raw.githubusercontent.com/prefeitura-rio/app-go-api/refs/heads/main/docs/swagger.yaml',
    output: {
      target: './src/http-courses/api.ts',
      schemas: './src/http-courses/models',
      mode: 'tags-split',
      client: 'fetch',
      formatter: 'biome',
      httpClient: 'fetch',
      clean: true,
      baseUrl: process.env.NEXT_PUBLIC_COURSES_BASE_API_URL,
      override: {
        mutator: {
          path: './custom-fetch-course.ts',
          name: 'customFetch',
        },
      },
    },
  },
})
