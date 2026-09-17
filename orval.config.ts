import { defineConfig } from 'orval'

/**
 * Um projeto nomeado por API. Regenere **um** client por vez:
 *
 *     npx orval --project dividaAtiva
 *
 * Rodar `npx orval` sem `--project` regenera todos os projetos deste arquivo, o que
 * mistura no diff clients que a sua tarefa não tocou. As receitas das APIs que ainda não
 * estão aqui ficam em `docs/orval-apis.md`.
 *
 * O código gerado (`src/http*`) é commitado e nunca editado à mão.
 */
export default defineConfig({
  prefRioChamadosPublico: {
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

  /**
   * `api-imoveis` (Quarkus), escrita por outra equipe. O spec é uma cópia fiel do
   * documento servido pela instância de homologação em
   * `https://api-appimoveishom.apps.ocp.rio.gov.br/swagger` — copiado para a raiz em vez
   * de lido pela URL de propósito: aquilo é endpoint de runtime, não spec versionado, e
   * gerar o client não pode depender de a homologação estar no ar nem de rede interna.
   * Atualizar o YAML é um passo manual e deliberado, para que a mudança de contrato
   * apareça no diff do PR.
   */
  dividaAtiva: {
    input: './divida-ativa-api.yaml',
    output: {
      target: './src/http-divida-ativa/api.ts',
      schemas: './src/http-divida-ativa/models',
      mode: 'tags-split',
      client: 'fetch',
      formatter: 'biome',
      httpClient: 'fetch',
      clean: true,
      baseUrl: process.env.BASE_API_URL_DIVIDA_ATIVA,
      override: {
        mutator: {
          path: './custom-fetch-divida-ativa.ts',
          name: 'customFetchDividaAtiva',
        },
      },
    },
  },
})
