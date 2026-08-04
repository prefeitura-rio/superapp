import { TEST_ENV } from '@/test/mocks/env'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { describe, expect, test } from 'vitest'
import type { CurriculoSituacaoFormValues } from '../curriculo-situacao-schema'
import { saveSituacaoAction } from '../save-situacao-action'

const COURSES_BASE_URL = TEST_ENV.COURSES_BASE_API_URL

// PUT /api/v1/empregabilidade/curriculo/situacao-interesses (CPF vai no body)
const situacaoUrl = `${COURSES_BASE_URL}/api/v1/empregabilidade/curriculo/situacao-interesses`

describe('saveSituacaoAction', () => {
  test('monta o payload com CPF normalizado e mapeia os campos', async () => {
    let capturedBody: Record<string, unknown> | null = null

    server.use(
      http.put(situacaoUrl, async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ message: 'ok' }, { status: 200 })
      })
    )

    const values: CurriculoSituacaoFormValues = {
      idSituacao: 'sit-1',
      tempoProcurandoEmprego: 'UP_TO_6',
      idDisponibilidade: 'disp-1',
      idsTiposVinculo: ['vinc-1', 'vinc-2'],
    }

    const result = await saveSituacaoAction('123.456.789-01', values)

    expect(result).toEqual({ success: true, status: 200 })
    expect(capturedBody).toEqual({
      cpf: '12345678901',
      id_situacao: 'sit-1',
      tempo_procurando_emprego: 'UP_TO_6',
      id_disponibilidade: 'disp-1',
      ids_tipos_vinculo_preferencia: ['vinc-1', 'vinc-2'],
    })
  })

  test('omite ids_tipos_vinculo_preferencia quando a lista está vazia', async () => {
    let capturedBody: Record<string, unknown> | null = null

    server.use(
      http.put(situacaoUrl, async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ message: 'ok' }, { status: 200 })
      })
    )

    await saveSituacaoAction('12345678901', {
      idSituacao: 'sit-1',
      idsTiposVinculo: [],
    })

    expect(capturedBody).not.toHaveProperty('ids_tipos_vinculo_preferencia')
    expect(capturedBody).not.toHaveProperty('id_disponibilidade')
  })

  test('retorna erro com status em resposta não-200', async () => {
    server.use(
      http.put(situacaoUrl, () =>
        HttpResponse.json({ message: 'erro' }, { status: 400 })
      )
    )

    const result = await saveSituacaoAction('12345678901', {
      idSituacao: 'sit-1',
    })

    expect(result).toEqual({
      success: false,
      status: 400,
      error: JSON.stringify({ message: 'erro' }),
    })
  })

  test('retorna erro em falha de rede (exceção)', async () => {
    server.use(http.put(situacaoUrl, () => HttpResponse.error()))

    const result = await saveSituacaoAction('12345678901', {
      idSituacao: 'sit-1',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })
})
