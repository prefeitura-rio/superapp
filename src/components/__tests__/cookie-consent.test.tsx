import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CookieConsent } from '../cookie-consent'

describe('CookieConsent', () => {
  it.each(['default', 'small', 'mini'] as const)(
    'expõe o banner como landmark nomeado (variante %s)',
    async variant => {
      render(<CookieConsent variant={variant} demo />)

      const region = await screen.findByRole('region', {
        name: 'Consentimento de cookies',
      })

      expect(
        within(region).getAllByRole('button', { name: /Rejeitar/ }).length
      ).toBeGreaterThan(0)
      expect(
        within(region).getAllByRole('button', { name: /Aceitar todos/ }).length
      ).toBeGreaterThan(0)
    }
  )

  it('permite sobrescrever o nome acessível', async () => {
    render(<CookieConsent demo aria-label="Aviso de cookies" />)

    expect(
      await screen.findByRole('region', { name: 'Aviso de cookies' })
    ).toBeInTheDocument()
  })
})
