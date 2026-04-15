import { type Page, expect, test } from '@playwright/test'
import {
  applyE2EAuthCookies,
  applyE2ECookieConsent,
  hasE2EAuth,
} from './fixtures/auth'

/**
 * `src/app/(app)/layout.tsx` renderiza `<main>{children}</main>` e a home adiciona
 * outro `<main class="... max-w-4xl ...">` — há dois `<main>` na mesma árvore.
 * Ancoramos o conteúdo da home pela classe do `<main>` interno.
 */
function homeMain(page: Page) {
  return page.locator('main.max-w-4xl')
}

test.describe('Home (público)', () => {
  test.beforeEach(async ({ context }) => {
    await applyE2ECookieConsent(context)
  })

  test('carrega a home com busca, serviços, mais acessados e navegação flutuante', async ({
    page,
  }) => {
    await page.goto('/')

    await expect(homeMain(page)).toBeVisible()

    await expect(
      page.getByRole('link', { name: 'Do que você precisa?' })
    ).toBeVisible()

    await expect(
      page.getByRole('heading', { level: 3, name: 'Serviços' })
    ).toBeVisible({ timeout: 20000 })

    await expect(
      page.getByRole('heading', { name: 'Mais acessados' })
    ).toBeVisible()

    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Serviços' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Carteira' })).toBeVisible()
  })

  test('header de visitante oferece login', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByRole('link', { name: 'Faça seu login' })
    ).toBeVisible({ timeout: 15000 })
  })

  test('link Carteira na barra inferior aponta para fluxo de autenticação', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Carteira' })).toHaveAttribute(
      'href',
      '/autenticacao-necessaria/carteira'
    )
  })

  test('exibe banner de login (carteira / serviços municipais)', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(page.getByText('Acesse sua carteira e os')).toBeVisible({
      timeout: 15000,
    })
    await expect(page.getByText('serviços municipais')).toBeVisible()
  })

  test('exibe a seção Mais acessados e cards conhecidos', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByRole('heading', { name: 'Mais acessados' })
    ).toBeVisible()
    await expect(page.getByText('IPTU 2026')).toBeVisible()
    await expect(page.getByText('CADRio Agendamento')).toBeVisible()
  })

  test('exibe múltiplas categorias na grade de serviços', async ({ page }) => {
    await page.goto('/')
    const categoryLinks = page.getByRole('link', {
      name: /cursos|cidade|educação|família|saúde|transporte|cultura/i,
    })
    await expect(categoryLinks.first()).toBeVisible({ timeout: 20000 })
    expect(await categoryLinks.count()).toBeGreaterThanOrEqual(3)
  })

  test('não exibe a seção Carteira quando não autenticado', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(
      page.getByRole('heading', { name: 'Mais acessados' })
    ).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Carteira' })).toHaveCount(0)
  })

  test('não exibe banner de atualização de cadastro do usuário logado', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(page.getByText('Atualize seu cadastro')).toHaveCount(0)
  })
})

test.describe('Home (autenticado)', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(
      !hasE2EAuth(),
      'Defina E2E_ACCESS_TOKEN para rodar testes autenticados'
    )
    await applyE2EAuthCookies(context)
  })

  test('carrega a home com mesma estrutura base', async ({ page }) => {
    await page.goto('/')
    await expect(homeMain(page)).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Do que você precisa?' })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { level: 3, name: 'Serviços' })
    ).toBeVisible({ timeout: 20000 })
  })

  test('header não pede login e leva ao perfil', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Faça seu login')).toHaveCount(0)
    await expect(page.locator('a[href="/meu-perfil"]')).toBeVisible({
      timeout: 15000,
    })
  })

  test('link Carteira na barra inferior aponta para /carteira', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Carteira' })).toHaveAttribute(
      'href',
      '/carteira'
    )
  })

  test('exibe banner de atualização de cadastro em vez do banner de login', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(page.getByText('Atualize seu cadastro')).toBeVisible({
      timeout: 15000,
    })
    await expect(page.getByText('Acesse sua carteira e os')).toHaveCount(0)
  })

  test('exibe Carteira ou estado de carteira vazia após carregar', async ({
    page,
  }) => {
    await page.goto('/')
    const carteira = page.getByRole('heading', { name: 'Carteira' })
    const empty = page.getByText('No momento sua carteira está vazia.')
    await expect(carteira.or(empty).first()).toBeVisible({ timeout: 25000 })
  })
})
