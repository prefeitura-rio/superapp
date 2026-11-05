import { expect, test } from '@playwright/test'
import { applyE2EAuthCookies, hasE2EAuth } from './fixtures/auth'

test.describe('PREF-381 — Habilidades e Competências', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(
      !hasE2EAuth(),
      'Defina E2E_ACCESS_TOKEN para executar testes autenticados'
    )

    await applyE2EAuthCookies(context)
  })

  test('escolhe uma área, marca tags e salva', async ({ page }) => {
    await page.goto('/servicos/trabalho/curriculo')

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Meu Currículo',
      })
    ).toBeVisible({ timeout: 15000 })

    const secao = page.getByRole('button', {
      name: /Habilidades e Competências/,
    })
    await expect(secao.getByTestId('habilidades-check')).toHaveCount(0)

    await secao.click()

    const salvar = page.getByRole('button', {
      name: 'Salvar',
      exact: true,
    })
    await expect(salvar).toBeVisible()
    await expect(salvar).toBeDisabled()

    await page.getByTestId('field-area-atuacao').getByRole('button').click()
    await expect(page.getByTestId('area-atuacao-search-icon')).toBeVisible()

    const sheet = page.getByRole('dialog')
    await sheet.getByRole('radio').first().click()
    await expect(secao.getByTestId('habilidades-check')).toBeVisible()

    await page
      .getByText('Selecione conhecimentos', { exact: true })
      .locator('..')
      .getByRole('button')
      .first()
      .click()
    await page
      .getByText('Selecione comportamentos e atitudes', { exact: true })
      .locator('..')
      .getByRole('button')
      .first()
      .click()

    await expect(salvar).toBeEnabled()
    await salvar.click()

    await expect(
      page.getByText('Habilidades e competências salvas com sucesso')
    ).toBeVisible()
    await expect(salvar).toBeDisabled()
  })
})
