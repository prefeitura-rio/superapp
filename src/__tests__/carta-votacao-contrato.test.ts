// @vitest-environment node
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { getPostArticleVoteUrl } from '@/http-pref-rio-carta-votacao/default/default'
import {
  DESCRIPTION_MAX_LENGTH,
  OTHER_REASON,
  REJECTION_REASON_OPTIONS,
} from '@/lib/carta-servicos/avaliacao/reasons'
import { toVoteRequest } from '@/lib/carta-servicos/avaliacao/request'
import { submitVote } from '@/lib/carta-servicos/avaliacao/submit-vote'
import { TEST_ENV } from '@/test/mocks/env'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { parse } from 'yaml'
import { resetPrefRioCartaVotacaoTokenCache } from '../../custom-fetch-pref-rio-carta-votacao'

/**
 * Trava do contrato da votação (`pref-rio-carta-votacao-api.yaml`, spec oficial do CRM,
 * CZRM-2969).
 *
 * O client do Orval só muda quando alguém regenera, e o typecheck só pega o que mudou de
 * tipo. Este teste lê o yaml e confere o que o código assume dele: nome da operação,
 * motivos, limites, campos obrigatórios e o formato de cada resposta. Se o CRM mandar uma
 * versão nova e ela quebrar alguma premissa, este teste cai junto com a troca do arquivo.
 */

type Schema = {
  type?: string
  enum?: string[]
  required?: string[]
  properties?: Record<string, Schema>
  items?: Schema
  minItems?: number
  maxLength?: number
  nullable?: boolean
  oneOf?: Schema[]
  $ref?: string
  discriminator?: { propertyName: string; mapping: Record<string, string> }
}

type Spec = {
  servers: { url: string }[]
  paths: Record<
    string,
    Record<
      string,
      {
        operationId: string
        requestBody: { required: boolean }
        responses: Record<
          string,
          { content: { 'application/json': { schema: Schema } } }
        >
      }
    >
  >
  components: {
    schemas: Record<string, Schema>
    securitySchemes: Record<
      string,
      { type: string; flows: { clientCredentials?: { tokenUrl: string } } }
    >
  }
}

const spec = parse(
  readFileSync(
    resolve(process.cwd(), 'pref-rio-carta-votacao-api.yaml'),
    'utf8'
  )
) as Spec

const schemas = spec.components.schemas
const voteOperation = spec.paths['/services/{slug}/vote']?.post

function refName(schema: Schema): string | undefined {
  return schema.$ref?.replace('#/components/schemas/', '')
}

function responseSchemaNames(status: string): string[] {
  const schema =
    voteOperation.responses[status].content['application/json'].schema
  return schema.oneOf
    ? schema.oneOf.map(item => refName(item) ?? '')
    : [refName(schema) ?? '']
}

const ARTICLE_ID = 'ka089000000Bj0DAAS'
const VOTER_TOKEN = 'AAAAAAAAAAAAAAAAAAAAAA'

