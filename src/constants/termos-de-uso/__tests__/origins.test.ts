import { describe, expect, it } from 'vitest'
import {
  TERMOS_DE_USO_ORIGINS,
  buildTermosDeUsoHrefFrom,
  parseTermosDeUsoOrigin,
} from '../origins'

describe('origens dos Termos de uso', () => {
  it('o currículo volta para Meu Currículo', () => {
    expect(TERMOS_DE_USO_ORIGINS.curriculo).toEqual({
      href: '/servicos/trabalho/curriculo',
      label: 'Voltar para o currículo',
    })
  })

  it('monta o link do detalhe marcando a origem', () => {
    expect(buildTermosDeUsoHrefFrom('empregos', 'curriculo')).toBe(
      '/termos-de-uso/empregos?origem=curriculo'
    )
  })

  it.each([
    ['curriculo', 'curriculo'],
    [['curriculo', 'outra'], 'curriculo'],
    ['desconhecida', undefined],
    ['toString', undefined],
    ['', undefined],
    [undefined, undefined],
  ])('lê origem=%j como %s', (value, expected) => {
    expect(parseTermosDeUsoOrigin(value)).toBe(expected)
  })
})
