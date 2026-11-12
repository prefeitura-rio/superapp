import { readFile } from 'node:fs/promises'
import { type Page, expect, test } from '@playwright/test'
import { applyE2ECookieConsent } from './fixtures/auth'

/**
 * Carta de Serviços ao Usuário (Lei 13.460): footer → listagem de órgãos → tela do
 * órgão → download do PDF. Roda contra a app-catalogo de staging, sem mock; o órgão
 * é o primeiro da lista (não fixamos sigla para não quebrar quando o dado mudar).
 */

const ORG_LABEL = /^.+ - .+$/

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
    const menuLinks = footer.getByRole('link', {
      name: /^(Página inicial|Serviços|Carta de serviços)$/,
    })
    await expect(menuLinks).toHaveText([
      'Página inicial',
      'Serviços',
      'Carta de serviços',
    ])

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

  test('baixa a carta do órgão em PDF', async ({ page }) => {
    test.setTimeout(120_000)
    await page.goto('/carta-de-servicos')

    const first = orgLinks(page).first()
    await expect(first).toBeVisible({ timeout: 20_000 })
    const label = (await first.textContent()) ?? ''
    await first.click()
    await page.waitForURL(/\/carta-de-servicos\/[^/]+$/)

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(label)
    const services = page.getByRole('main').getByRole('listitem')
    await expect(services.first()).toBeVisible()

    const sigla = label.split(' - ').pop() ?? ''
    const downloadPromise = page.waitForEvent('download', { timeout: 90_000 })
    await page.getByRole('link', { name: 'Baixar documento' }).click()
    const download = await downloadPromise

    expect(download.suggestedFilename()).toMatch(
      /^carta-de-servicos-[a-z0-9-]+\.pdf$/
    )
    const siglaSlug = sigla
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    expect(download.suggestedFilename()).toBe(
      `carta-de-servicos-${siglaSlug}.pdf`
    )
    const path = await download.path()
    const bytes = await readFile(path)
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
