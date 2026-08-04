import type { EmpregabilidadeFormacaoAccordionRequest } from '@/http-courses/models'
import { TEST_ENV } from '@/test/mocks/env'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { describe, expect, test } from 'vitest'
import { saveFormacaoAccordion } from '../save-formacao-action'

const COURSES_BASE_URL = TEST_ENV.COURSES_BASE_API_URL

// PUT /api/v1/empregabilidade/curriculo/:cpf/formacoes
const formacoesUrl = `${COURSES_BASE_URL}/api/v1/empregabilidade/curriculo/:cpf/formacoes`

const payload: EmpregabilidadeFormacaoAccordionRequest = {
  formacoes: [
    {
      id_escolaridade: 'esc-4',
      nome_curso: 'Técnico em Informática',
      nome_instituicao: 'Escola Municipal',
    },
  ],
  idiomas: [{ id_idioma: 'idioma-ingles', id_nivel: 'nivel-avancado' }],
}

describe('saveFormacaoAccordion', () => {
  test('normaliza o CPF na URL e envia o payload no body', async () => {
    let capturedUrl = ''
    let capturedBody: unknown = null

    server.use(
      http.put(formacoesUrl, async ({ request }) => {
        capturedUrl = request.url
        capturedBody = await request.json()
        return HttpResponse.json({ message: 'ok' }, { status: 200 })
      })
    )

    const result = await saveFormacaoAccordion('123.456.789-01', payload)

    expect(result).toEqual({ success: true, status: 200 })
    // CPF normalizado (só dígitos) na URL
    expect(capturedUrl).toContain('/curriculo/12345678901/formacoes')
    expect(capturedBody).toEqual(payload)
  })

  test('retorna erro com status e corpo serializado em resposta não-200', async () => {
    server.use(
      http.put(formacoesUrl, () =>
        HttpResponse.json({ message: 'Dados inválidos' }, { status: 400 })
      )
    )

    const result = await saveFormacaoAccordion('12345678901', payload)

    expect(result).toEqual({
      success: false,
      status: 400,
      error: JSON.stringify({ message: 'Dados inválidos' }),
    })
  })

  test('retorna erro em falha de rede (exceção)', async () => {
    server.use(http.put(formacoesUrl, () => HttpResponse.error()))

    const result = await saveFormacaoAccordion('12345678901', payload)

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })
})
