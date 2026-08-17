import {
  mapApiToDebito,
  mapApiToImovel,
  mapApiToListaDebitos,
  mapApiToRequerimento,
  mapApiToSimulacao,
  parseDataApi,
  parseValorMonetario,
} from '@/lib/divida-ativa-mappers'
import { describe, expect, test } from 'vitest'

describe('parseValorMonetario', () => {
  test('mantém um número devolvido pela API', () => {
    expect(parseValorMonetario(1890.72)).toBe(1890.72)
  })

  test('converte string no formato pt-BR com milhar e decimal', () => {
    expect(parseValorMonetario('1.234,56')).toBe(1234.56)
  })

  test('converte string no formato decimal com ponto', () => {
    expect(parseValorMonetario('1234.56')).toBe(1234.56)
  })

  test('converte string com símbolo de moeda', () => {
    expect(parseValorMonetario('R$ 1.234,56')).toBe(1234.56)
  })

  test('devolve null para ausente', () => {
    expect(parseValorMonetario(undefined)).toBeNull()
  })

  test('devolve null para valor não numérico', () => {
    expect(parseValorMonetario('indisponível')).toBeNull()
  })

  test('preserva o zero em vez de tratá-lo como ausente', () => {
    expect(parseValorMonetario(0)).toBe(0)
  })
})

describe('parseDataApi', () => {
  test('mantém uma data ISO', () => {
    expect(parseDataApi('2023-03-10')).toBe('2023-03-10')
  })

  test('converte data no formato brasileiro para ISO', () => {
    expect(parseDataApi('10/03/2023')).toBe('2023-03-10')
  })

  test('reduz um date-time ISO para a data', () => {
    expect(parseDataApi('2026-08-04T13:45:00-03:00')).toBe('2026-08-04')
  })

  test('devolve null para ausente', () => {
    expect(parseDataApi(undefined)).toBeNull()
  })

  test('devolve null para data inválida', () => {
    expect(parseDataApi('31/02/abc')).toBeNull()
  })
})

describe('mapApiToImovel', () => {
  test('normaliza a inscrição imobiliária removendo formatação', () => {
    const imovel = mapApiToImovel({ inscricaoImobiliaria: '0.123.456-7' })

    expect(imovel.inscricao).toBe('01234567')
  })

  test('mapeia os campos de exibição', () => {
    const imovel = mapApiToImovel({
      inscricaoImobiliaria: '05217663',
      endereco: 'Rua Barata Ribeiro, 586 - A 501',
      bairro: 'Copacabana',
      proprietario: 'Bruno Rocha Menezes',
      possuiDebitos: true,
      cadastradoEm: '2026-08-04T13:45:00-03:00',
    })

    expect(imovel).toEqual({
      inscricao: '05217663',
      endereco: 'Rua Barata Ribeiro, 586 - A 501',
      bairro: 'Copacabana',
      proprietario: 'Bruno Rocha Menezes',
      possuiDebitos: true,
      cadastradoEm: '2026-08-04',
    })
  })

  test('campos opcionais ausentes viram null sem quebrar', () => {
    const imovel = mapApiToImovel({ inscricaoImobiliaria: '01234567890' })

    expect(imovel.endereco).toBeNull()
    expect(imovel.bairro).toBeNull()
    expect(imovel.proprietario).toBeNull()
    expect(imovel.cadastradoEm).toBeNull()
  })

  test('assume que não há débitos quando a API omite a informação', () => {
    const imovel = mapApiToImovel({ inscricaoImobiliaria: '01234567890' })

    expect(imovel.possuiDebitos).toBe(false)
  })
})

describe('mapApiToDebito', () => {
  test('mapeia uma CDA completa para o tipo de visão', () => {
    const debito = mapApiToDebito({
      numeroCda: '2023/0012345-6',
      exercicio: 2023,
      tributo: 'IPTU',
      situacao: 'EM_ABERTO',
      parcelavel: true,
      dataVencimento: '2023-03-10',
      valorPrincipal: 1250.35,
      valorAtualizado: 1890.72,
      dataReferenciaValor: '2026-08-04',
    })

    expect(debito).toEqual({
      numeroCda: '2023/0012345-6',
      exercicio: 2023,
      tributo: 'IPTU',
      situacao: 'em_aberto',
      parcelavel: true,
      vencimento: '2023-03-10',
      valorPrincipal: 1250.35,
      valorAtualizado: 1890.72,
      valorReferenciaEm: '2026-08-04',
    })
  })

  test('traduz cada situação conhecida da API', () => {
    const situacoes = [
      ['EM_ABERTO', 'em_aberto'],
      ['AJUIZADA', 'ajuizada'],
      ['PARCELADA', 'parcelada'],
      ['QUITADA', 'quitada'],
      ['SUSPENSA', 'suspensa'],
      ['CANCELADA', 'cancelada'],
    ] as const

    for (const [api, esperado] of situacoes) {
      expect(mapApiToDebito({ numeroCda: 'x', situacao: api }).situacao).toBe(
        esperado
      )
    }
  })

  test('situação desconhecida cai em fallback em vez de vazar o valor cru', () => {
    const debito = mapApiToDebito({
      numeroCda: '2023/0012345-6',
      situacao: 'INSCRITA_EM_2A_INSTANCIA' as never,
    })

    expect(debito.situacao).toBe('desconhecida')
  })

  test('situação ausente cai em fallback', () => {
    expect(mapApiToDebito({ numeroCda: 'x' }).situacao).toBe('desconhecida')
  })

  test('não oferece parcelamento quando a API omite a elegibilidade', () => {
    expect(mapApiToDebito({ numeroCda: 'x' }).parcelavel).toBe(false)
  })

  test('aceita valores monetários em string, como o legado pode devolver', () => {
    const debito = mapApiToDebito({
      numeroCda: 'x',
      valorAtualizado: '1.890,72' as never,
    })

    expect(debito.valorAtualizado).toBe(1890.72)
  })
})

