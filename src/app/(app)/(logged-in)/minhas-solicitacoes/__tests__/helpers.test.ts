import { describe, expect, it } from 'vitest'
import { formatDate, normalizeStatus } from '../helpers'

describe('normalizeStatus', () => {
  it.each([
    // Salesforce
    ['Novo', 'Aberto'],
    ['Aberto', 'Aberto'],
    ['Em andamento', 'Em andamento'],
    ['Em Espera', 'Em andamento'],
    ['Concluído', 'Concluído'],
    ['Concluido', 'Concluído'],
    ['Fechado', 'Concluído'],
    ['Cancelado', 'Cancelado'],
    // SGRC (1746 legado)
    ['Pendente', 'Em andamento'],
    ['Em Andamento Privado', 'Em andamento'],
    ['Encaminhado à Comlurb - Resíduo', 'Em andamento'],
    ['Fechado com solução', 'Concluído'],
    ['Fechado com informação', 'Concluído'],
    ['Fechado com providências - Público', 'Concluído'],
    ['Fechado de ofício - Integração', 'Concluído'],
    ['Fechado sem solução', 'Cancelado'],
    ['Não constatado', 'Cancelado'],
    ['Recusado', 'Cancelado'],
    ['Sem possibilidade de atendimento', 'Cancelado'],
    ['  ABERTO ', 'Aberto'],
  ])('%j → %s', (raw, esperado) => {
    expect(normalizeStatus(raw)).toBe(esperado)
  })

  it.each([undefined, null, '', 'status desconhecido'])(
    '%j cai em Aberto',
    raw => {
      expect(normalizeStatus(raw)).toBe('Aberto')
    }
  )
})

describe('formatDate', () => {
  it.each([undefined, null, '', 'data inválida'])('%j vira —', valor => {
    expect(formatDate(valor)).toBe('—')
  })
})
