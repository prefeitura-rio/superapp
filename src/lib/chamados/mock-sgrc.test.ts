import {
  CPF_DONO_SGRC,
  CPF_TERCEIRO_SGRC,
  PROTOCOLO_DONO_SGRC,
  PROTOCOLO_TERCEIRO_SGRC,
  detalheSgrcMock,
  listarSgrcMock,
} from '@/lib/chamados/mock-sgrc'
import { describe, expect, test } from 'vitest'

describe('mock do legado SGRC', () => {
  test('a lista é do dono, mais recente primeiro, sem CPF e sem rua', () => {
    const lista = listarSgrcMock()
    const json = JSON.stringify(lista)

    expect(lista.protocolos.map(item => item.protocolo)).toEqual([
      PROTOCOLO_DONO_SGRC,
      'RIO-10928374-2',
    ])
    expect(
      lista.protocolos[0]?.ordens_de_servico.map(os => os.codigoOs)
    ).toEqual(['17469002', '17469001'])
    expect(json).not.toContain(CPF_DONO_SGRC)
    expect(json).not.toContain('Rua Voluntários da Pátria')
    expect(json).not.toContain(PROTOCOLO_TERCEIRO_SGRC)
    expect(lista.protocolos[0]?.ordens_de_servico[0]?.isAcessoInformacao).toBe(
      false
    )
  })

  test('o dono vê rua, descrição e só andamento público', () => {
    const detalhe = detalheSgrcMock(PROTOCOLO_DONO_SGRC, 'dono')
    const json = JSON.stringify(detalhe)
    const lampada = detalhe?.ordens_de_servico.find(
      ordem => ordem.codigoOs === '17469001'
    )

    expect(lampada?.descricao).toContain('Poste apagado')
    expect(lampada?.endereco?.logradouro).toBe('Rua Voluntários da Pátria')
    expect(lampada?.andamentos?.map(item => item.evento)).toEqual([
      'Solicitação recebida',
      'Em atendimento',
    ])
    expect(json).not.toContain('Nota interna')
    expect(json).not.toContain(CPF_DONO_SGRC)
    expect(detalhe?.loaded_at).toBe('2026-10-30T14:00:00.000Z')
  })

  test('protocolo de terceiro no detalhe do dono não abre', () => {
    expect(detalheSgrcMock(PROTOCOLO_TERCEIRO_SGRC, 'dono')).toBeNull()
  })

  test('a consulta pública fica só com o bairro e o último andamento', () => {
    const detalhe = detalheSgrcMock(PROTOCOLO_TERCEIRO_SGRC, 'publico')
    const json = JSON.stringify(detalhe)
    const ordem = detalhe?.ordens_de_servico[0]

    expect(ordem?.endereco).toEqual({ bairro: 'Laranjeiras' })
    expect(ordem?.descricao).toBeUndefined()
    expect(ordem?.ultimoAndamento?.descricao).toContain(
      'vazamento foi localizado'
    )
    expect(json).not.toContain(CPF_TERCEIRO_SGRC)
    expect(json).not.toContain('Rua das Laranjeiras')
    expect(json).not.toContain('Vazamento de água')
  })
})
