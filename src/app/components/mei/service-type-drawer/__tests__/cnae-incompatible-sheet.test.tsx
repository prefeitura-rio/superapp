import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchCnaesByIds } from '../../actions/fetch-cnaes'
import { CnaeIncompatibleSheet } from '../cnae-incompatible-sheet'

vi.mock('../../actions/fetch-cnaes', () => ({
  fetchCnaesByIds: vi.fn(),
}))

const mockFetchCnaesByIds = vi.mocked(fetchCnaesByIds)

describe('CnaeIncompatibleSheet', () => {
  beforeEach(() => {
    mockFetchCnaesByIds.mockReset()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('mantém o texto do sheet e lista os CNAEs compatíveis com a oportunidade', async () => {
    mockFetchCnaesByIds.mockResolvedValue([
      { codigo: '4321-5/00', descricao: 'Instalação e manutenção elétrica' },
      { codigo: '4330-4/04', descricao: 'Serviços de pintura de edifícios' },
    ])

    render(
      <CnaeIncompatibleSheet
        open
        onOpenChange={() => {}}
        cnaeIds={['4321500', '4330404']}
      />
    )

    expect(
      screen.getByText(
        'Você não possui uma empresa compatível com esse serviço'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Essa oportunidade é oferecida exclusivamente para os seguintes CNAEs:'
      )
    ).toBeInTheDocument()

    expect(await screen.findByText('4321-5/00')).toBeInTheDocument()
    expect(
      screen.getByText(/Instalação e manutenção elétrica/)
    ).toBeInTheDocument()
    expect(screen.getByText('4330-4/04')).toBeInTheDocument()
    expect(
      screen.getByText(/Serviços de pintura de edifícios/)
    ).toBeInTheDocument()
    expect(mockFetchCnaesByIds).toHaveBeenCalledWith(['4321500', '4330404'])
  })

  it('lista os códigos dos CNAEs da oportunidade quando a consulta das descrições falha', async () => {
    mockFetchCnaesByIds.mockRejectedValue(new Error('API indisponível'))

    render(
      <CnaeIncompatibleSheet
        open
        onOpenChange={() => {}}
        cnaeIds={['4321500', '4330404']}
      />
    )

    expect(await screen.findByText('4321500')).toBeInTheDocument()
    expect(screen.getByText('4330404')).toBeInTheDocument()
  })

  it('lista os códigos dos CNAEs da oportunidade quando a consulta não devolve nada', async () => {
    mockFetchCnaesByIds.mockResolvedValue([])

    render(
      <CnaeIncompatibleSheet
        open
        onOpenChange={() => {}}
        cnaeIds={['4321500']}
      />
    )

    expect(await screen.findByText('4321500')).toBeInTheDocument()
  })
})
