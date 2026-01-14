import { getUserInfoFromToken } from '@/lib/user-info'
import { TEST_ENV } from '@/test/mocks/env'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { describe, expect, test, vi } from 'vitest'
import { validateUserPhoneToken } from '../validate-user-phone-token'

const RMI_BASE_URL = TEST_ENV.NEXT_PUBLIC_BASE_API_URL_RMI

describe('validateUserPhoneToken', () => {
  const validTokenData = {
    code: '123456',
    ddi: '55',
    ddd: '21',
    valor: '999999999',
  }

  describe('success scenarios', () => {
    test('returns success for valid token', async () => {
      const result = await validateUserPhoneToken(validTokenData)

      expect(result).toEqual({ success: true })
    })
  })

  describe('error scenarios', () => {
    test('returns error for invalid token (status 400)', async () => {
      server.use(
        http.post(`${RMI_BASE_URL}/v1/citizen/:cpf/phone/validate`, () => {
          return HttpResponse.json(
            { error: 'Token inválido ou expirado' },
            { status: 400 }
          )
        })
      )

      const result = await validateUserPhoneToken(validTokenData)

      expect(result).toEqual({
        success: false,
        error: 'Token inválido ou expirado',
        status: 400,
      })
    })

    test('returns error for rate limit (status 429)', async () => {
      server.use(
        http.post(`${RMI_BASE_URL}/v1/citizen/:cpf/phone/validate`, () => {
          return HttpResponse.json(
            { error: 'Muitas tentativas. Tente novamente em alguns minutos.' },
            { status: 429 }
          )
        })
      )

      const result = await validateUserPhoneToken(validTokenData)

      expect(result).toEqual({
        success: false,
        error: 'Muitas tentativas. Tente novamente em alguns minutos.',
        status: 429,
      })
    })

    test('throws error when user not authenticated', async () => {
      vi.mocked(getUserInfoFromToken).mockResolvedValueOnce({
        cpf: '',
        name: '',
      })

      await expect(validateUserPhoneToken(validTokenData)).rejects.toThrow(
        'Usuário não autenticado'
      )
    })
  })
})
