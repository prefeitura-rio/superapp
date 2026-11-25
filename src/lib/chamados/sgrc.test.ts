import type {
  ModelsPaginatedMaintenanceRequests,
  ModelsPublicMaintenanceRequestResponse,
} from '@/http/models'
import {
  ehProtocoloSgrc,
  mapearDetalheSgrc,
  mapearListaSgrc,
  normalizarProtocoloSgrc,
} from '@/lib/chamados/sgrc'
import { describe, expect, test } from 'vitest'

const CPF = '12345678901'
const PROTOCOLO = 'RIO-48291037-6'

describe('protocolo SGRC', () => {
  test.each([
    ['RIO-48291037-6', 'RIO-48291037-6'],
    [' rio-48291037-6 ', 'RIO-48291037-6'],
  ])('%j é SGRC e normaliza para %s', (valor, esperado) => {
    expect(normalizarProtocoloSgrc(valor)).toBe(esperado)
    expect(ehProtocoloSgrc(valor)).toBe(true)
  })

  test.each([
    'RIO-2026-00000001',
    '99999999',
    'RIO-4829103-6',
    'RIO-48291037-66',
    'RIO-48291037-A',
    '../../health',
    'RIO-48291037-6/../../health',
    '',
  ])('%j não é SGRC', valor => {
    expect(normalizarProtocoloSgrc(valor)).toBeNull()
    expect(ehProtocoloSgrc(valor)).toBe(false)
  })
})

describe('mapearListaSgrc', () => {
  const resposta: ModelsPaginatedMaintenanceRequests = {
    data: [
      {
        id: 'doc-1',
        id_chamado: '17469001',
        cpf: CPF,
        protocolo: PROTOCOLO,
        protocolos: [PROTOCOLO],
        categoria: 'Reclamação',
        tipo: 'Iluminação pública',
        subtipo: 'Lâmpada queimada',
        status: 'Em andamento',
        data_inicio: '2026-09-12T11:20:00Z',
        descricao: 'Poste apagado em frente ao número 180',
        logradouro: 'Rua Voluntários da Pátria',
        numero: '180',
        endereco: 'Rua Voluntários da Pátria, 180',
        bairro: 'Botafogo',
      },
      {
        id: 'doc-2',
        id_chamado: '17469002',
        protocolo: '',
        protocolos: ['00000000', 'RIO-10928374-2'],
        tipo: 'Poda',
        status: 'Fechado com solução',
        data_inicio: 'data inválida',
      },
      { id: 'doc-3', id_chamado: '17469003', protocolos: [] },
    ],
    pagination: { page: 2, per_page: 10, total: 13, total_pages: 2 },
  }

  test('um card por chamado, sem CPF, descrição nem endereço', () => {
    const lista = mapearListaSgrc(resposta, 2)
    const json = JSON.stringify(lista)

    expect(lista.protocolos).toHaveLength(3)
    expect(lista.protocolos[0]).toEqual({
      protocolo: PROTOCOLO,
      status: 'Em andamento',
      dataAbertura: '2026-09-12T11:20:00Z',
      ordens_de_servico: [
        {
          codigoOs: '17469001',
          servico: 'Lâmpada queimada',
          categoria: 'Reclamação',
          status: 'Em andamento',
          dataAbertura: '2026-09-12T11:20:00Z',
          isAcessoInformacao: false,
        },
      ],
    })
    expect(json).not.toContain(CPF)
    expect(json).not.toContain('Poste apagado')
    expect(json).not.toContain('Voluntários')
    expect(json).not.toContain('Botafogo')
  })

  test('usa o primeiro protocolo consultável e descarta data inválida', () => {
    const [, segundo, terceiro] = mapearListaSgrc(resposta, 2).protocolos

    expect(segundo?.protocolo).toBe('RIO-10928374-2')
    expect(segundo?.ordens_de_servico[0]?.servico).toBe('Poda')
    expect(segundo?.dataAbertura).toBeUndefined()
    expect(terceiro?.protocolo).toBe('')
    expect(terceiro?.ordens_de_servico[0]?.servico).toBe('—')
  })

  test('repassa a paginação do RMI', () => {
    expect(mapearListaSgrc(resposta, 2).pagination).toEqual({
      page: 2,
      perPage: 10,
      total: 13,
      totalPages: 2,
    })
  })

  test('resposta vazia (data null do Go) vira lista vazia', () => {
    expect(mapearListaSgrc({ data: undefined }, 1)).toEqual({
      protocolos: [],
      pagination: { page: 1, perPage: 10, total: 0, totalPages: 1 },
    })
  })
})

