import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LogoutButton } from '../logout-button'

describe('LogoutButton', () => {
  const assign = vi.fn()
  const originalLocation = window.location

  beforeEach(() => {
    assign.mockReset()
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, assign },
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    })
    document.body.innerHTML = ''
  })

  it('navega em primeiro nível para a rota de logout encadeado com o Gov.br, sem iframe', () => {
    render(<LogoutButton />)

    fireEvent.click(screen.getByText('Sair'))

    expect(assign).toHaveBeenCalledTimes(1)
    expect(assign).toHaveBeenCalledWith('/api/auth/logout?sso=govbr')
    expect(document.querySelector('iframe')).toBeNull()
    expect(screen.getByText('Saindo...')).toBeInTheDocument()
  })

  it('ignora cliques repetidos durante o logout', () => {
    render(<LogoutButton />)

    fireEvent.click(screen.getByText('Sair'))
    fireEvent.click(screen.getByText('Saindo...'))

    expect(assign).toHaveBeenCalledTimes(1)
  })
})
