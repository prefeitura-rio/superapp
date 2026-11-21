import type { ClientsCartaServiceDetail } from '@/http-app-catalogo/models/clientsCartaServiceDetail'
import {
  rewriteServiceUrlForEnvironment,
  shouldRewriteServiceUrls,
} from '@/lib/carta-servicos/environment-url-rewrite'
import { mapServiceDetailToPrefRioService } from '@/lib/carta-servicos/mappers'
import { groupServiceChannels } from '@/lib/carta-servicos/pdf/carta-pdf-content'
import { sanitizeServiceHtml } from '@/lib/carta-servicos/sanitize-service-html'
import { afterEach, describe, expect, it, vi } from 'vitest'

const PROD_GATEWAY_ALVARA =
  'https://gateway-idrio.apps.rio.gov.br/gateway?urlServico=https%3A%2F%2Fservices-carioca.rio.rj.gov.br%2Fgroup%2Fguest%2Falvara-de-licenca-para-estabelecimento'
const HML_GATEWAY_ALVARA =
  'https://gateway-idrio-hom.apps.rio.gov.br/gateway?urlServico=https%3A%2F%2Fservices-carioca-hml.rio.rj.gov.br%2Fgroup%2Fguest%2Falvara-consulta-previa-de-local'

function enable() {
  vi.stubEnv('FEATURE_SALESFORCE', 'true')
  vi.stubEnv('REWRITE_SERVICE_URLS_TO_HML', 'true')
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('shouldRewriteServiceUrls', () => {
  it('requires both flags', () => {
    expect(shouldRewriteServiceUrls()).toBe(false)

    vi.stubEnv('FEATURE_SALESFORCE', 'true')
    expect(shouldRewriteServiceUrls()).toBe(false)

    vi.stubEnv('REWRITE_SERVICE_URLS_TO_HML', 'true')
    expect(shouldRewriteServiceUrls()).toBe(true)

    vi.stubEnv('FEATURE_SALESFORCE', 'false')
    expect(shouldRewriteServiceUrls()).toBe(false)
  })

  it('is strict: only the exact string "true" enables the rewrite', () => {
    vi.stubEnv('FEATURE_SALESFORCE', 'true')
    vi.stubEnv('REWRITE_SERVICE_URLS_TO_HML', '1')
    expect(shouldRewriteServiceUrls()).toBe(false)
  })
})

describe('rewriteServiceUrlForEnvironment', () => {
  it('rewrites the alvará gateway URL end to end', () => {
    enable()
    expect(rewriteServiceUrlForEnvironment(PROD_GATEWAY_ALVARA)).toBe(
      HML_GATEWAY_ALVARA
    )
  })

  it.each([
    [
      'https://acesso.processo.rio/foo?a=1',
      'https://acessohom.processo.rio/foo?a=1',
    ],
    ['https://jeap.rio.rj.gov.br/x', 'https://jhom.rio.rj.gov.br/x'],
    [
      'https://services-carioca.rio.rj.gov.br/group/guest/outro-servico',
      'https://services-carioca-hml.rio.rj.gov.br/group/guest/outro-servico',
    ],
  ])('swaps the host of %s', (input, expected) => {
    enable()
    expect(rewriteServiceUrlForEnvironment(input)).toBe(expected)
  })

  it('rewrites a gateway URL whose inner service has no override', () => {
    enable()
    const input =
      'https://gateway-idrio.apps.rio.gov.br/gateway?urlServico=https%3A%2F%2Fjeap.rio.rj.gov.br%2Fx'
    expect(rewriteServiceUrlForEnvironment(input)).toBe(
      'https://gateway-idrio-hom.apps.rio.gov.br/gateway?urlServico=https%3A%2F%2Fjhom.rio.rj.gov.br%2Fx'
    )
  })

  it('applies an override to a direct URL and ignores the fragment', () => {
    enable()
    expect(
      rewriteServiceUrlForEnvironment(
        'https://services-carioca.rio.rj.gov.br/group/guest/alvara-de-licenca-para-estabelecimento/#topo'
      )
    ).toBe(
      'https://services-carioca-hml.rio.rj.gov.br/group/guest/alvara-consulta-previa-de-local'
    )
  })

  it('returns hosts outside the table byte for byte', () => {
    enable()
    for (const url of [
      'https://example.com',
      'https://www.rio.rj.gov.br/a b?x=%20',
      'https://gateway-idrio-hom.apps.rio.gov.br/gateway?urlServico=abc',
    ]) {
      expect(rewriteServiceUrlForEnvironment(url)).toBe(url)
    }
  })

  it('still swaps the gateway host when the inner service is not mapped', () => {
    enable()
    expect(
      rewriteServiceUrlForEnvironment(
        'https://gateway-idrio.apps.rio.gov.br/gateway?urlServico=https%3A%2F%2Fexample.com'
      )
    ).toBe(
      'https://gateway-idrio-hom.apps.rio.gov.br/gateway?urlServico=https%3A%2F%2Fexample.com'
    )
  })

  it('leaves non-http and invalid values untouched', () => {
    enable()
    for (const value of [
      '',
      '#preview',
      '/servicos/x',
      'mailto:a@b.com',
      'tel:+5521999999999',
      'https://',
      'Telefone: 1746',
    ]) {
      expect(rewriteServiceUrlForEnvironment(value)).toBe(value)
    }
    expect(rewriteServiceUrlForEnvironment(undefined)).toBeUndefined()
  })

  it('does nothing when FEATURE_SALESFORCE is off', () => {
    vi.stubEnv('FEATURE_SALESFORCE', 'false')
    vi.stubEnv('REWRITE_SERVICE_URLS_TO_HML', 'true')
    expect(rewriteServiceUrlForEnvironment(PROD_GATEWAY_ALVARA)).toBe(
      PROD_GATEWAY_ALVARA
    )
  })

  it('does nothing when the rewrite flag is absent (production)', () => {
    vi.stubEnv('FEATURE_SALESFORCE', 'true')
    expect(rewriteServiceUrlForEnvironment(PROD_GATEWAY_ALVARA)).toBe(
      PROD_GATEWAY_ALVARA
    )
  })
})

describe('integration points', () => {
  const detail = {
    slug: 'alvara',
    name: 'Alvará',
    buttons: [
      { title: 'Acessar', url: PROD_GATEWAY_ALVARA, enabled: true, order: 1 },
    ],
    channels: [
      {
        type: 'Digital',
        channelType: 'Site',
        value: 'https://jeap.rio.rj.gov.br/x',
        enabled: true,
        order: 1,
      },
    ],
  } as unknown as ClientsCartaServiceDetail

  it('rewrites buttons and digital channels in the mapper', () => {
    enable()
    const mapped = mapServiceDetailToPrefRioService(detail)
    expect(mapped.buttons?.[0].url_service).toBe(HML_GATEWAY_ALVARA)
    expect(mapped.canais_digitais?.[0]).toBe(
      'Site: https://jeap.rio.rj.gov.br/x'
    )
  })

  it('keeps production URLs in the mapper when disabled', () => {
    const mapped = mapServiceDetailToPrefRioService(detail)
    expect(mapped.buttons?.[0].url_service).toBe(PROD_GATEWAY_ALVARA)
  })

  it('rewrites anchor hrefs in sanitized HTML', () => {
    enable()
    const clean = sanitizeServiceHtml(
      `<p><a href="${PROD_GATEWAY_ALVARA}">link</a></p>`
    )
    expect(clean).toContain(HML_GATEWAY_ALVARA.replace(/&/g, '&amp;'))
  })

  it('rewrites buttons and channel links in the PDF content', () => {
    enable()
    const groups = groupServiceChannels(detail)
    const hrefs = groups.flatMap(group => group.entries.map(e => e.href))
    expect(hrefs).toContain(HML_GATEWAY_ALVARA)
    expect(hrefs).toContain('https://jhom.rio.rj.gov.br/x')
  })
})
