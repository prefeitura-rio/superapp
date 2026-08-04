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

  test('exibe abas "Meus Cartões" e "Meus Pets"', async ({ page }) => {
    await page.goto('/carteira')
    await expect(page.getByRole('heading', { name: 'Carteira' })).toBeVisible({
      timeout: 20000,
    })
    await expect(page.getByText('Meus Cartões', { exact: true })).toBeVisible({
      timeout: 15000,
    })
    await expect(page.getByText('Meus Pets', { exact: true })).toBeVisible()
  })

  test('exibe cartões ou estado vazio da carteira', async ({ page }) => {
    await page.goto('/carteira')
    await expect(page.getByRole('heading', { name: 'Carteira' })).toBeVisible({
      timeout: 20000,
    })

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
    await expect(page.getByRole('heading', { name: 'Carteira' })).toBeVisible({
      timeout: 20000,
    })

    const semPet = page.getByText('Você ainda não tem um animal cadastrado', {
      exact: false,
    })
    const conhecaSisbicho = page.getByText('SISBICHO', { exact: false })
    await expect(semPet.or(conhecaSisbicho).first()).toBeVisible({
      timeout: 20000,
    })
  })
})
