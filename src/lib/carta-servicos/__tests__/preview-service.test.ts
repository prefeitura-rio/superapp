import { POST } from '@/app/api/preview/servicos/route'
import {
  PREVIEW_MAX_BODY_BYTES,
  isPreviewDataMessage,
  parseSalesforcePreviewOrigins,
  readPreviewNonce,
} from '@/lib/carta-servicos/preview-protocol'
import { allowPreviewRequest } from '@/lib/carta-servicos/preview-rate-limit'
import {
  cartaServiceDetailSchema,
  prepareServicePreview,
} from '@/lib/carta-servicos/preview-service'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import previewFixture from './fixtures/preview-service.json'

const NONCE = '123e4567-e89b-12d3-a456-426614174000'

describe('parseSalesforcePreviewOrigins', () => {
  it('keeps exact http origins and drops the rest', () => {
    const origins = parseSalesforcePreviewOrigins(
      ' https://org.lightning.force.com, *, https://org.my.salesforce.com/path, not a url, http://localhost:3000 '
    )

    expect(origins).toEqual([
      'https://org.lightning.force.com',
      'http://localhost:3000',
    ])
  })

  it('returns an empty list when the variable is missing', () => {
    expect(parseSalesforcePreviewOrigins(undefined)).toEqual([])
  })
})

describe('isPreviewDataMessage', () => {
  it('accepts only the preview data envelope with a nonce', () => {
    expect(
      isPreviewDataMessage({
        type: 'prefrio-preview-data',
        nonce: NONCE,
        payload: { name: 'IPTU' },
      })
    ).toBe(true)
    expect(
      isPreviewDataMessage({
        type: 'prefrio-preview-data',
        payload: { name: 'IPTU' },
      })
    ).toBe(false)
    expect(isPreviewDataMessage({ type: 'prefrio-preview-ready' })).toBe(false)
    expect(isPreviewDataMessage(null)).toBe(false)
  })
})

describe('readPreviewNonce', () => {
  it('reads a uuid from the hash and ignores anything else', () => {
    expect(readPreviewNonce(`#${NONCE}`)).toBe(NONCE)
    expect(readPreviewNonce('#not-a-nonce')).toBeNull()
    expect(readPreviewNonce('')).toBeNull()
  })
})

describe('prepareServicePreview', () => {
  it('maps the org unit and strips scripts before render', () => {
    const preview = prepareServicePreview({
      name: 'IPTU',
      themeSlug: 'tributos',
      responsibleOrgUnit: 'Secretaria Municipal de Fazenda',
      responsibleOrgUnitShortName: 'SMF',
      info: {
        summary: '<p>Resumo</p><script>alert(1)</script>',
      },
      flags: {
        activeCategoryConfigId: 'cfg-1',
        allowTicketSubmission: true,
        allowsAnonymity: false,
      },
    })

    expect(preview.service.nome_servico).toBe('IPTU')
    expect(preview.service.resumo).toContain('<p>Resumo</p>')
    expect(preview.service.resumo).not.toContain('script')
    expect(preview.orgaoGestorName).toBe(
      'Secretaria Municipal de Fazenda (SMF)'
    )
    expect(preview.categorySlug).toBe('tributos')
    expect(preview.ticketFlags).toEqual({
      allowTicketSubmission: true,
      allowsAnonymity: false,
      activeCategoryConfigId: 'cfg-1',
    })
  })
})

describe('POST /api/preview/servicos', () => {
  const previousFlag = process.env.PREVIEW_CARTA_SERVICOS_ENABLED

  beforeAll(() => {
    process.env.PREVIEW_CARTA_SERVICOS_ENABLED = 'true'
  })

  afterAll(() => {
    if (previousFlag === undefined) {
      process.env.PREVIEW_CARTA_SERVICOS_ENABLED = undefined
    } else {
      process.env.PREVIEW_CARTA_SERVICOS_ENABLED = previousFlag
    }
  })

  it('accepts the canonical fixture', () => {
    const parsed = cartaServiceDetailSchema.safeParse(previewFixture)
    expect(parsed.success).toBe(true)
    if (!parsed.success) return

    const preview = prepareServicePreview(parsed.data)
    expect(preview.service.nome_servico).toBe(
      'ISS - Alíquotas, Base de Cálculo e Código de Atividades'
    )
    expect(preview.service.resumo).toContain('<p>')
    expect(preview.service.documentos_necessarios).toEqual([
      '<p>CNPJ</p>',
      'CPF do responsável',
    ])
    expect(preview.categorySlug).toBe('tributos')
  })

  it('rejects a contract version other than 1', async () => {
    const response = await POST(
      new Request('http://localhost/api/preview/servicos', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': '192.0.2.20',
        },
        body: JSON.stringify({ version: 2, name: 'ISS' }),
      })
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ code: 'invalid_payload' })
  })

  it('returns the sanitized service and does not store it', async () => {
    const response = await POST(
      new Request('http://localhost/api/preview/servicos', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': '192.0.2.10',
        },
        body: JSON.stringify({
          name: 'Licença',
          info: { summary: '<p>ok</p><img src=x onerror=alert(1)>' },
          extra: 'ignored',
        }),
      })
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('no-store')

    const body = await response.json()
    expect(body.service.nome_servico).toBe('Licença')
    expect(body.service.resumo).toContain('<p>ok</p>')
    expect(body.service.resumo).not.toContain('onerror')
    expect(body.service.resumo).not.toContain('<img')
  })

  it('rejects invalid json and oversized bodies', async () => {
    const invalid = await POST(
      new Request('http://localhost/api/preview/servicos', {
        method: 'POST',
        body: '{',
      })
    )
    expect(invalid.status).toBe(400)

    const oversized = await POST(
      new Request('http://localhost/api/preview/servicos', {
        method: 'POST',
        headers: { 'content-length': String(PREVIEW_MAX_BODY_BYTES + 1) },
        body: '{}',
      })
    )
    expect(oversized.status).toBe(413)
  })

  it('rate limits one address without echoing the body', async () => {
    const ip = '198.51.100.10'
    for (let attempt = 0; attempt < 30; attempt++) {
      expect(allowPreviewRequest(ip)).toBe(true)
    }

    const response = await POST(
      new Request('http://localhost/api/preview/servicos', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': ip,
        },
        body: JSON.stringify({
          name: 'ISS',
          info: { summary: '<p>não logar</p>' },
        }),
      })
    )

    expect(response.status).toBe(429)
    expect(await response.json()).toEqual({ code: 'rate_limited' })
  })
})

