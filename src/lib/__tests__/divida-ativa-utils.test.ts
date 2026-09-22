import {
  formatarExecucaoFiscal,
  formatarInscricaoImobiliaria,
  formatarValorBRL,
  inscricaoParaApi,
  isCdaValida,
  isExecucaoFiscalValida,
  somenteDigitos,
} from '@/lib/divida-ativa-utils'
import { describe, expect, test } from 'vitest'

describe('somenteDigitos', () => {
  test('removes mask characters typed by the citizen', () => {
    expect(somenteDigitos('0.521.766-3')).toBe('05217663')
  })

  test('removes letters and spaces', () => {
    expect(somenteDigitos(' 052 abc 17663 ')).toBe('05217663')
  })

  test('returns an empty string when there is no digit', () => {
    expect(somenteDigitos('abc-.')).toBe('')
  })
})

describe('formatarInscricaoImobiliaria', () => {
  test('formats 8 digits as X.XXX.XXX-X', () => {
    expect(formatarInscricaoImobiliaria('05217663')).toBe('0.521.766-3')
  })

  test('formats 7 digits as XXX.XXX-X', () => {
    expect(formatarInscricaoImobiliaria('5217663')).toBe('521.766-3')
  })

  test('leaves fewer than 7 digits unmasked while the citizen is still typing', () => {
    // Abaixo de 7 dígitos não dá para saber onde cai o dígito verificador: mascarar ali
    // produziria estados intermediários sem sentido ("0-5") a cada tecla.
    expect(formatarInscricaoImobiliaria('0')).toBe('0')
    expect(formatarInscricaoImobiliaria('052')).toBe('052')
    expect(formatarInscricaoImobiliaria('052176')).toBe('052176')
  })

  test('re-masks an already masked value without duplicating separators', () => {
    expect(formatarInscricaoImobiliaria('0.521.766-3')).toBe('0.521.766-3')
  })

  test('discards non-digits and truncates above 8 digits', () => {
    expect(formatarInscricaoImobiliaria('05a21b7663999')).toBe('0.521.766-3')
  })

  test('returns an empty string for an empty value', () => {
    expect(formatarInscricaoImobiliaria('')).toBe('')
  })
})

describe('formatarExecucaoFiscal', () => {
  /**
   * Número único do CNJ: `NNNNNNN-DD.AAAA.J.TR.OOOO`, 20 dígitos. É o que o cidadão copia da
   * citação da Justiça, e ele já vem pontuado de lá — por isso a máscara precisa aceitar o
   * valor colado inteiro sem duplicar separador.
   */
  test('aplica a máscara CNJ nos 20 dígitos', () => {
    expect(formatarExecucaoFiscal('00123456720248190001')).toBe(
      '0012345-67.2024.8.19.0001'
    )
  })

  test('mascara progressivamente enquanto o cidadão digita', () => {
    expect(formatarExecucaoFiscal('0012345')).toBe('0012345')
    expect(formatarExecucaoFiscal('001234567')).toBe('0012345-67')
    expect(formatarExecucaoFiscal('0012345672024')).toBe('0012345-67.2024')
    expect(formatarExecucaoFiscal('00123456720248')).toBe('0012345-67.2024.8')
    expect(formatarExecucaoFiscal('0012345672024819')).toBe(
      '0012345-67.2024.8.19'
    )
  })

  // O número colado da citação já vem pontuado.
  test('reaplica a máscara sobre um valor já formatado', () => {
    expect(formatarExecucaoFiscal('0012345-67.2024.8.19.0001')).toBe(
      '0012345-67.2024.8.19.0001'
    )
  })

  test('descarta dígito excedente', () => {
    expect(formatarExecucaoFiscal('001234567202481900019999')).toBe(
      '0012345-67.2024.8.19.0001'
    )
  })
})

