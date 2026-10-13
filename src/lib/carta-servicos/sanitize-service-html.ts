import type { ModelsPrefRioService } from '@/http-busca-search/models/modelsPrefRioService'
import DOMPurify from 'dompurify'
import type { Config } from 'dompurify'
import { JSDOM } from 'jsdom'

/**
 * Server-only sanitizer for Carta de Serviços HTML.
 * Import from Server Components. The client receives the already clean string.
 * jsdom is used when this module runs in Node, where `window` does not exist.
 */

const ALLOWED_TAGS = [
  'p',
  'br',
  'h2',
  'h3',
  'h4',
  'strong',
  'em',
  'u',
  'ul',
  'ol',
  'li',
  'a',
] as const

const SANITIZE_CONFIG: Config = {
  ALLOWED_TAGS: [...ALLOWED_TAGS],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
  ALLOW_DATA_ATTR: false,
  ALLOW_ARIA_ATTR: false,
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):)/i,
}

type Purifier = typeof DOMPurify

let purifier: Purifier | null = null

function resolveWindow(): Window {
  if (typeof window !== 'undefined') return window
  return new JSDOM('').window as unknown as Window
}

function createPurifier(domWindow: Window): Purifier {
  const factory = DOMPurify as unknown as (root: Window) => Purifier
  const instance = factory(domWindow)

  instance.addHook('afterSanitizeAttributes', node => {
    if (node.tagName !== 'A') return
    node.setAttribute('target', '_blank')
    node.setAttribute('rel', 'noopener noreferrer')
  })

  return instance
}

function getPurifier(): Purifier {
  if (!purifier) {
    purifier = createPurifier(resolveWindow())
  }
  return purifier
}

export function sanitizeServiceHtml(html: string): string {
  if (!html.trim()) return ''

  const clean = getPurifier().sanitize(html, SANITIZE_CONFIG)
  return typeof clean === 'string' ? clean : String(clean)
}

function sanitizeOptional(value: string | undefined): string | undefined {
  if (value === undefined) return undefined
  return sanitizeServiceHtml(value)
}

/** Cleans the HTML fields of a service. Legislation stays untouched. */
export function sanitizePrefRioServiceHtml<T extends ModelsPrefRioService>(
  service: T
): T {
  return {
    ...service,
    resumo: sanitizeServiceHtml(service.resumo),
    descricao_completa: sanitizeServiceHtml(service.descricao_completa),
    instrucoes_solicitante: sanitizeOptional(service.instrucoes_solicitante),
    resultado_solicitacao: sanitizeServiceHtml(service.resultado_solicitacao),
    servico_nao_cobre: sanitizeOptional(service.servico_nao_cobre),
    documentos_necessarios: service.documentos_necessarios?.map(item =>
      sanitizeServiceHtml(item)
    ),
  }
}
