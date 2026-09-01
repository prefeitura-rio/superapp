import type { ModelsEnderecoPrincipal } from '@/http/models/modelsEnderecoPrincipal'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test } from 'vitest'

import { AddressInfoCard } from '../address-info-card'

const address: ModelsEnderecoPrincipal = {
  tipo_logradouro: 'Rua',
  logradouro: 'Visconde de Figueiredo',
  numero: '62',
  complemento: 'cob-01',
  bairro: 'Tijuca',
  municipio: 'Rio de Janeiro',
  estado: 'RJ',
  cep: '20550-100',
}

async function openActions() {
  const user = userEvent.setup()
  render(<AddressInfoCard address={address} />)

  await user.click(screen.getByText('Rua Visconde de Figueiredo, 62'))

  return screen.findByRole('dialog')
}

describe('AddressInfoCard', () => {
  test('mostra o endereço cadastrado', () => {
    render(<AddressInfoCard address={address} />)

    expect(
      screen.getByText('Rua Visconde de Figueiredo, 62')
    ).toBeInTheDocument()
    expect(screen.getByText('cob-01')).toBeInTheDocument()
    expect(screen.getByText('Tijuca, Rio de Janeiro, RJ')).toBeInTheDocument()
  })

  test('oferece a edição do endereço', async () => {
    const actions = await openActions()

    const editar = await screen.findByRole('button', { name: 'Editar' })
    expect(actions).toContainElement(editar)
  })

  // O endereço é obrigatório para a inscrição em cursos e vagas: permitir a
  // exclusão do único endereço do cidadão zerava o dado no RMI e travava esses
  // serviços.
  test('não oferece a exclusão do endereço', async () => {
    await openActions()

    await screen.findByRole('button', { name: 'Editar' })
    expect(
      screen.queryByRole('button', { name: 'Excluir' })
    ).not.toBeInTheDocument()
  })
})
