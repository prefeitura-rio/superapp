/**
 * Formatadores client-safe do módulo Dívida Ativa.
 *
 * A inscrição imobiliária trafega e é armazenada **somente com dígitos** (premissa P4 do
 * contrato). A máscara existe apenas para leitura humana, e por isso mora aqui, no front —
 * nunca no que é enviado à API.
 */

/** Tamanhos válidos da inscrição imobiliária, incluindo o dígito verificador. */
export const INSCRICAO_MIN_DIGITOS = 7
export const INSCRICAO_MAX_DIGITOS = 8

export function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, '')
}

/**
 * Máscara de exibição da inscrição imobiliária: o último dígito é o verificador e o corpo é
 * agrupado de três em três, da direita para a esquerda.
 *
 * - 8 dígitos → `0.521.766-3`
 * - 7 dígitos → `521.766-3`
 *
 * Abaixo de sete dígitos o valor sai sem máscara: como a inscrição pode ter 7 **ou** 8
 * dígitos, não há como saber onde cai o verificador antes disso, e mascarar produziria
 * estados intermediários sem sentido a cada tecla.
 */
export function formatarInscricaoImobiliaria(valor: string): string {
  const digitos = somenteDigitos(valor).slice(0, INSCRICAO_MAX_DIGITOS)

  if (digitos.length < INSCRICAO_MIN_DIGITOS) return digitos

  const verificador = digitos.slice(-1)
  const corpo = digitos.slice(0, -1)

  const grupos: string[] = []
  for (let fim = corpo.length; fim > 0; fim -= 3) {
    grupos.unshift(corpo.slice(Math.max(0, fim - 3), fim))
  }

  return `${grupos.join('.')}-${verificador}`
}

/** Formato aceito pelo front. A validação de existência e vínculo é da API. */
export function isInscricaoImobiliariaValida(valor: string): boolean {
  const digitos = somenteDigitos(valor)

  return (
    digitos.length >= INSCRICAO_MIN_DIGITOS &&
    digitos.length <= INSCRICAO_MAX_DIGITOS
  )
}
