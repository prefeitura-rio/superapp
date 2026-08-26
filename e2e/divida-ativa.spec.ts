import { expect, test } from '@playwright/test'
import { applyE2EAuthCookies, hasE2EAuth } from './fixtures/auth'

/**
 * O módulo inteiro exige login e está atrás de `NEXT_PUBLIC_FEATURE_DIVIDA_ATIVA`. Com a flag
 * desligada o middleware reescreve para `/not-found`, então estes testes só fazem sentido em
 * ambiente com a flag ligada (`.env` local e o quality gate).
 */

test.describe('Dívida Ativa', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(
      !hasE2EAuth(),
      'Defina E2E_ACCESS_TOKEN para rodar testes autenticados'
    )
    await applyE2EAuthCookies(context)
  })

  test('landing anuncia o módulo e os serviços', async ({ page }) => {
    await page.goto('/divida-ativa')

    await expect(
      page.getByRole('heading', { level: 1, name: 'Dívida ativa' })
    ).toBeVisible({ timeout: 20000 })

    await expect(
      page.getByRole('heading', { level: 2, name: 'Serviços' })
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Parcelar débitos' })
    ).toBeVisible()
  })

  test('serviços ainda não construídos explicam a situação em vez de dar 404', async ({
    page,
  }) => {
    await page.goto('/divida-ativa/parcelamento')

    await expect(
      page.getByRole('heading', { level: 1, name: 'Parcelar débitos' })
    ).toBeVisible({ timeout: 20000 })
    await expect(
      page.getByRole('link', { name: 'Voltar a página de Dívida ativa' })
    ).toBeVisible()
  })
})
