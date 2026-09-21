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

/** Dígitos do número único de processo do CNJ (`NNNNNNN-DD.AAAA.J.TR.OOOO`). */
export const EXECUCAO_FISCAL_DIGITOS = 20

/**
 * Máscara do número da execução fiscal, no padrão CNJ `NNNNNNN-DD.AAAA.J.TR.OOOO`:
 * sequencial, dígito verificador, ano, segmento judiciário, tribunal e origem.
 *
 * Diferente da inscrição imobiliária, aqui as posições são **fixas**, então a máscara pode
 * ser aplicada progressivamente a cada tecla sem produzir estado ambíguo. E ela precisa
 * tolerar o valor já pontuado: o cidadão copia o número da citação da Justiça, que vem
 * formatado — `somenteDigitos` desmonta antes de remontar, então colar não duplica separador.
 */
export function formatarExecucaoFiscal(valor: string): string {
  const digitos = somenteDigitos(valor).slice(0, EXECUCAO_FISCAL_DIGITOS)

  const partes: Array<{ tamanho: number; separador: string }> = [
    { tamanho: 7, separador: '-' },
    { tamanho: 2, separador: '.' },
    { tamanho: 4, separador: '.' },
    { tamanho: 1, separador: '.' },
    { tamanho: 2, separador: '.' },
    { tamanho: 4, separador: '' },
  ]

  let restante = digitos
  let formatado = ''

  for (const { tamanho, separador } of partes) {
    if (restante === '') break

    const grupo = restante.slice(0, tamanho)
    restante = restante.slice(tamanho)
    formatado += grupo

    // O separador só entra depois de o grupo fechar E havendo dígito para o próximo — senão
    // o campo terminaria em "-" ou "." enquanto o cidadão ainda digita.
    if (grupo.length === tamanho && restante !== '') {
      formatado += separador
    }
  }

  return formatado
}

/** Formato aceito pelo front. Existência do processo é da API. */
export function isExecucaoFiscalValida(valor: string): boolean {
  return somenteDigitos(valor).length === EXECUCAO_FISCAL_DIGITOS
}

/**
 * A CDA é validada só como "tem número".
 *
 * O contrato tipa `cdaId` como string livre e não documenta contagem de dígitos, então
 * qualquer limite que inventássemos recusaria valor que a API aceita — o oposto do que a
 * decisão D8 quer, que é evitar chamada à toa sem bloquear o cidadão. Apertar isto quando o
 * formato real for conhecido.
 */
export function isCdaValida(valor: string): boolean {
  return somenteDigitos(valor).length > 0
}
