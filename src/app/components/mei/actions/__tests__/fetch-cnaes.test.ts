import { getCnaes } from '@/http/cnaes/cnaes'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchCnaesByIds } from '../fetch-cnaes'

vi.mock('@/http/cnaes/cnaes', () => ({
  getCnaes: vi.fn(),
}))

const mockGetCnaes = vi.mocked(getCnaes)

describe('fetchCnaesByIds', () => {
  beforeEach(() => {
    mockGetCnaes.mockReset()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('devolve código e descrição de cada CNAE da oportunidade', async () => {
    mockGetCnaes.mockResolvedValue({
      status: 200,
      data: {
        cnaes: [{ subclasse: '4321-5/00', denominacao: 'Instalação elétrica' }],
      },
    } as Awaited<ReturnType<typeof getCnaes>>)

    await expect(fetchCnaesByIds(['4321500'])).resolves.toEqual([
      { codigo: '4321-5/00', descricao: 'Instalação elétrica' },
    ])
  })

  it('mantém os demais CNAEs quando a consulta de um deles falha', async () => {
    mockGetCnaes
      .mockResolvedValueOnce({
        status: 200,
        data: {
          cnaes: [
            { subclasse: '4321-5/00', denominacao: 'Instalação elétrica' },
          ],
        },
      } as Awaited<ReturnType<typeof getCnaes>>)
      .mockRejectedValueOnce(new Error('timeout'))

    await expect(fetchCnaesByIds(['4321500', '4330404'])).resolves.toEqual([
      { codigo: '4321-5/00', descricao: 'Instalação elétrica' },
      { codigo: '4330404', descricao: '' },
    ])
  })

  it('devolve lista vazia sem consultar a API quando não há CNAEs', async () => {
    await expect(fetchCnaesByIds([])).resolves.toEqual([])
    expect(mockGetCnaes).not.toHaveBeenCalled()
  })
})
