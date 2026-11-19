import { type Page, expect, test } from '@playwright/test'
import { applyE2ECookieConsent } from './fixtures/auth'

/**
 * Carta de Serviços ao Usuário (Lei 13.460): footer → listagem de órgãos → tela do
 * órgão → PDF da carta (aberto em aba nova). Roda contra a app-catalogo de staging, sem mock; o órgão
 * é o primeiro da lista (não fixamos sigla para não quebrar quando o dado mudar).
 */

const ORG_LABEL = /^.+ - .+$/
// --foreground (#09090b) no tema claro.
const FOREGROUND = 'rgb(9, 9, 11)'

function orgLinks(page: Page) {
  return page.getByRole('main').getByRole('listitem').getByRole('link')
}

test.describe('Carta de serviços (público)', () => {
  test.beforeEach(async ({ context }) => {
    await applyE2ECookieConsent(context)
  })

  test('o footer leva à listagem, que lista os órgãos em ordem alfabética', async ({
    page,
  }) => {
    await page.goto('/')

    const footer = page.getByRole('contentinfo')
    // Links rápidos do footer (redesign do #803): Serviços abre a lista e
    // Carta de serviços vem depois.
    const menuLinks = footer.getByRole('link', {
      name: /^(Serviços|Carta de serviços)$/,
    })
    await expect(menuLinks).toHaveText(['Serviços', 'Carta de serviços'])

    await footer.getByRole('link', { name: 'Carta de serviços' }).click()
    await page.waitForURL('**/carta-de-servicos')

    await expect(
      page.getByRole('heading', { level: 1, name: 'Carta de serviços' })
    ).toBeVisible()

    const links = orgLinks(page)
    await expect(links.first()).toBeVisible({ timeout: 20_000 })
    const labels = await links.allTextContents()
    expect(labels.length).toBeGreaterThan(0)
    for (const label of labels) expect(label).toMatch(ORG_LABEL)
    expect(labels).toEqual(
      [...labels].sort((a, b) =>
        a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })
      )
    )
    await expect(page.getByText(/todas as secretarias/i)).toHaveCount(0)
  })

  test('listagem: título de seção, chevron nos cards e títulos na cor foreground', async ({
    page,
  }) => {
    await page.goto('/carta-de-servicos')

    await expect(
      page.getByRole('heading', { level: 1, name: 'Carta de serviços' })
    ).toHaveCSS('color', FOREGROUND)
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: 'Cartas de serviços por Órgão',
      })
    ).toBeVisible()

    const first = orgLinks(page).first()
    await expect(first).toBeVisible({ timeout: 20_000 })
    const chevron = first.locator('svg')
    await expect(chevron).toBeVisible()
    const [cardBox, labelBox, chevronBox] = await Promise.all([
      first.boundingBox(),
      first.locator('span').first().boundingBox(),
      chevron.boundingBox(),
    ])
    // Chevron à direita do nome, encostado no padding (16px) do card.
    expect(chevronBox?.x ?? 0).toBeGreaterThan(
      (labelBox?.x ?? 0) + (labelBox?.width ?? 0)
    )
    expect(
      Math.round(
        (cardBox?.x ?? 0) +
          (cardBox?.width ?? 0) -
          ((chevronBox?.x ?? 0) + (chevronBox?.width ?? 0))
      )
    ).toBe(16)
  })

  test('"Ver mais" expande o texto da Lei e vira "Ver menos"', async ({
    page,
  }) => {
    await page.goto('/carta-de-servicos')

    await expect(
      page.getByText(/o PrefRio permite que os cidadãos/)
    ).toHaveCount(0)
    await page.getByRole('button', { name: 'Ver mais' }).click()
    await expect(
      page.getByText(/o PrefRio permite que os cidadãos/)
    ).toBeVisible()

    await page.getByRole('button', { name: 'Ver menos' }).click()
    await expect(page.getByRole('button', { name: 'Ver mais' })).toBeVisible()
    await expect(
      page.getByText(/o PrefRio permite que os cidadãos/)
    ).toHaveCount(0)
  })

  test('abre a carta do órgão em PDF numa aba nova', async ({ page }) => {
    test.setTimeout(120_000)
    await page.goto('/carta-de-servicos')

    const first = orgLinks(page).first()
    await expect(first).toBeVisible({ timeout: 20_000 })
    const label = (await first.textContent()) ?? ''
    await first.click()
    await page.waitForURL(/\/carta-de-servicos\/[^/]+$/)

    const title = page.getByRole('heading', { level: 1 })
    await expect(title).toHaveText(label)
    await expect(title).toHaveCSS('color', FOREGROUND)
    await expect(
      page.getByRole('heading', { level: 2, name: 'Serviços relacionados' })
    ).toBeVisible()
    const services = page.getByRole('main').getByRole('listitem')
    await expect(services.first()).toBeVisible()

    const carta = page.getByRole('link', {
      name: /^Visualizar Carta de Serviços/,
    })
    const href = await carta.getAttribute('href')
    expect(href).toMatch(/^\/api\/carta-de-servicos\/[^/]+\/pdf$/)

    // Chromium headless não tem visualizador de PDF: a aba nova viraria download.
    // Para checar o clique de verdade, a rota responde um HTML só nesta etapa.
    const pdfRoute = '**/api/carta-de-servicos/*/pdf'
    await page.context().route(pdfRoute, route =>
      route.fulfill({
        contentType: 'text/html',
        body: '<title>carta</title>',
      })
    )
    const orgUrl = page.url()
    const popupPromise = page.waitForEvent('popup')
    await carta.click()
    const popup = await popupPromise
    await popup.waitForLoadState()
    expect(new URL(popup.url()).pathname).toBe(href)
    // A tela do órgão continua aberta na aba original.
    expect(page.url()).toBe(orgUrl)
    await popup.close()
    await page.context().unroute(pdfRoute)

    // O conteúdo é conferido direto na rota (APIRequestContext não passa pelo route).
    const response = await page.request.get(href ?? '', { timeout: 90_000 })
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toBe('application/pdf')

    const sigla = label.split(' - ').pop() ?? ''
    const siglaSlug = sigla
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    expect(response.headers()['content-disposition']).toBe(
      `inline; filename="carta-de-servicos-${siglaSlug}.pdf"`
    )
    const bytes = await response.body()
    expect(bytes.subarray(0, 5).toString()).toBe('%PDF-')
    expect(bytes.length).toBeGreaterThan(1_000)
  })
})

test.describe('Carta de serviços — mobile 360px', () => {
  test.use({ viewport: { width: 360, height: 780 } })

  test.beforeEach(async ({ context }) => {
    await applyE2ECookieConsent(context)
  })

  test('margens de 16px e sem rolagem horizontal', async ({ page }) => {
    await page.goto('/carta-de-servicos')
    const first = orgLinks(page).first()
    await expect(first).toBeVisible({ timeout: 20_000 })

    const box = await first.boundingBox()
    expect(box?.x).toBe(16)
    expect(Math.round(360 - ((box?.x ?? 0) + (box?.width ?? 0)))).toBe(16)

    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth
    )
    expect(scrollWidth).toBeLessThanOrEqual(360)
  })
})
