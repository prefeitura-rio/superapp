export const OTP_CODE_LENGTH = 6

/**
 * Extrai o código numérico de um texto colado no campo de OTP.
 *
 * O texto copiado de uma mensagem (WhatsApp, SMS) costuma vir com espaço,
 * quebra de linha, pontuação ou palavras ao redor dos dígitos. Quando há uma
 * sequência isolada com exatamente `length` dígitos, ela é o código; senão,
 * todos os caracteres que não são dígitos são descartados (ex.: "123 456").
 */
export function extractOtpCode(
  pasted: string,
  length: number = OTP_CODE_LENGTH
): string {
  // Sem lookbehind: navegadores antigos (Safari < 16.4) não o suportam.
  const isolated = pasted.match(
    new RegExp(`(?:^|\\D)(\\d{${length}})(?:\\D|$)`)
  )
  if (isolated) {
    return isolated[1]
  }
  return pasted.replace(/\D/g, '').slice(0, length)
}