describe('preview flag', () => {
  const previousFlag = process.env.PREVIEW_CARTA_SERVICOS_ENABLED

  afterAll(() => {
    if (previousFlag === undefined) {
      process.env.PREVIEW_CARTA_SERVICOS_ENABLED = undefined
    } else {
      process.env.PREVIEW_CARTA_SERVICOS_ENABLED = previousFlag
    }
  })

  it('answers 404 before the rate limit when the flag is off', async () => {
    process.env.PREVIEW_CARTA_SERVICOS_ENABLED = undefined
    const ip = '203.0.113.10'

    for (let attempt = 0; attempt < 31; attempt++) {
      const response = await POST(
        new Request('http://localhost/api/preview/servicos', {
          method: 'POST',
          headers: { 'x-forwarded-for': ip },
          body: '{',
        })
      )
      expect(response.status).toBe(404)
    }

    process.env.PREVIEW_CARTA_SERVICOS_ENABLED = 'true'
    expect(allowPreviewRequest(ip)).toBe(true)
  })
})

const luminariaSlice = {
  name: 'Reparo de luminária',
  articleStatus: 'Online',
  slug: 'reparo-de-luminaria',
  themeSlug: 'cidade',
  responsibleOrgUnitShortName: 'RIOLUZ',
  info: {
    summary:
      '<div class="rte-body" style="color:#181818"><p>Notificar problemas de iluminação.</p></div>',
    fullDescription:
      '<div style="color:#181818"><h3><span>O que é:</span></h3><h2></h2><ul><li><strong>Apagadas</strong></li></ul></div>',
    targetAudience: ['Publico_em_geral'],
    cost: 'Gratuito',
    costValue: null,
    costNotes: null,
    isFree: true,
    serviceDeadline: '3 Dias corridos',
    serviceDeadlineNotes: null,
  },
  howToRequest: {
    instructions:
      '<div><p>Clique <a href="https://api.whatsapp.com/send?phone=552134601746">aqui</a></p></div>',
  },
}

describe('catalogo payload slice', () => {
  it('accepts nulls and drops style and div', () => {
    const parsed = cartaServiceDetailSchema.safeParse(luminariaSlice)
    expect(parsed.success).toBe(true)
    if (!parsed.success) return

    const preview = prepareServicePreview(parsed.data)
    expect(preview.service.resumo).toContain('<p>')
    expect(preview.service.resumo).not.toContain('style')
    expect(preview.service.resumo).not.toContain('<div')

    const description = preview.service.descricao_completa ?? ''
    expect(description).toContain('<h3>')
    expect(description).toContain('<ul>')
    expect(description).toContain('<li>')
    expect(description).toContain('<strong>')
    expect(description).not.toContain('style')
    expect(description).not.toContain('<div')

    const instructions = preview.service.instrucoes_solicitante ?? ''
    expect(instructions).toContain('<p>')
    expect(instructions).toContain(
      'href="https://api.whatsapp.com/send?phone=552134601746"'
    )
    expect(instructions).not.toContain('<div')
    expect(preview.service.publico_especifico).toEqual(['Publico_em_geral'])
  })

  it('ignores the catalogo data envelope and does not read the article inside it', () => {
    const parsed = cartaServiceDetailSchema.safeParse({ data: luminariaSlice })
    expect(parsed.success).toBe(true)
    if (!parsed.success) return
    expect(parsed.data.name).toBeUndefined()
  })
})
