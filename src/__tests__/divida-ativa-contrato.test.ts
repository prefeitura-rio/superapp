import {
  getImoveis,
  getImoveisInscricaoConsulta,
  postImoveis,
} from '@/http-divida-ativa/imoveis/imoveis'
import {
  mapApiToImovel,
  normalizarListaImoveis,
} from '@/lib/divida-ativa-mappers'
import { describe, expect, test } from 'vitest'

/**
 * Teste de fiação do módulo.
 *
 * Não valida regra de negócio — valida que a pilha inteira está ligada: client gerado pelo
 * Orval → mutator (`custom-fetch-divida-ativa.ts`) → rede (MSW, com os handlers default) →
 * mappers → tipos de visão. Ele fala apenas a linguagem do produto (`inscricao`,
 * `endereco`), nunca a do payload.
 *
 * Este teste já se pagou: foi ele que acusou a troca do contrato provisório pelo real em
 * 17/08/2026. Cobre hoje só os endpoints de "Meus Imóveis" — a Fase 3 não tem fiação porque
 * a API não liga schema de resposta às operações de dívida ativa.
 */

/**
 * O client gerado devolve uma união discriminada por status (`{ data, status }` por código
 * de resposta), então `data` só é acessível depois de estreitar. O DAL e as Server Actions
 * fazem o mesmo — é assim que o erro da API entra no fluxo de forma tipada, em vez de `any`.
 */
function assertStatus<T extends { status: number }, S extends number>(
  response: T,
  status: S
): Extract<T, { status: S }> {
  expect(response.status).toBe(status)
  return response as Extract<T, { status: S }>
}

describe('Dívida Ativa — fiação do contrato real', () => {
  test('lista de imóveis atravessa client, mutator e mapper', async () => {
    const { data } = assertStatus(await getImoveis(), 200)

    const imoveis = normalizarListaImoveis(data).map(mapApiToImovel)

    expect(imoveis).toHaveLength(1)
    expect(imoveis[0].id).toBe(32)
    expect(imoveis[0].inscricao).toBe('00000018')
    expect(imoveis[0].endereco).toBe('RUA SANTO AFONSO, 216 / LOJA A - TIJUCA')
    // LocalDateTime sem fuso vira data ISO simples no tipo de visão (premissa P3).
    expect(imoveis[0].cadastradoEm).toBe('2026-06-22')
  })

  /**
   * A trava que protege contra a regressão mais provável desta integração. `GET /imoveis`
   * devolve array cru, mas o spec do Quarkus tipa objeto singular — antes da troca o DAL
   * fazia `result.data?.data` e devolveria lista vazia **em silêncio**, mostrando "nenhum
   * imóvel cadastrado" a quem tem imóvel. Se alguém reintroduzir o acesso ao envelope,
   * este teste cai.
   */
  test('a lista não vem vazia quando a API devolve array cru', async () => {
    const { data } = assertStatus(await getImoveis(), 200)

    expect(normalizarListaImoveis(data)).not.toHaveLength(0)
  })

  test('o cadastro devolve o imóvel com o endereço vindo da Fazenda', async () => {
    const { data } = assertStatus(
      await postImoveis({ numInscricao: '00000018' }),
      201
    )

    const imovel = mapApiToImovel(data)

    expect(imovel.inscricao).toBe('00000018')
    expect(imovel.endereco).toBe('RUA SANTO AFONSO, 216 / LOJA A - TIJUCA')
  })

  test('a consulta de um imóvel cadastrado atravessa a pilha', async () => {
    const { data } = assertStatus(
      await getImoveisInscricaoConsulta('00000018'),
      200
    )

    expect(data.imovel).toBeDefined()
    expect(mapApiToImovel(data.imovel ?? {}).inscricao).toBe('00000018')
  })

  /**
   * Premissas em aberto, travadas como ausência deliberada: se um destes campos passar a
   * vir preenchido, é porque a API mudou e a premissa correspondente precisa ser
   * reconciliada — não porque o mapper está errado.
   */
  test('proprietário, bairro e indicador de débito seguem ausentes', async () => {
    const { data } = assertStatus(await getImoveis(), 200)

    const imovel = normalizarListaImoveis(data).map(mapApiToImovel)[0]

    expect(imovel.proprietario).toBeNull()
    expect(imovel.bairro).toBeNull()
    expect(imovel.possuiDebitos).toBeNull()
  })
})
