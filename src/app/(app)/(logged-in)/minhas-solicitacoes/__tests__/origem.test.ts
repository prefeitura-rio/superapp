import { describe, expect, it } from 'vitest'
import {
  minhasSolicitacoesHref,
  origemFromParam,
  resolveOrigemInicial,
} from '../origem'

const AGORA = String(Date.now())
const EXPIRADO = String(Date.now() - 2 * 60 * 60 * 1000)

describe('origemFromParam', () => {
  it.each([
    ['1', 'salesforce'],
    ['0', 'sgrc'],
    [['1', '0'], 'salesforce'],
    ['salesforce', undefined],
    ['sgrc', undefined],
    ['2', undefined],
    ['', undefined],
    [undefined, undefined],
  ])('%j -> %s', (entrada, esperado) => {
    expect(origemFromParam(entrada as string | string[] | undefined)).toBe(
      esperado
    )
  })
})

describe('resolveOrigemInicial', () => {
  it('acesso direto sem chamados no novo 1746 abre o histórico legado (SGRC)', () => {
    expect(resolveOrigemInicial(undefined, undefined)).toBe('sgrc')
    expect(resolveOrigemInicial(undefined, undefined, false)).toBe('sgrc')
  })

  it('acesso direto com ao menos um chamado no novo 1746 abre o Salesforce', () => {
    expect(resolveOrigemInicial(undefined, undefined, true)).toBe('salesforce')
  })

  it('?o=0 explícito vence a regra de ter chamados no Salesforce', () => {
    expect(resolveOrigemInicial('0', undefined, true)).toBe('sgrc')
  })

  it('?o=1 (banner da home) abre o novo 1746', () => {
    expect(resolveOrigemInicial('1', undefined)).toBe('salesforce')
  })

  it('voltando do formulário do 1746, abre o novo 1746', () => {
    expect(resolveOrigemInicial(undefined, AGORA)).toBe('salesforce')
  })

  it('cookie de retorno expirado ou inválido é ignorado', () => {
    expect(resolveOrigemInicial(undefined, EXPIRADO)).toBe('sgrc')
    expect(resolveOrigemInicial(undefined, 'lixo')).toBe('sgrc')
  })

  it('?o= explícito vence o cookie de retorno', () => {
    expect(resolveOrigemInicial('0', AGORA)).toBe('sgrc')
  })

  it('valor inválido de ?o= cai nas outras regras', () => {
    expect(resolveOrigemInicial('xxx', undefined)).toBe('sgrc')
    expect(resolveOrigemInicial('xxx', AGORA)).toBe('salesforce')
  })
})

describe('minhasSolicitacoesHref', () => {
  it('usa o param curto: 1 para o novo 1746, 0 para o legado', () => {
    expect(minhasSolicitacoesHref('salesforce')).toBe(
      '/minhas-solicitacoes?o=1'
    )
    expect(minhasSolicitacoesHref('sgrc')).toBe('/minhas-solicitacoes?o=0')
  })
})
