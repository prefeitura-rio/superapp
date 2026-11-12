import { buildTermosDeUsoHref } from './platforms'

/** Parâmetro de busca que diz de onde a pessoa abriu os termos. */
export const TERMOS_DE_USO_ORIGIN_PARAM = 'origem'

/**
 * Telas que abrem os termos e precisam receber a pessoa de volta, em vez de o
 * voltar levar à lista de Termos de uso.
 */
export const TERMOS_DE_USO_ORIGINS = {
  curriculo: {
    href: '/servicos/trabalho/curriculo',
    label: 'Voltar para o currículo',
  },
} as const

export type TermosDeUsoOrigin = keyof typeof TERMOS_DE_USO_ORIGINS

export function parseTermosDeUsoOrigin(
  value: string | string[] | undefined
): TermosDeUsoOrigin | undefined {
  const origin = Array.isArray(value) ? value[0] : value
  return origin && Object.hasOwn(TERMOS_DE_USO_ORIGINS, origin)
    ? (origin as TermosDeUsoOrigin)
    : undefined
}

/** Link para o detalhe de uma plataforma marcando a tela de origem. */
export function buildTermosDeUsoHrefFrom(
  slug: string,
  origin: TermosDeUsoOrigin
) {
  return `${buildTermosDeUsoHref(slug)}?${TERMOS_DE_USO_ORIGIN_PARAM}=${origin}`
}
