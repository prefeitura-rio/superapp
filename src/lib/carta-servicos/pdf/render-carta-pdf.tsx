import type { ClientsCartaServiceDetail } from '@/http-app-catalogo/models/clientsCartaServiceDetail'
import type { CartaOrgUnit } from '@/lib/carta-servicos/org-units'
import { renderToBuffer } from '@react-pdf/renderer'
import { CartaPdfDocument } from './carta-pdf-document'
import { registerCartaPdfFonts } from './styles'

// biome-ignore lint/suspicious/noControlCharactersInRegex: é exatamente o que removemos
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g

/**
 * O CMS às vezes manda caracteres de controle (\x0B, \x15…) colados no texto. A
 * fonte não tem glifo para eles e o react-pdf cai no Helvetica, imprimindo lixo.
 */
export function stripControlChars<T>(value: T): T {
  if (typeof value === 'string') {
    return value.replace(CONTROL_CHARS, '') as T
  }
  if (Array.isArray(value)) {
    return value.map(item => stripControlChars(item)) as T
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, stripControlChars(item)])
    ) as T
  }
  return value
}

/** Monta o PDF da Carta de um órgão. Só roda no servidor (fs + jsdom). */
export async function renderCartaPdf(
  org: CartaOrgUnit,
  services: ClientsCartaServiceDetail[]
): Promise<Buffer> {
  registerCartaPdfFonts()
  return renderToBuffer(
    <CartaPdfDocument
      org={stripControlChars(org)}
      services={stripControlChars(services)}
    />
  )
}

/**
 * Cache em memória do PDF pronto. Gerar a carta de um órgão grande ocupa a CPU por
 * segundos; os dados da app-catalogo já ficam 10 min no data cache, então o PDF
 * pode viver o mesmo tempo. A chave inclui uma impressão digital dos serviços: se o
 * conteúdo mudou, gera de novo. Pedidos simultâneos do mesmo PDF compartilham a
 * mesma geração.
 */
const PDF_TTL_MS = 10 * 60 * 1000
const PDF_CACHE_MAX_ENTRIES = 60

type CacheEntry = { key: string; expiresAt: number; pdf: Promise<Buffer> }
const pdfCache = new Map<string, CacheEntry>()

export function cartaPdfFingerprint(
  org: CartaOrgUnit,
  services: ClientsCartaServiceDetail[]
): string {
  const parts = services.map(
    service =>
      `${service.slug}@${service.articleVersion ?? ''}:${service.lastModifiedDate ?? ''}`
  )
  return `${org.name}|${org.shortName}|${parts.join(',')}`
}

export function getCachedCartaPdf(
  org: CartaOrgUnit,
  services: ClientsCartaServiceDetail[],
  now = Date.now()
): Promise<Buffer> {
  const key = cartaPdfFingerprint(org, services)
  const cached = pdfCache.get(org.siciCode)
  if (cached && cached.key === key && cached.expiresAt > now) {
    return cached.pdf
  }

  const pdf = renderCartaPdf(org, services)
  pdfCache.delete(org.siciCode)
  pdfCache.set(org.siciCode, { key, expiresAt: now + PDF_TTL_MS, pdf })
  // Falha não fica em cache.
  pdf.catch(() => {
    if (pdfCache.get(org.siciCode)?.pdf === pdf) pdfCache.delete(org.siciCode)
  })

  while (pdfCache.size > PDF_CACHE_MAX_ENTRIES) {
    const oldest = pdfCache.keys().next().value
    if (oldest === undefined) break
    pdfCache.delete(oldest)
  }

  return pdf
}

/** Só para testes. */
export function clearCartaPdfCache() {
  pdfCache.clear()
}
