import {
  mapApiToRequerimento,
  mensagemDaListaDeRequerimentos,
  normalizarListaRequerimentos,
} from '@/lib/divida-ativa-mappers'
import { formatarDataCurta, formatarProtocolo } from '@/lib/divida-ativa-utils'
import { describe, expect, test } from 'vitest'

describe('formatarDataCurta', () => {
  test('escreve a data como no Figma: dia, mês abreviado em caixa alta e ano', () => {
    expect(formatarDataCurta('2020-03-13')).toBe('13 MAR 2020')
    expect(formatarDataCurta('2026-12-01')).toBe('01 DEZ 2026')
  })

  test('devolve null para ausente ou fora do ISO', () => {
    expect(formatarDataCurta(null)).toBeNull()
    expect(formatarDataCurta('13/03/2020')).toBeNull()
    expect(formatarDataCurta('2020-13-01')).toBeNull()
  })
})

describe('formatarProtocolo', () => {
  test('completa o número com zeros e junta o ano', () => {
    expect(formatarProtocolo('146679', '2026')).toBe('000146679/2026')
    expect(formatarProtocolo('000146679', '2026')).toBe('000146679/2026')
  })

  test('sem ano sai só o número', () => {
    expect(formatarProtocolo('1', null)).toBe('000000001')
  })
})

describe('mapApiToRequerimento', () => {
  const api = {
    numProtocoloRequerimentoParcelamento: '000146679',
    anoRequerimento: '2020',
    dataSolicitacao: '13/03/2020',
    datPrevisaoEntrega: '29/06/2020',
    datResposta: '15/06/2020',
    situacaoId: '3',
    descricaoSituacao: 'Rejeitado por documentação',
    nomeContribuinte: 'MAC Laren Estaleiros e Serviços Marítimos SA',
    txtMotivoRejeicao:
      'Foi criado só para testar se o serviços funciona corretamente',
    requerimentoGuiaPagamentoId: '',
    urlComprovante: 'https://dam.example/comprovante.pdf',
  }

  test('traduz o requerimento da API para o tipo de visão, com datas ISO', () => {
    expect(mapApiToRequerimento(api)).toEqual({
      protocolo: '000146679',
      ano: '2020',
      contribuinte: 'MAC Laren Estaleiros e Serviços Marítimos SA',
      abertoEm: '2020-03-13',
      previsaoRetornoEm: '2020-06-29',
      respondidoEm: '2020-06-15',
      situacaoId: '3',
      situacao: 'Rejeitado por documentação',
      motivoRejeicao:
        'Foi criado só para testar se o serviços funciona corretamente',
      guiaPagamentoId: null,
      urlComprovante: 'https://dam.example/comprovante.pdf',
    })
  })

  test('aceita o protocolo como número, como o DAM às vezes manda', () => {
    const requerimento = mapApiToRequerimento({
      ...api,
      numProtocoloRequerimentoParcelamento: 146679 as unknown as string,
    })
    expect(requerimento?.protocolo).toBe('146679')
  })

  /**
   * O item só com `mensagemErro` é como a API diz "não há": não é requerimento, e virar
   * card vazio na tela seria pior que sumir.
   */
  test('devolve null para o item que só carrega a mensagem da API', () => {
    expect(
      mapApiToRequerimento({
        mensagemErro: 'Não existem pedidos de requerimento para o CPF logado.',
      })
    ).toBeNull()
  })
})

describe('normalizarListaRequerimentos', () => {
  test('aceita array cru, objeto único e envelope', () => {
    const item = { numProtocoloRequerimentoParcelamento: '1' }
    expect(normalizarListaRequerimentos([item])).toEqual([item])
    expect(normalizarListaRequerimentos(item)).toEqual([item])
    expect(normalizarListaRequerimentos({ data: [item] })).toEqual([item])
    expect(normalizarListaRequerimentos(null)).toEqual([])
  })
})

describe('mensagemDaListaDeRequerimentos', () => {
  test('pega a primeira mensagem da API, ou null quando a lista está limpa', () => {
    expect(
      mensagemDaListaDeRequerimentos([
        {},
        { mensagemErro: 'Requerimento nao encontrado.' },
      ])
    ).toBe('Requerimento nao encontrado.')
    expect(mensagemDaListaDeRequerimentos([])).toBeNull()
  })
})