describe('contrato da votação — o que o código assume do yaml', () => {
  test('a operação é POST /services/{slug}/vote, chamada postArticleVote', () => {
    expect(voteOperation).toBeDefined()
    expect(voteOperation.operationId).toBe('postArticleVote')
    expect(voteOperation.requestBody.required).toBe(true)
    expect(getPostArticleVoteUrl('slug-teste')).toBe(
      '/services/slug-teste/vote'
    )
  })

  test('servers e tokenUrl têm o formato das envs SALESFORCE_VOTACAO_*', () => {
    // O mutator monta a URL a partir das envs; o yaml só confirma o formato delas.
    expect(spec.servers[0].url).toMatch(/\/services\/apexrest\/apis\/public$/)
    const oauth = Object.values(spec.components.securitySchemes)[0]
    expect(oauth.type).toBe('oauth2')
    expect(oauth.flows.clientCredentials?.tokenUrl).toMatch(
      /\/services\/oauth2\/token$/
    )
  })

  test('os 6 motivos do yaml são os chips da tela, na ordem do design', () => {
    expect(schemas.RejectionReason.enum).toEqual(
      REJECTION_REASON_OPTIONS.map(option => option.value)
    )
    expect(schemas.RejectionReason.enum).toContain(OTHER_REASON)
  })

  test('o pedido é up ou down, escolhido pelo campo vote', () => {
    expect(schemas.VoteRequest.discriminator).toEqual({
      propertyName: 'vote',
      mapping: {
        up: '#/components/schemas/VoteUpRequest',
        down: '#/components/schemas/VoteDownRequest',
      },
    })
    expect(schemas.VoteUpRequest.properties?.vote.enum).toEqual(['up'])
    expect(schemas.VoteDownRequest.properties?.vote.enum).toEqual(['down'])
  })

  test('dislike exige ao menos 1 motivo, e o comentário tem no máximo 500 caracteres', () => {
    const down = schemas.VoteDownRequest
    expect(down.properties?.rejectionReasons.minItems).toBe(1)
    expect(down.properties?.rejectionDescription.maxLength).toBe(
      DESCRIPTION_MAX_LENGTH
    )
  })

  test('o corpo montado pelo portal tem todos os obrigatórios e nenhum campo fora do contrato', () => {
    const up = toVoteRequest({ vote: 'up', articleId: ARTICLE_ID }, VOTER_TOKEN)
    const down = toVoteRequest(
      {
        vote: 'down',
        articleId: ARTICLE_ID,
        rejectionReasons: ['Informacao_incorreta', 'Outro_motivo'],
        rejectionDescription: 'O endereço mudou.',
      },
      VOTER_TOKEN
    )

    for (const [body, schema] of [
      [up, schemas.VoteUpRequest],
      [down, schemas.VoteDownRequest],
    ] as const) {
      for (const field of schema.required ?? []) {
        expect(body).toHaveProperty(field)
      }
      for (const field of Object.keys(body)) {
        expect(Object.keys(schema.properties ?? {})).toContain(field)
      }
    }
  })

  test('cada resposta tem o formato que o portal trata', () => {
    expect(Object.keys(voteOperation.responses).sort()).toEqual(
      ['200', '400', '401', '403', '404', '500', '503'].sort()
    )
    expect(responseSchemaNames('200')).toEqual(['VoteResponse'])
    for (const status of ['400', '404', '500']) {
      expect(responseSchemaNames(status)).toEqual(['ErrorResponse'])
    }
    for (const status of ['403', '503']) {
      expect(responseSchemaNames(status)).toEqual(['SalesforcePlatformError'])
    }
    // 401 em lista com INVALID_SESSION_ID é o que dispara a renovação do token.
    expect(responseSchemaNames('401').sort()).toEqual(
      ['ErrorResponse', 'SalesforcePlatformError'].sort()
    )
    expect(schemas.SalesforcePlatformError.type).toBe('array')
    expect(schemas.SalesforcePlatformError.items?.required).toEqual(
      expect.arrayContaining(['message', 'errorCode'])
    )
    expect(schemas.ErrorResponse.properties?.error.required).toEqual(
      expect.arrayContaining(['code', 'message'])
    )
    expect(schemas.Helpfulness.required).toEqual(
      expect.arrayContaining(['up', 'down', 'score'])
    )
  })
})

/**
 * Um corpo de exemplo, no formato do yaml, para cada resposta declarada, e o que o portal
 * entrega à rota. Se o contrato ganhar um status novo, o teste acima cai e esta tabela
 * precisa crescer junto.
 */
const RESPONSES: {
  status: number
  body: unknown
  expected: Awaited<ReturnType<typeof submitVote>>
}[] = [
  {
    status: 200,
    body: { data: { up: 1, down: 0, score: 1 } },
    expected: { ok: true },
  },
  {
    status: 400,
    body: { error: { code: 'VALIDATION_ERROR', message: 'x' } },
    expected: { ok: false, status: 400, code: 'invalid_payload' },
  },
  {
    status: 401,
    body: { error: { code: 'UNAUTHORIZED', message: 'x' } },
    expected: { ok: false, status: 503, code: 'unavailable' },
  },
  {
    status: 403,
    body: [{ message: 'x', errorCode: 'REQUEST_LIMIT_EXCEEDED' }],
    expected: { ok: false, status: 503, code: 'unavailable' },
  },
  {
    status: 404,
    body: { error: { code: 'NOT_FOUND', message: 'x' } },
    expected: { ok: false, status: 404, code: 'not_found' },
  },
  {
    status: 500,
    body: { error: { code: 'INTERNAL_ERROR', message: 'x' } },
    expected: { ok: false, status: 503, code: 'unavailable' },
  },
  {
    status: 503,
    body: [{ message: 'x', errorCode: 'SERVER_UNAVAILABLE' }],
    expected: { ok: false, status: 503, code: 'unavailable' },
  },
]

describe('contrato da votação — cada resposta atravessa client, mutator e submitVote', () => {
  beforeEach(() => {
    resetPrefRioCartaVotacaoTokenCache()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    server.use(
      http.post(TEST_ENV.SALESFORCE_VOTACAO_TOKEN_URL, () =>
        HttpResponse.json({ access_token: 'token', token_type: 'Bearer' })
      )
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('a tabela cobre todos os status do yaml', () => {
    expect(RESPONSES.map(item => String(item.status)).sort()).toEqual(
      Object.keys(voteOperation.responses).sort()
    )
  })

  test.each(RESPONSES)('HTTP $status', async ({ status, body, expected }) => {
    server.use(
      http.post(
        `${TEST_ENV.SALESFORCE_VOTACAO_API_URL}/services/slug-teste/vote`,
        () => HttpResponse.json(body as Record<string, unknown>, { status })
      )
    )

    const result = await submitVote(
      'slug-teste',
      { vote: 'up', articleId: ARTICLE_ID },
      VOTER_TOKEN
    )

    expect(result).toEqual(expected)
  })
})
