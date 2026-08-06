import { getRequerimentos } from '@/http-divida-ativa/acompanhamento/acompanhamento'
import { getDebitosImovel } from '@/http-divida-ativa/debitos/debitos'
import { getImoveis } from '@/http-divida-ativa/imoveis/imoveis'
import { postSimulacaoParcelamento } from '@/http-divida-ativa/simulacao/simulacao'
import {
  mapApiToImovel,
  mapApiToListaDebitos,
  mapApiToRequerimento,
  mapApiToSimulacao,
} from '@/lib/divida-ativa-mappers'
import { describe, expect, test } from 'vitest'

/**
 * Teste de fiação da Fase 0.
 *
 * Não valida regra de negócio — valida que a pilha inteira da fundação está ligada:
 * client gerado pelo Orval → mutator (`custom-fetch-divida-ativa.ts`) → rede (MSW, com os
 * handlers default) → mappers → tipos de visão.
 *
 * O valor dele é a fase de integração: quando o contrato provisório for trocado pelo oficial,
 * este é o teste que acusa se a pilha parou de se encaixar, sem depender de nenhuma tela
 * existir. Ele fala apenas a linguagem do produto (`inscricao`, `situacao`), nunca a do payload.
 */

/**
 * O client gerado devolve uma união discriminada por status (`{ data, status }` por código
 * de resposta), então `data` só é acessível depois de estreitar. O DAL e as Server Actions da
 * Fase 1 vão precisar fazer o mesmo — é assim que o erro da API entra no fluxo de forma
 * tipada, em vez de virar `any`.
 */
function assertStatus<T extends { status: number }, S extends number>(
  response: T,
  status: S
): Extract<T, { status: S }> {
  expect(response.status).toBe(status)
  return response as Extract<T, { status: S }>
}

describe('Dívida Ativa — fiação do contrato provisório', () => {
  test('lista de imóveis atravessa client, mutator e mapper', async () => {
    const { data } = assertStatus(await getImoveis(), 200)

    const imoveis = (data.data ?? []).map(mapApiToImovel)

    expect(imoveis).toHaveLength(1)
    expect(imoveis[0].inscricao).toBe('01234567890')
    expect(imoveis[0].bairro).toBe('Centro')
    expect(imoveis[0].possuiDebitos).toBe(true)
    // date-time da API vira data ISO simples no tipo de visão (premissa P3)
    expect(imoveis[0].cadastradoEm).toBe('2026-08-04')
  })

  test('débitos do imóvel atravessam a pilha com valores numéricos utilizáveis', async () => {
    const { data } = assertStatus(await getDebitosImovel('01234567890'), 200)

    const lista = mapApiToListaDebitos(data)

    expect(lista.valorTotalAtualizado).toBe(1890.72)
    expect(lista.debitos).toHaveLength(1)
    expect(lista.debitos[0].situacao).toBe('em_aberto')
    expect(lista.debitos[0].parcelavel).toBe(true)
    expect(lista.debitos[0].vencimento).toBe('2023-03-10')
    // Nenhum valor monetário pode chegar à tela como NaN
    expect(lista.debitos[0].valorAtualizado).not.toBeNaN()
  })

  test('simulação atravessa a pilha com as condições de parcelamento', async () => {
    const { data } = assertStatus(
      await postSimulacaoParcelamento({
        inscricaoImobiliaria: '01234567890',
        numerosCda: ['2023/0012345-6'],
      }),
      200
    )

    const simulacao = mapApiToSimulacao(data)

    expect(simulacao.inscricao).toBe('01234567890')
    expect(simulacao.condicoes).toHaveLength(1)
    expect(simulacao.condicoes[0].quantidadeParcelas).toBe(12)
    expect(simulacao.condicoes[0].valorParcela).toBe(145.89)
  })

  test('requerimentos atravessam a pilha com a situação traduzida', async () => {
    const { data } = assertStatus(await getRequerimentos(), 200)

    const requerimentos = (data.data ?? []).map(mapApiToRequerimento)

    expect(requerimentos).toHaveLength(1)
    expect(requerimentos[0].protocolo).toBe('2026000123456')
    expect(requerimentos[0].situacao).toBe('em_analise')
    expect(requerimentos[0].motivoIndeferimento).toBeNull()
  })
})