describe('mapApiToListaDebitos', () => {
  test('mapeia a lista e o total devolvidos pela API', () => {
    const lista = mapApiToListaDebitos({
      data: [{ numeroCda: 'a' }, { numeroCda: 'b' }],
      valorTotalAtualizado: 3781.44,
    })

    expect(lista.debitos).toHaveLength(2)
    expect(lista.valorTotalAtualizado).toBe(3781.44)
  })

  test('resposta sem dados vira lista vazia em vez de undefined', () => {
    const lista = mapApiToListaDebitos({})

    expect(lista.debitos).toEqual([])
    expect(lista.valorTotalAtualizado).toBeNull()
  })
})

describe('mapApiToSimulacao', () => {
  test('mapeia as condições de parcelamento', () => {
    const simulacao = mapApiToSimulacao({
      inscricaoImobiliaria: '01234567890',
      validaAte: '2026-08-04T23:59:59-03:00',
      condicoes: [
        {
          quantidadeParcelas: 12,
          valorEntrada: 300,
          valorParcela: 145.89,
          valorTotal: 2050.68,
          percentualDesconto: 0,
          vencimentoPrimeiraParcela: '2026-09-10',
        },
      ],
    })

    expect(simulacao.inscricao).toBe('01234567890')
    expect(simulacao.condicoes).toHaveLength(1)
    expect(simulacao.condicoes[0].quantidadeParcelas).toBe(12)
    expect(simulacao.condicoes[0].valorParcela).toBe(145.89)
    expect(simulacao.condicoes[0].percentualDesconto).toBe(0)
  })

  test('simulação sem condições vira lista vazia', () => {
    expect(mapApiToSimulacao({}).condicoes).toEqual([])
  })
})

describe('mapApiToRequerimento', () => {
  test('mapeia um requerimento completo', () => {
    const requerimento = mapApiToRequerimento({
      protocolo: '2026000123456',
      situacao: 'EM_ANALISE',
      inscricaoImobiliaria: '01234567890',
      quantidadeParcelas: 12,
      valorTotal: 2050.68,
      abertoEm: '2026-08-04T13:45:00-03:00',
      atualizadoEm: '2026-08-05T09:12:00-03:00',
    })

    expect(requerimento).toEqual({
      protocolo: '2026000123456',
      situacao: 'em_analise',
      inscricao: '01234567890',
      quantidadeParcelas: 12,
      valorTotal: 2050.68,
      abertoEm: '2026-08-04',
      atualizadoEm: '2026-08-05',
      motivoIndeferimento: null,
    })
  })

  test('traduz cada situação conhecida de requerimento', () => {
    const situacoes = [
      ['EM_ANALISE', 'em_analise'],
      ['AGUARDANDO_DOCUMENTACAO', 'aguardando_documentacao'],
      ['DEFERIDO', 'deferido'],
      ['INDEFERIDO', 'indeferido'],
      ['CANCELADO', 'cancelado'],
    ] as const

    for (const [api, esperado] of situacoes) {
      expect(
        mapApiToRequerimento({ protocolo: 'x', situacao: api }).situacao
      ).toBe(esperado)
    }
  })

  test('situação desconhecida cai em fallback', () => {
    const requerimento = mapApiToRequerimento({
      protocolo: 'x',
      situacao: 'EM_EXIGENCIA' as never,
    })

    expect(requerimento.situacao).toBe('desconhecida')
  })

  test('preserva o motivo de indeferimento devolvido pela API', () => {
    const requerimento = mapApiToRequerimento({
      protocolo: 'x',
      situacao: 'INDEFERIDO',
      motivoIndeferimento: 'Documentação incompleta.',
    })

    expect(requerimento.motivoIndeferimento).toBe('Documentação incompleta.')
  })
})
