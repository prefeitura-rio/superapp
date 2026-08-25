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

  test('exibe carteira com texto Documentos e CLÍNICA DA FAMÍLIA', async ({
    page,
  }) => {
    await page.goto('/carteira')
    await expect(page.getByRole('heading', { name: 'Documentos' })).toBeVisible(
      {
        timeout: 20000,
      }
    )
    await expect(page.getByText('CLÍNICA DA FAMÍLIA')).toBeVisible({
      timeout: 25000,
    })
  })

  test('exibe abas "Cartões", "Pets" e "Veículos"', async ({ page }) => {
    await page.goto('/carteira')
    await expect(page.getByRole('heading', { name: 'Documentos' })).toBeVisible(
      {
        timeout: 20000,
      }
    )
    // Rótulos definidos em src/app/components/wallet-tabs.tsx
    await expect(page.getByText('Cartões', { exact: true })).toBeVisible({
      timeout: 15000,
    })
    await expect(page.getByText('Pets', { exact: true })).toBeVisible()
    await expect(page.getByText('Veículos', { exact: true })).toBeVisible()
  })

  test('exibe cartões ou estado vazio da carteira', async ({ page }) => {
    await page.goto('/carteira')
    await expect(page.getByRole('heading', { name: 'Documentos' })).toBeVisible(
      {
        timeout: 20000,
      }
    )

    const algumCartao = page.getByText(/CLÍNICA DA FAMÍLIA|CADÚNICO/)
    const carteiraVazia = page.getByText(
      'Nenhum cartão disponível no momento',
      { exact: false }
    )
    await expect(algumCartao.or(carteiraVazia).first()).toBeVisible({
      timeout: 25000,
    })
  })

  test('aba Pets exibe pets ou estado vazio', async ({ page }) => {
    await page.goto('/carteira?pets=true')
    await expect(page.getByRole('heading', { name: 'Documentos' })).toBeVisible(
      {
        timeout: 20000,
      }
    )

    const semPet = page.getByText('Você ainda não tem um animal cadastrado', {
      exact: false,
    })
    const conhecaSisbicho = page.getByText('SISBICHO', { exact: false })
    await expect(semPet.or(conhecaSisbicho).first()).toBeVisible({
      timeout: 20000,
    })
  })

  test('clicar no cartão CLÍNICA DA FAMÍLIA abre o detalhe (render estável)', async ({
    page,
  }) => {
    await page.goto('/carteira')
    await expect(page.getByRole('heading', { name: 'Documentos' })).toBeVisible(
      {
        timeout: 20000,
      }
    )

    // O cartão é um link (asLink href="/carteira/clinica-da-familia")
    const cardLink = page
      .locator('a[href="/carteira/clinica-da-familia"]')
      .first()
    const hasCard = await cardLink
      .waitFor({ state: 'visible', timeout: 25000 })
      .then(() => true)
      .catch(() => false)
    if (!hasCard) {
      test.skip(true, 'Conta sem cartão Clínica da Família na carteira')
      return
    }

    await cardLink.click()
    await page.waitForURL('**/carteira/clinica-da-familia', { timeout: 15000 })

    // Detalhe renderiza de forma estável: header "Documentos" + título do cartão
    await expect(page.getByRole('heading', { name: 'Documentos' })).toBeVisible(
      {
        timeout: 20000,
      }
    )
    await expect(page.getByText('CLÍNICA DA FAMÍLIA').first()).toBeVisible({
      timeout: 20000,
    })
  })
})
