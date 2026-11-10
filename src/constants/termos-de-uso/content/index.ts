import type { TermosDeUsoSlug } from '../platforms'
import type { TermosDeUsoDocument } from '../types'
import { PREF_RIO_V1_PARTS } from './pref-rio-v1'

/**
 * Termos de uso de cada plataforma: texto, versão e data de atualização.
 *
 * Para trocar o texto de UMA plataforma, mexa só na entrada dela:
 * 1. crie o arquivo do texto nesta pasta (ex.: `cursos-v2.ts`, exportando um
 *    `TermosDeUsoPart[]` como em `pref-rio-v1.ts`);
 * 2. aponte `parts` da entrada para ele e atualize `version` e `updatedAt`.
 * As telas (`src/app/(app)/(logged-in-out)/termos-de-uso`) não mudam.
 *
 * O tipo `Record<TermosDeUsoSlug, …>` obriga uma entrada para cada plataforma
 * de `platforms.ts`: faltar ou sobrar plataforma quebra o typecheck.
 *
 * Fica fora de `platforms.ts` de propósito: a lista vai para o client e não
 * precisa carregar o texto das 5 plataformas.
 */
export const TERMOS_DE_USO_CONTENT: Record<
  TermosDeUsoSlug,
  TermosDeUsoDocument
> = {
  'prefrio-site': {
    updatedAt: 'Abril de 2026',
    version: '1.0',
    parts: PREF_RIO_V1_PARTS,
  },
  'prefrio-central-telefonica': {
    updatedAt: 'Abril de 2026',
    version: '1.0',
    parts: PREF_RIO_V1_PARTS,
  },
  'prefrio-whatsapp': {
    updatedAt: 'Abril de 2026',
    version: '1.0',
    parts: PREF_RIO_V1_PARTS,
  },
  cursos: {
    updatedAt: 'Abril de 2026',
    version: '1.0',
    parts: PREF_RIO_V1_PARTS,
  },
  empregos: {
    updatedAt: 'Abril de 2026',
    version: '1.0',
    parts: PREF_RIO_V1_PARTS,
  },
}

export function getTermosDeUsoDocument(
  slug: string
): TermosDeUsoDocument | undefined {
  return Object.hasOwn(TERMOS_DE_USO_CONTENT, slug)
    ? TERMOS_DE_USO_CONTENT[slug as TermosDeUsoSlug]
    : undefined
}

export function formatTermosDeUsoLastUpdate(document: TermosDeUsoDocument) {
  return `Última atualização: ${document.updatedAt} - Versão ${document.version}`
}
