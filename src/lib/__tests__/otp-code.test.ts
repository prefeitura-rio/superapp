import { describe, expect, it } from 'vitest'
import { OTP_CODE_LENGTH, extractOtpCode } from '../otp-code'

describe('extractOtpCode', () => {
  it('mantém um código limpo', () => {
    expect(extractOtpCode('123456')).toBe('123456')
  })

  it.each([
    [' 123456', 'espaço antes'],
    ['123456 ', 'espaço depois'],
    ['\n123456\n', 'quebras de linha'],
    ['\t123456\r\n', 'tab e CRLF'],
    ['123 456', 'espaço no meio'],
    ['123-456', 'hífen no meio'],
    ['1 2 3 4 5 6', 'dígitos espaçados'],
    ['*123456*', 'negrito do WhatsApp'],
    ['123456.', 'pontuação depois'],
    ['Seu código de verificação é 123456', 'texto antes'],
    [
      'Seu código de verificação é: 123456. Ele expira em 5 minutos.',
      'texto e outros números ao redor',
    ],
  ])('extrai o código de %j (%s)', pasted => {
    expect(extractOtpCode(pasted)).toBe('123456')
  })

  it('corta em 6 dígitos quando não há sequência isolada', () => {
    expect(extractOtpCode('12345678')).toBe('123456')
  })

  it('devolve só os dígitos disponíveis quando há menos de 6', () => {
    expect(extractOtpCode(' 12 3')).toBe('123')
  })

  it('devolve vazio quando não há dígitos', () => {
    expect(extractOtpCode('abc \n')).toBe('')
  })

  it('usa 6 dígitos por padrão', () => {
    expect(OTP_CODE_LENGTH).toBe(6)
  })
})
