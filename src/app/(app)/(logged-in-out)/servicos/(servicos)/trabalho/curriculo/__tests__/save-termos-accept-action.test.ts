import { TEST_ENV } from '@/test/mocks/env'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { describe, expect, test } from 'vitest'
import { saveTermosAcceptAction } from '../save-termos-accept-action'

const COURSES_BASE_URL = TEST_ENV.COURSES_BASE_API_URL

// PUT /api/v1/empregabilidade/termos-uso/:cpf/accept
const acceptUrl = `${COURSES_BASE_URL}/api/v1/empregabilidade/termos-uso/:cpf/accept`

describe('saveTermosAcceptAction', () => {
  test('normaliza o CPF na URL e retorna sucesso em 200', async () => {
    let capturedUrl = ''
    server.use(
      http.put(acceptUrl, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ message: 'ok' }, { status: 200 })
      })
    )

    const result = await saveTermosAcceptAction('123.456.789-01')

    expect(result).toEqual({ success: true })
    expect(capturedUrl).toContain('/termos-uso/12345678901/accept')
  })

  test('retorna erro sem chamar a API quando o CPF é vazio', async () => {
    let called = false
    server.use(
      http.put(acceptUrl, () => {
        called = true
        return HttpResponse.json({}, { status: 200 })
      })
    )

    const result = await saveTermosAcceptAction('')

    expect(result).toEqual({ success: false, error: 'CPF não disponível' })
    expect(called).toBe(false)
  })

  test('retorna success:false em resposta não-200', async () => {
    server.use(
      http.put(acceptUrl, () => HttpResponse.json({}, { status: 500 }))
    )

    const result = await saveTermosAcceptAction('12345678901')

    expect(result).toEqual({ success: false })
  })

  test('retorna erro em falha de rede (exceção)', async () => {
    server.use(http.put(acceptUrl, () => HttpResponse.error()))

    const result = await saveTermosAcceptAction('12345678901')

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })
})
