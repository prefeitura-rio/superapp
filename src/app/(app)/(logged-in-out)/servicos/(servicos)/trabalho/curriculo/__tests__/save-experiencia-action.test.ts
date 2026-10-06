import { TEST_ENV } from '@/test/mocks/env'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { describe, expect, test } from 'vitest'
import type { CurriculoExperienciaFormValues } from '../curriculo-experiencia-schema'
import { saveExperienciaAction } from '../save-experiencia-action'

const COURSES_BASE_URL = TEST_ENV.COURSES_BASE_API_URL

// PUT /api/v1/empregabilidade/curriculo/:cpf/experiencias
const experienciasUrl = `${COURSES_BASE_URL}/api/v1/empregabilidade/curriculo/:cpf/experiencias`

const validEmprego = {
  cargo: 'Analista de Suporte',
  empresa: 'Empresa Exemplo',
  descricaoAtividades:
    'Descrição das atividades com mais de trinta caracteres exigidos.',
  meuEmpregoAtual: false,
  tempoExperienciaAnos: 1,
  tempoExperienciaMeses: 0,
  experienciaComprovadaCarteira: 'Sim',
}

// Emprego incompleto — deve ser filtrado por buildExperiencias
const invalidEmprego = {
  cargo: '',
  empresa: '',
  descricaoAtividades: '',
  meuEmpregoAtual: false,
  tempoExperienciaAnos: null,
  tempoExperienciaMeses: null,
  experienciaComprovadaCarteira: '',
}

describe('saveExperienciaAction', () => {
  test('constrói o payload apenas com experiências válidas e mapeia os campos', async () => {
    let capturedBody: Record<string, unknown> | null = null

    server.use(
      http.put(experienciasUrl, async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ message: 'ok' }, { status: 200 })
      })
    )

    const formValues: CurriculoExperienciaFormValues = {
      empregos: [validEmprego, invalidEmprego],
      conquistas: [],
      resumoProfissional: '  Resumo profissional  ',
    }

    const result = await saveExperienciaAction('123.456.789-01', formValues)

    expect(result).toEqual({ success: true, status: 200 })
    expect(capturedBody).toMatchObject({
      experiencias: [
        {
          cargo: 'Analista de Suporte',
          empresa: 'Empresa Exemplo',
          descricao_atividades:
            'Descrição das atividades com mais de trinta caracteres exigidos.',
          eh_trabalho_atual: false,
          experiencia_comprovada_ct: true,
          tempo_experiencia_meses: 12,
        },
      ],
      conquistas: [],
      resumo_profissional: 'Resumo profissional',
    })
    // Apenas a experiência válida foi enviada
    expect(
      (capturedBody as unknown as { experiencias: unknown[] }).experiencias
    ).toHaveLength(1)
  })

  test('inclui conquistas válidas no payload', async () => {
    let capturedBody: Record<string, unknown> | null = null

    server.use(
      http.put(experienciasUrl, async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ message: 'ok' }, { status: 200 })
      })
    )

    const formValues: CurriculoExperienciaFormValues = {
      empregos: [],
      conquistas: [
        {
          idTipoConquista: 'tipo-1',
          titulo: 'Certificado X',
          descricao:
            'Descrição da conquista com mais de trinta caracteres exigidos.',
        },
      ],
    }

    await saveExperienciaAction('12345678901', formValues)

    expect(capturedBody).toMatchObject({
      conquistas: [
        {
          id_tipo_conquista: 'tipo-1',
          titulo: 'Certificado X',
          descricao:
            'Descrição da conquista com mais de trinta caracteres exigidos.',
        },
      ],
    })
  })

  test('retorna erro com status em resposta não-200', async () => {
    server.use(
      http.put(experienciasUrl, () =>
        HttpResponse.json({ message: 'erro' }, { status: 500 })
      )
    )

    const result = await saveExperienciaAction('12345678901', {
      empregos: [],
      conquistas: [],
    })

    expect(result).toEqual({
      success: false,
      status: 500,
      error: JSON.stringify({ message: 'erro' }),
    })
  })

  test('retorna erro em falha de rede (exceção)', async () => {
    server.use(http.put(experienciasUrl, () => HttpResponse.error()))

    const result = await saveExperienciaAction('12345678901', {
      empregos: [],
      conquistas: [],
    })

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })
})
