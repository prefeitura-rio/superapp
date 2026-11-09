import type { TermosDeUsoDocument } from '../types'
import { PREF_RIO_TERMOS_V1 } from './pref-rio-v1'

/**
 * Texto de cada plataforma, por slug. Para trocar o texto de uma plataforma,
 * criar o arquivo dela nesta pasta e apontar o slug para ele; a tela não muda.
 *
 * Fica fora de `platforms.ts` de propósito: a lista vai para o client e não
 * precisa carregar o texto inteiro das 5 plataformas.
 */
const DOCUMENTS_BY_SLUG: Record<string, TermosDeUsoDocument> = {
  'prefrio-site': PREF_RIO_TERMOS_V1,
  'prefrio-central-telefonica': PREF_RIO_TERMOS_V1,
  'prefrio-whatsapp': PREF_RIO_TERMOS_V1,
  cursos: PREF_RIO_TERMOS_V1,
  empregos: PREF_RIO_TERMOS_V1,
}

export function getTermosDeUsoDocument(
  slug: string
): TermosDeUsoDocument | undefined {
  return Object.hasOwn(DOCUMENTS_BY_SLUG, slug)
    ? DOCUMENTS_BY_SLUG[slug]
    : undefined
}

export function formatTermosDeUsoLastUpdate(document: TermosDeUsoDocument) {
  return `Última atualização: ${document.updatedAt} - Versão ${document.version}`
}
