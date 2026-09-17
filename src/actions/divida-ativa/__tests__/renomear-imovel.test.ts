import { renomearImovel } from '@/actions/divida-ativa/renomear-imovel'
import { TEST_ENV } from '@/test/mocks/env'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { revalidatePath } from 'next/cache'
import { describe, expect, test, vi } from 'vitest'

const DIVIDA_ATIVA = TEST_ENV.BASE_API_URL_DIVIDA_ATIVA

const IMOVEL_RENOMEADO = {
  id: 32,
  cpf: '12345678909',
  dataInclusao: '2026-06-22T15:40:46.477',
  endereco: 'RUA EXEMPLO, 123 / LOJA A - BAIRRO',
  numInscricao: '00000018',
  nome: 'Casa da praia',
}

describe('renomearImovel', () => {
  test('manda o nome novo para o id local e devolve o imóvel atualizado', async () => {
    let bodyRecebido: unknown
    let urlRecebida = ''

    server.use(
      http.patch(`${DIVIDA_ATIVA}/imoveis/:id`, async ({ request }) => {
        bodyRecebido = await request.json()
        urlRecebida = request.url
        return HttpResponse.json(IMOVEL_RENOMEADO, { status: 200 })
      })
    )

    const resultado = await renomearImovel(32, '  Casa da praia  ')

    expect(urlRecebida).toContain('/imoveis/32')
    expect(bodyRecebido).toEqual({ nome: 'Casa da praia' })
    expect(resultado).toEqual({
      success: true,
      data: {
        id: 32,
        inscricao: '00000018',
        endereco: 'RUA EXEMPLO, 123 / LOJA A - BAIRRO',
        nome: 'Casa da praia',
        bairro: null,
        proprietario: null,
        possuiDebitos: null,
        cadastradoEm: '2026-06-22',
      },
    })
  })

  // Diferente do cadastro, onde a chave é omitida: no PATCH o campo vazio é a única forma
  // de apagar um nome dado por engano, então ele **precisa** viajar.
  test('envia nome vazio para apagar o nome gravado', async () => {
    let bodyRecebido: unknown

    server.use(
      http.patch(`${DIVIDA_ATIVA}/imoveis/:id`, async ({ request }) => {
        bodyRecebido = await request.json()
        return HttpResponse.json(
          { ...IMOVEL_RENOMEADO, nome: null },
          { status: 200 }
        )
      })
    )

    const resultado = await renomearImovel(32, '   ')

    expect(bodyRecebido).toEqual({ nome: '' })
    expect(resultado.success && resultado.data.nome).toBeNull()
  })

  test('recusa nome acima do limite sem chamar a API', async () => {
    let chamou = false

    server.use(
      http.patch(`${DIVIDA_ATIVA}/imoveis/:id`, () => {
        chamou = true
        return HttpResponse.json(IMOVEL_RENOMEADO, { status: 200 })
      })
    )

    const resultado = await renomearImovel(32, 'a'.repeat(61))

    expect(chamou).toBe(false)
    expect(resultado).toEqual({
      success: false,
      error: 'O nome pode ter no máximo 60 caracteres.',
      status: 400,
    })
  })

  test('recusa id inválido sem chamar a API', async () => {
    let chamou = false

    server.use(
      http.patch(`${DIVIDA_ATIVA}/imoveis/:id`, () => {
        chamou = true
        return HttpResponse.json(IMOVEL_RENOMEADO, { status: 200 })
      })
    )

    const resultado = await renomearImovel(0, 'Casa')

    expect(chamou).toBe(false)
    expect(resultado.success).toBe(false)
  })

  // 404 é o que a API devolve quando o id não pertence ao CPF do token. A mensagem dela não
  // é exibível (o envelope só traz texto de negócio no 400), então a copy é nossa.
  test('não repassa a mensagem de um 404', async () => {
    server.use(
      http.patch(`${DIVIDA_ATIVA}/imoveis/:id`, () =>
        HttpResponse.json(
          { error: 'Imovel nao encontrado para o usuario.' },
          { status: 404 }
        )
      )
    )

    const resultado = await renomearImovel(32, 'Casa')

    expect(resultado).toEqual({
      success: false,
      error: 'Não foi possível renomear o imóvel. Tente novamente mais tarde.',
      status: 404,
    })
  })

  test('revalida a lista e a landing depois de renomear', async () => {
    server.use(
      http.patch(`${DIVIDA_ATIVA}/imoveis/:id`, () =>
        HttpResponse.json(IMOVEL_RENOMEADO, { status: 200 })
      )
    )

    await renomearImovel(32, 'Casa da praia')

    expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith(
      '/divida-ativa/imoveis'
    )
    expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith('/divida-ativa')
  })
})