describe('mapearDetalheSgrc', () => {
  const resposta: ModelsPublicMaintenanceRequestResponse = {
    protocolo: PROTOCOLO,
    chamados: [
      {
        id_chamado: '17469002',
        protocolos: [PROTOCOLO],
        categoria: 'Solicitação',
        tipo: 'Conservação',
        subtipo: 'Poda de árvore',
        status: 'Aberto',
        data_inicio: '2026-10-02T09:05:00Z',
        bairro: 'Botafogo',
        loaded_at: '2026-10-30T14:00:00Z',
        titular: false,
        andamentos: [],
      },
      {
        id_chamado: '17469001',
        protocolos: [PROTOCOLO],
        categoria: 'Reclamação',
        tipo: 'Iluminação pública',
        subtipo: 'Lâmpada queimada',
        status: 'Em andamento',
        nome_unidade_organizacional: 'RIOLUZ',
        data_inicio: '2026-09-12T11:20:00Z',
        data_alvo_finalizacao: '2026-11-12T23:59:00Z',
        descricao: 'Poste apagado em frente ao número 180',
        logradouro: 'Rua Voluntários da Pátria',
        bairro: 'Botafogo',
        loaded_at: '2026-10-29T14:00:00Z',
        titular: true,
        andamentos: [
          {
            data: '2026-10-28T15:40:00Z',
            tipo: 'Em atendimento',
            descricao: 'Reparo programado.',
          },
          {
            data: '2026-09-12T11:20:00Z',
            tipo: 'Solicitação recebida',
            descricao: 'Chamado registrado.',
          },
        ],
      },
    ],
  }

  test('o titular vê só os próprios chamados, com rua, descrição e andamentos', () => {
    const detalhe = mapearDetalheSgrc(PROTOCOLO, resposta, 'dono')

    expect(detalhe?.ordens_de_servico.map(os => os.codigoOs)).toEqual([
      '17469001',
    ])
    const ordem = detalhe?.ordens_de_servico[0]
    expect(ordem?.descricao).toContain('Poste apagado')
    expect(ordem?.endereco).toEqual({
      logradouro: 'Rua Voluntários da Pátria',
      bairro: 'Botafogo',
    })
    expect(ordem?.orgaoResponsavel).toEqual({ nome: 'RIOLUZ' })
    expect(ordem?.previsaoSLA).toBe('2026-11-12T23:59:00Z')
    expect(ordem?.andamentos?.map(item => item.evento)).toEqual([
      'Solicitação recebida',
      'Em atendimento',
    ])
    expect(detalhe?.loaded_at).toBe('2026-10-29T14:00:00Z')
  })

  test('sem nenhum chamado do titular, o detalhe do dono não abre', () => {
    const deTerceiro = {
      chamados: resposta.chamados?.map(chamado => ({
        ...chamado,
        titular: false,
      })),
    }

    expect(mapearDetalheSgrc(PROTOCOLO, deTerceiro, 'dono')).toBeNull()
  })

  test('a consulta pública mostra todos os chamados, só com bairro e último andamento', () => {
    const detalhe = mapearDetalheSgrc(PROTOCOLO, resposta, 'publico')
    const json = JSON.stringify(detalhe)

    expect(detalhe?.protocolo).toBe(PROTOCOLO)
    expect(detalhe?.dataAbertura).toBe('2026-09-12T11:20:00Z')
    expect(detalhe?.ordens_de_servico.map(os => os.codigoOs)).toEqual([
      '17469002',
      '17469001',
    ])
    const lampada = detalhe?.ordens_de_servico[1]
    expect(lampada?.endereco).toEqual({ bairro: 'Botafogo' })
    expect(lampada?.descricao).toBeUndefined()
    expect(lampada?.andamentos).toBeUndefined()
    expect(lampada?.ultimoAndamento?.evento).toBe('Em atendimento')
    expect(json).not.toContain('Voluntários')
    expect(json).not.toContain('Poste apagado')
  })

  test('andamento do 1746 sem tipo usa a descrição como título', () => {
    const detalhe = mapearDetalheSgrc(
      'RIO-31555943-2',
      {
        protocolo: 'RIO-31555943-2',
        chamados: [
          {
            id_chamado: '22597893',
            protocolos: ['RIO-31555943-2'],
            subtipo: 'Remoção de entulho',
            status: 'Fechado com solução',
            data_inicio: '2025-11-04T18:29:19Z',
            titular: true,
            andamentos: [
              {
                data: '2025-11-06T12:09:10Z',
                descricao: 'EM ANDAMENTO',
              },
              {
                data: '2025-11-04T18:29:24Z',
                descricao:
                  'Chamado aberto na COMLURB em 2025-11-04 18:29:24. Na Central 1746  em 2025-11-04 18:29:19',
              },
              {
                data: '2025-11-28T19:50:11Z',
                descricao:
                  'Prezado (a), a remoção foi realizada. A Comlurb agradece seu contato. PROPRIO',
              },
            ],
          },
        ],
      },
      'dono'
    )

    expect(detalhe?.ordens_de_servico[0]?.andamentos).toEqual([
      {
        evento:
          'Chamado aberto na COMLURB em 2025-11-04 18:29:24. Na Central 1746  em 2025-11-04 18:29:19',
        dataInsercao: '2025-11-04T18:29:24Z',
        descricao: '',
      },
      {
        evento: 'EM ANDAMENTO',
        dataInsercao: '2025-11-06T12:09:10Z',
        descricao: '',
      },
      {
        evento:
          'Prezado (a), a remoção foi realizada. A Comlurb agradece seu contato. PROPRIO',
        dataInsercao: '2025-11-28T19:50:11Z',
        descricao: '',
      },
    ])
  })

  test('resposta sem chamados não monta detalhe', () => {
    expect(
      mapearDetalheSgrc(PROTOCOLO, { chamados: undefined }, 'publico')
    ).toBeNull()
    expect(mapearDetalheSgrc(PROTOCOLO, null, 'publico')).toBeNull()
  })
})
