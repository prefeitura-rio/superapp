import { consultarCep } from '@/actions/divida-ativa/consultar-cep'
import { TEST_ENV } from '@/test/mocks/env'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { describe, expect, test } from 'vitest'

const URL_CEP = `${TEST_ENV.BASE_API_URL_DIVIDA_ATIVA}/divida-ativa/cep/:cep`

describe('consultarCep', () => {
  test('consulta só com os dígitos e devolve o endereço', async () => {
    let cepPedido: unknown
    server.use(
      http.get(URL_CEP, ({ params }) => {
        cepPedido = params.cep
        return HttpResponse.json({
          cep: '20541-190',
          logradouro: 'Rua Paula Brito',
          bairro: 'Andaraí',
          cidade: 'Rio de Janeiro',
          uf: 'RJ',
        })
      })
    )

    expect(await consultarCep('20541-190')).toEqual({
      success: true,
      data: {
        logradouro: 'Rua Paula Brito',
        bairro: 'Andaraí',
        cidade: 'Rio de Janeiro',
        uf: 'RJ',
      },
    })
    expect(cepPedido).toBe('20541190')
  })

  // A API responde 200 com `mensagemErro` quando o ViaCEP não conhece o CEP.
  test('CEP inexistente vira erro com orientação para preencher', async () => {
    server.use(
      http.get(URL_CEP, () =>
        HttpResponse.json({ cep: '99999-999', mensagemErro: 'erro' })
      )
    )

    const resultado = await consultarCep('99999999')

    expect(resultado.success).toBe(false)
    expect(!resultado.success && resultado.error).toMatch(/preencha o endereço/)
  })

  // CEP geral de cidade pequena: sem logradouro nem bairro, mas é um CEP válido.
  test('CEP geral devolve cidade e UF com logradouro vazio', async () => {
    server.use(
      http.get(URL_CEP, () =>
        HttpResponse.json({
          cep: '28890-000',
          cidade: 'Rio das Ostras',
          uf: 'RJ',
        })
      )
    )

    expect(await consultarCep('28890000')).toEqual({
      success: true,
      data: { logradouro: '', bairro: '', cidade: 'Rio das Ostras', uf: 'RJ' },
    })
  })

  test('CEP incompleto não chama a API', async () => {
    expect((await consultarCep('2054')).success).toBe(false)
  })
})
