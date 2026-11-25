import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['node_modules', '.next', 'dist'],
    testTimeout: 30000,
    // Um worker jsdom por núcleo estoura a RAM em máquinas com muitos núcleos e
    // pouca memória (14 núcleos / 7 GB), principalmente com `--coverage`: os
    // testes viram falsos timeouts. Limita o paralelismo.
    maxWorkers: 6,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
