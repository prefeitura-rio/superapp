import { expect, test } from '@playwright/test'
import { applyE2EAuthCookies, hasE2EAuth } from './fixtures/auth'

test.describe('Carteira', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(
      !hasE2EAuth(),
      'Defina E2E_ACCESS_TOKEN para rodar testes autenticados'
    )
    await applyE2EAuthCookies(context)
  })

  test('exibe carteira com texto Carteira e CLÍNICA DA FAMÍLIA', async ({
    page,
  }) => {
    await page.goto('/carteira')
    await expect(page.getByRole('heading', { name: 'Carteira' })).toBeVisible({
      timeout: 20000,
    })
    await expect(page.getByText('CLÍNICA DA FAMÍLIA')).toBeVisible({
      timeout: 25000,
    })
  })
})
