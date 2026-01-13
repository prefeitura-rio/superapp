import { http, HttpResponse } from 'msw'
import { describe, expect, test, vi } from 'vitest'
import { server } from '@/test/mocks/server'
import { TEST_ENV } from '@/test/mocks/env'
import { updateUserEmail } from '../update-user-email'
import { getUserInfoFromToken } from '@/lib/user-info'
import { revalidateTag } from 'next/cache'

const RMI_BASE_URL = TEST_ENV.NEXT_PUBLIC_BASE_API_URL_RMI

describe('updateUserEmail', () => {
  const validEmailData = {
    valor: 'novo@example.com',
  }

  describe('success scenarios', () => {
    test('returns success and revalidates cache for valid email', async () => {
      const result = await updateUserEmail(validEmailData)

      expect(result).toMatchObject({
        success: true,
        data: { message: 'Success' },
      })
      expect(revalidateTag).toHaveBeenCalledWith('user-info-12345678901')
    })
  })

  describe('error scenarios', () => {
    test('returns error with status for API failure (status 400)', async () => {
      server.use(
        http.put(`${RMI_BASE_URL}/v1/citizen/:cpf/email`, () => {
          return HttpResponse.json(
            { error: 'Email inválido' },
            { status: 400 }
          )
        })
      )

      const result = await updateUserEmail(validEmailData)

      expect(result).toEqual({
        success: false,
        error: 'Email inválido',
        status: 400,
      })
    })

    test('throws error when user not authenticated', async () => {
      vi.mocked(getUserInfoFromToken).mockResolvedValueOnce({
        cpf: '',
        name: '',
      })

      await expect(updateUserEmail(validEmailData)).rejects.toThrow(
        'Usuário não autenticado'
      )
    })
  })
})
