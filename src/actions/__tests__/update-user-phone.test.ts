import { http, HttpResponse } from 'msw'
import { describe, expect, test, vi } from 'vitest'
import { server } from '@/test/mocks/server'
import { TEST_ENV } from '@/test/mocks/env'
import { updateUserPhone } from '../update-user-phone'
import { getUserInfoFromToken } from '@/lib/user-info'
import { revalidateTag } from 'next/cache'

const RMI_BASE_URL = TEST_ENV.NEXT_PUBLIC_BASE_API_URL_RMI

describe('updateUserPhone', () => {
  const validPhoneData = {
    ddi: '55',
    ddd: '21',
    valor: '999999999',
  }

  describe('success scenarios', () => {
    test('returns success and revalidates cache for valid phone', async () => {
      const result = await updateUserPhone(validPhoneData)

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
        http.put(`${RMI_BASE_URL}/v1/citizen/:cpf/phone`, () => {
          return HttpResponse.json(
            { error: 'Número de telefone inválido' },
            { status: 400 }
          )
        })
      )

      const result = await updateUserPhone(validPhoneData)

      expect(result).toEqual({
        success: false,
        error: 'Número de telefone inválido',
        status: 400,
      })
    })

    test('throws error when user not authenticated', async () => {
      vi.mocked(getUserInfoFromToken).mockResolvedValueOnce({
        cpf: '',
        name: '',
      })

      await expect(updateUserPhone(validPhoneData)).rejects.toThrow(
        'Usuário não autenticado'
      )
    })
  })
})
