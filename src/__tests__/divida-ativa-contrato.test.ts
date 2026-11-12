import { getImoveisInscricaoDividaAtiva } from '@/http-divida-ativa/divida-ativa/divida-ativa'
import {
  getImoveis,
  getImoveisInscricaoCadastro,
  getImoveisInscricaoConsulta,
  postImoveis,
} from '@/http-divida-ativa/imoveis/imoveis'
import {
  mapApiToDebito,
  mapApiToGuiaParcelada,
  mapApiToImovel,
  mapFazendaToImovel,
  normalizarConsultaFazenda,
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
 * 17/08/2026. Cobria só os endpoints de "Meus Imóveis" enquanto a API não ligava schema de
 * resposta às operações de dívida ativa — isso mudou em 21/09/2026, e a fiação da Fase 3
 * está no segundo bloco deste arquivo.
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
    expect(imoveis[0].endereco).toBe('RUA EXEMPLO, 123 / LOJA A - BAIRRO')
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
    expect(imovel.endereco).toBe('RUA EXEMPLO, 123 / LOJA A - BAIRRO')
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
  /**
   * A fiação que resolveu a premissa P20. Antes deste endpoint não havia como mostrar o
   * endereço **antes** de cadastrar, e a tela de confirmação caía sempre no "não
   * encontrado" para imóvel novo. Se este teste cair, a tela de confirmação voltou a ficar
   * sem fonte de dados.
   */
  test('a consulta prévia à Fazenda atravessa a pilha sem cadastrar', async () => {
    const { data } = assertStatus(
      await getImoveisInscricaoCadastro('00000018'),
      200
    )

    const imovel = mapFazendaToImovel(normalizarConsultaFazenda(data) ?? {})

    expect(imovel.inscricao).toBe('00000018')
    expect(imovel.endereco).toBe('RUA EXEMPLO, 123 / LOJA A - BAIRRO')
    // O que separa esta consulta do cadastro: nada foi gravado, então não há id local.
    expect(imovel.id).toBeNull()
  })
})

/**
 * Fiação da Fase 3.
 *
 * Só passou a ser possível em 21/09/2026: até então os 24 endpoints de dívida ativa não
 * declaravam schema de resposta, então o Orval gerava `data: void` e não havia o que
 * atravessar. As anotações `@APIResponse` entraram na `dam-api` e o client foi regerado.
 *
 * O valor deste bloco é o mesmo do de cima: ele fala a linguagem do produto, nunca a do
 * payload. Se a API trocar `valorSaldoPrincipal` de lugar, é aqui que se descobre — não na
 * tela.
 */
describe('Dívida Ativa — fiação da consulta de débitos', () => {
  test('a consulta de débitos atravessa client, mutator e mappers', async () => {
    const { data } = assertStatus(
      await getImoveisInscricaoDividaAtiva('00000018'),
      200
    )

    const cdas = (data.cdas ?? []).map(mapApiToDebito)
    const guias = (data.guiasParceladas ?? []).map(mapApiToGuiaParcelada)

    expect(data.imovelCadastrado).toBe(true)
    expect(cdas).not.toHaveLength(0)
    expect(cdas[0].numeroCda).toBeTruthy()
    expect(guias[0].numeroGuia).toBeTruthy()
  })

  /**
   * A premissa P1 em forma de teste. Todos os valores monetários trafegam como string e
   * nunca foram vistos preenchidos em homologação — o imóvel de teste não tem CDA em
   * aberto. O que este teste garante é que, seja qual for a convenção, o que chega à tela
   * é número ou `null`, nunca `NaN` nem a string crua.
   */
  test('os valores monetários chegam à tela como número ou null', async () => {
    const { data } = assertStatus(
      await getImoveisInscricaoDividaAtiva('00000018'),
      200
    )

    for (const debito of (data.cdas ?? []).map(mapApiToDebito)) {
      for (const valor of [debito.valorPrincipal, debito.valorHonorarios]) {
        expect(valor === null || Number.isFinite(valor)).toBe(true)
      }
    }
  })
})