describe('isExecucaoFiscalValida', () => {
  test('aceita 20 dígitos, com ou sem máscara', () => {
    expect(isExecucaoFiscalValida('0012345-67.2024.8.19.0001')).toBe(true)
    expect(isExecucaoFiscalValida('00123456720248190001')).toBe(true)
  })

  test('recusa contagem diferente de 20', () => {
    expect(isExecucaoFiscalValida('0012345672024819000')).toBe(false)
    expect(isExecucaoFiscalValida('001234567202481900012')).toBe(false)
    expect(isExecucaoFiscalValida('')).toBe(false)
  })
})

describe('isCdaValida', () => {
  /**
   * Não sabemos a contagem de dígitos de uma CDA — o contrato tipa `cdaId` como string livre.
   * O front valida só "tem número", para não recusar um valor que a API aceitaria. Quem
   * descobrir o formato real deve apertar isto, no espírito da decisão D8.
   */
  test('aceita qualquer sequência de dígitos', () => {
    expect(isCdaValida('20240000111')).toBe(true)
    expect(isCdaValida('1')).toBe(true)
  })

  test('recusa vazio e valor sem dígito', () => {
    expect(isCdaValida('')).toBe(false)
    expect(isCdaValida('   ')).toBe(false)
    expect(isCdaValida('abc')).toBe(false)
  })
})

describe('formatarValorBRL', () => {
  test('formata no padrão do Figma, sem espaço depois do cifrão', () => {
    expect(formatarValorBRL(1534.21)).toBe('R$1.534,21')
    expect(formatarValorBRL(1765.41)).toBe('R$1.765,41')
  })

  test('sempre com duas casas decimais', () => {
    expect(formatarValorBRL(1200)).toBe('R$1.200,00')
    expect(formatarValorBRL(0.5)).toBe('R$0,50')
  })

  /**
   * Zero é um saldo — a CDA quitada existe e vale R$0,00. Ausência é outra coisa, e a tela
   * omite a linha em vez de afirmar que não há dívida (premissa P1).
   */
  test('distingue saldo zero de valor ausente', () => {
    expect(formatarValorBRL(0)).toBe('R$0,00')
    expect(formatarValorBRL(null)).toBeNull()
  })

  test('não deixa NaN chegar à tela', () => {
    expect(formatarValorBRL(Number.NaN)).toBeNull()
    expect(formatarValorBRL(Number.POSITIVE_INFINITY)).toBeNull()
  })
})

describe('inscricaoParaApi', () => {
  /**
   * A razão de existir. O carnê traz 7 dígitos; o cadastro da API guarda 8, com o zero à
   * esquerda (premissa P21, e é o que a decisão D7 exibe). O endpoint de débitos leva a
   * inscrição no path e **não** documenta a normalização que o `/consulta` promete — sem
   * completar aqui, os 7 dígitos digitados não casam com o registro de 8 e a API responde 404.
   */
  test('completa com zero à esquerda até as 8 posições da API', () => {
    expect(inscricaoParaApi('5217663')).toBe('05217663')
    expect(inscricaoParaApi('18')).toBe('00000018')
  })

  test('deixa intacta a inscrição que já tem 8 dígitos', () => {
    expect(inscricaoParaApi('05217663')).toBe('05217663')
    expect(inscricaoParaApi('06666929')).toBe('06666929')
  })

  /** Máscara é exibição, nunca transporte — vale aqui como no resto do módulo. */
  test('descarta a máscara antes de completar', () => {
    expect(inscricaoParaApi('521.766-3')).toBe('05217663')
    expect(inscricaoParaApi('0.521.766-3')).toBe('05217663')
  })

  /**
   * Nada de truncar: um valor longo demais é erro de quem chamou, e cortar dígitos mandaria
   * à API uma inscrição de outro imóvel — pior que um 404 honesto.
   */
  test('não mexe em valor maior que 8 dígitos', () => {
    expect(inscricaoParaApi('123456789')).toBe('123456789')
  })
})
