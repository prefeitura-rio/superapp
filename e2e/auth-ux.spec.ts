import { expect, test } from '@playwright/test'
import { applyE2ECookieConsent } from './fixtures/auth'

/**
 * Telas de UX de autenticação (deslogado): página de "autenticação necessária"
 * da carteira e a tela de "sessão expirada". São públicas — rodam sempre.
 */

test.describe('Auth UX — autenticação necessária (público)', () => {
  test.beforeEach(async ({ context }) => {
    await applyE2ECookieConsent(context)
  })

  test('/autenticacao-necessaria/carteira exibe conteúdo e CTA gov.br', async ({
    page,
  }) => {
    await page.goto('/autenticacao-necessaria/carteira')

    await expect(page.getByRole('heading', { name: 'Documentos' })).toBeVisible(
      {
        timeout: 15000,
      }
    )
    await expect(
      page.getByText('Informações para você em um só lugar', { exact: false })
    ).toBeVisible()
    await expect(
      page.getByText('Entre com a sua conta gov.br', { exact: false })
    ).toBeVisible()
    // Botão gov.br (imagem sem label textual) e link "Crie uma conta"
    await expect(page.locator('img[alt="Gov.br"]').first()).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Crie uma conta' })
    ).toBeVisible()
  })
})

test.describe('Auth UX — sessão expirada (público)', () => {
  test.beforeEach(async ({ context }) => {
    await applyE2ECookieConsent(context)
  })

  test('/sessao-expirada exibe mensagem e opções de login', async ({
    page,
  }) => {
    await page.goto('/sessao-expirada')

    await expect(
      page.getByRole('heading', { name: 'Sessão Expirada' })
    ).toBeVisible({ timeout: 15000 })
    await expect(
      page.getByText('Por questões de segurança, você foi deslogado', {
        exact: false,
      })
    ).toBeVisible()
    await expect(page.locator('img[alt="Gov.br"]').first()).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Continuar sem fazer login' })
    ).toBeVisible()
  })
})
