import { http, HttpResponse } from 'msw'
import { describe, expect, test, vi } from 'vitest'
import { server } from '@/test/mocks/server'
import { TEST_ENV } from '@/test/mocks/env'
import { updateAddress } from '../update-user-address'
import { getUserInfoFromToken } from '@/lib/user-info'
import { revalidateTag } from 'next/cache'

const RMI_BASE_URL = TEST_ENV.NEXT_PUBLIC_BASE_API_URL_RMI

describe('updateAddress', () => {
  const validAddressData = {
    cep: '20040020',
    logradouro: 'Rua da Assembleia',
    numero: '100',
    complemento: 'Sala 101',
    bairro: 'Centro',
    municipio: 'Rio de Janeiro',
    estado: 'RJ',
  }

  describe('success scenarios', () => {
    test('returns success and revalidates cache for valid address', async () => {
      const result = await updateAddress(validAddressData)

      expect(result).toMatchObject({
        success: true,
        data: { message: 'Success' },
      })
      expect(revalidateTag).toHaveBeenCalledWith('user-info-12345678901')
    })
  })

  describe('error scenarios', () => {
    test('throws error for API failure (status 400)', async () => {
      server.use(
        http.put(`${RMI_BASE_URL}/v1/citizen/:cpf/address`, () => {
          return HttpResponse.json(
            { error: 'CEP inválido' },
            { status: 400 }
          )
        })
      )

      await expect(updateAddress(validAddressData)).rejects.toThrow(
        'CEP inválido'
      )
    })

    test('throws error when user not authenticated', async () => {
      vi.mocked(getUserInfoFromToken).mockResolvedValueOnce({
        cpf: '',
        name: '',
      })

      await expect(updateAddress(validAddressData)).rejects.toThrow(
        'Usuário não autenticado'
      )
    })
  })
})
