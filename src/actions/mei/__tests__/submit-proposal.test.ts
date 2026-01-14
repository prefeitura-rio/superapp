import { http, HttpResponse } from 'msw'
import { describe, expect, test } from 'vitest'
import { server } from '@/test/mocks/server'
import { TEST_ENV } from '@/test/mocks/env'
import { submitMeiProposal } from '../submit-proposal'

const COURSES_BASE_URL = TEST_ENV.NEXT_PUBLIC_COURSES_BASE_API_URL

describe('submitMeiProposal', () => {
  const validProposalData = {
    oportunidadeId: 123,
    meiEmpresaId: 'mei-empresa-456',
    valorProposta: 1500.0,
    prazoExecucaoDias: 30,
    telefone: '21999999999',
    email: 'mei@example.com',
  }

  describe('success scenarios', () => {
    test('returns success with proposal data for status 201', async () => {
      const result = await submitMeiProposal(validProposalData)

      expect(result).toMatchObject({
        success: true,
        data: { id: 'proposal-123', status: 'submitted' },
      })
    })
  })

  describe('error scenarios', () => {
    test('returns error for not found opportunity (status 404)', async () => {
      server.use(
        http.post(
          `${COURSES_BASE_URL}/api/v1/oportunidades-mei/:id/propostas`,
          () => {
            return HttpResponse.json(
              { message: 'Oportunidade não encontrada' },
              { status: 404 }
            )
          }
        )
      )

      const result = await submitMeiProposal(validProposalData)

      expect(result).toEqual({
        success: false,
        error: 'Oportunidade não encontrada',
      })
    })

    test('returns error for validation failure (status 400)', async () => {
      server.use(
        http.post(
          `${COURSES_BASE_URL}/api/v1/oportunidades-mei/:id/propostas`,
          () => {
            return HttpResponse.json(
              { error: 'Valor da proposta inválido' },
              { status: 400 }
            )
          }
        )
      )

      const result = await submitMeiProposal(validProposalData)

      expect(result).toEqual({
        success: false,
        error: 'Valor da proposta inválido',
      })
    })

    test('returns error for network failure', async () => {
      server.use(
        http.post(
          `${COURSES_BASE_URL}/api/v1/oportunidades-mei/:id/propostas`,
          () => {
            return HttpResponse.error()
          }
        )
      )

      const result = await submitMeiProposal(validProposalData)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })
})
