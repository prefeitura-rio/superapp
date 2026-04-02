import { expect, test } from '@playwright/test'
import { applyE2ECookieConsent } from './fixtures/auth'

test.describe('Serviços', () => {
  test.beforeEach(async ({ context }) => {
    await applyE2ECookieConsent(context)
  })

  test('exibe textos principais na página de serviços', async ({ page }) => {
    await page.goto('/servicos')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Serviços' })
    ).toBeVisible({
      timeout: 15000,
    })
    await expect(
      page.getByRole('heading', { name: 'Mais acessados' })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Categorias' })
    ).toBeVisible()
  })

  test('ao clicar no card CADRio Agendamento, exibe página do serviço', async ({
    page,
  }) => {
    await page.goto('/servicos')
    await page.getByRole('link', { name: 'CADRio Agendamento' }).click()
    await expect(
      page.getByRole('link', { name: 'Acessar serviço' })
    ).toBeVisible({
      timeout: 20000,
    })
    await expect(
      page.getByRole('heading', { name: 'Principais informações' })
    ).toBeVisible()
  })

  test('ao clicar na categoria Cidade, exibe serviços e navega para detalhe', async ({
    page,
  }) => {
    await page.goto('/servicos')

    // Aguarda e clica no botão da categoria "Cidade"
    await expect(page.getByRole('button', { name: 'Cidade' })).toBeVisible({
      timeout: 20000,
    })
    await page.getByRole('button', { name: 'Cidade' }).click()

    // Verifica navegação para a página da categoria
    await page.waitForURL('**/servicos/categoria/cidade', { timeout: 20000 })
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Cidade',
      {
        timeout: 20000,
      }
    )
    await expect(
      page.getByRole('heading', { name: 'Mais acessados' })
    ).toBeVisible()

    // Clica no primeiro card de serviço (a > h3)
    await page
      .locator('a')
      .filter({ has: page.locator('h3') })
      .first()
      .click()

    // Verifica página de detalhe do serviço
    await expect(
      page.getByRole('link', { name: 'Acessar serviço' })
    ).toBeVisible({
      timeout: 20000,
    })
    await expect(
      page.getByRole('heading', { name: 'Principais informações' })
    ).toBeVisible()
  })
})
