import { type Page, expect, test } from '@playwright/test'
import {
  applyE2EAuthCookies,
  applyE2ECookieConsent,
  hasE2EAuth,
} from './fixtures/auth'

/**
 * Termos de uso — tela lista: Header Global, busca pelo nome da plataforma e os 5
 * itens levando ao detalhe. Rota pública (`/termos-de-uso` em `publicRoutes`).
 */

const PLATFORMS = [
  { name: 'PrefRio Site', href: '/termos-de-uso/prefrio-site' },
  {
    name: 'PrefRio Central Telefonica',
    href: '/termos-de-uso/prefrio-central-telefonica',
  },
  { name: 'PrefRio Whatsapp', href: '/termos-de-uso/prefrio-whatsapp' },
  { name: 'Cursos', href: '/termos-de-uso/cursos' },
  { name: 'Empregos', href: '/termos-de-uso/empregos' },
]

function platformLinks(page: Page) {
  return page.getByRole('navigation', { name: 'Plataformas' }).getByRole('link')
}

function searchBox(page: Page) {
  return page.getByRole('searchbox', { name: 'Buscar plataforma' })
}

function backgroundOf(page: Page, name: string) {
  return page
    .getByRole('button', { name })
    .evaluate(el => getComputedStyle(el).backgroundColor)
}

test.describe('Termos de uso — lista (público)', () => {
  test.beforeEach(async ({ context }) => {
    await applyE2ECookieConsent(context)
  })

  test('abre sem login, com Header Global, título, subtítulo e busca', async ({
    page,
  }) => {
    await page.goto('/termos-de-uso')

    await expect(page).toHaveURL(/\/termos-de-uso$/)
    const header = page.getByRole('banner')
    await expect(
      header.getByRole('link', { name: 'PrefRio – página inicial' })
    ).toBeVisible()
    await expect(header.getByText('Faça seu login')).toBeVisible()
    await expect(header.getByText('Menu')).toBeAttached()

    await expect(
      page.getByRole('heading', { level: 1, name: 'Termos de uso' })
    ).toBeVisible()
    await expect(
      page.getByText(
        'Encontre os termos de uso das nossas plataformas e saiba mais sobre as condições de utilização de cada serviço'
      )
    ).toBeVisible()
    await expect(searchBox(page)).toBeVisible()
  })

  test('lista as 5 plataformas na ordem do card, cada uma com o link do detalhe', async ({
    page,
  }) => {
    await page.goto('/termos-de-uso')

    const links = platformLinks(page)
    await expect(links).toHaveText(PLATFORMS.map(p => p.name))
    for (const [index, platform] of PLATFORMS.entries()) {
      await expect(links.nth(index)).toHaveAttribute('href', platform.href)
    }
  })

  test('a busca filtra pelo nome, sem diferenciar acento nem caixa', async ({
    page,
  }) => {
    await page.goto('/termos-de-uso')
    const search = searchBox(page)

    await search.fill('prefrio')
    await expect(platformLinks(page)).toHaveText([
      'PrefRio Site',
      'PrefRio Central Telefonica',
      'PrefRio Whatsapp',
    ])

    await search.fill('TELEFÔNICA')
    await expect(platformLinks(page)).toHaveText(['PrefRio Central Telefonica'])

    await search.fill('ouvidoria')
    await expect(platformLinks(page)).toHaveCount(0)
    await expect(page.getByRole('status')).toHaveText(
      'Nenhuma plataforma encontrada para “ouvidoria”.'
    )

    await search.fill('')
    await expect(platformLinks(page)).toHaveCount(PLATFORMS.length)
  })

  test('o X do design system limpa a busca, sem o X nativo do navegador', async ({
    page,
  }) => {
    await page.goto('/termos-de-uso')
    const search = searchBox(page)
    const clear = page.getByRole('button', { name: 'Limpar busca' })

    await expect(clear).toHaveCount(0)
    await search.fill('whats')
    await expect(platformLinks(page)).toHaveText(['PrefRio Whatsapp'])

    // O Chrome não expõe `::-webkit-search-cancel-button` no getComputedStyle
    // (sempre devolve "block"), então procuramos a regra `display: none` que
    // casa com este input.
    const isNativeCancelHidden = await search.evaluate(input => {
      const PSEUDO = '::-webkit-search-cancel-button'
      // CSSStyleRule também tem `cssRules` (CSS nesting): mantém a própria
      // regra além das filhas, senão ela some do achatamento.
      const flatten = (rule: CSSRule): CSSRule[] => [
        rule,
        ...('cssRules' in rule
          ? [...(rule as CSSGroupingRule).cssRules].flatMap(flatten)
          : []),
      ]
      return [...document.styleSheets].some(sheet => {
        let rules: CSSRule[]
        try {
          rules = [...sheet.cssRules].flatMap(flatten)
        } catch {
          return false
        }
        return rules.some(
          rule =>
            rule instanceof CSSStyleRule &&
            rule.selectorText.endsWith(PSEUDO) &&
            rule.style.display === 'none' &&
            input.matches(rule.selectorText.slice(0, -PSEUDO.length))
        )
      })
    })
    expect(isNativeCancelHidden).toBe(true)

    await clear.click()
    await expect(search).toHaveValue('')
    await expect(search).toBeFocused()
    await expect(platformLinks(page)).toHaveCount(PLATFORMS.length)
    await expect(clear).toHaveCount(0)
  })

  test('tocar num item navega para o detalhe daquela plataforma', async ({
    page,
  }) => {
    await page.goto('/termos-de-uso')

    await platformLinks(page).filter({ hasText: 'Cursos' }).click()
    await page.waitForURL('**/termos-de-uso/cursos')
  })

  test('voltar retorna à página anterior do site', async ({
    page,
    baseURL,
  }) => {
    await page.goto('/servicos')
    await page.goto('/termos-de-uso', { referer: `${baseURL}/servicos` })

    await page.getByRole('button', { name: 'Voltar' }).click()
    await page.waitForURL(/\/servicos$/)
  })

  test('voltar em acesso direto leva para a home, sem sair do site', async ({
    page,
  }) => {
    await page.goto('/termos-de-uso')

    await page.getByRole('button', { name: 'Voltar' }).click()
    await page.waitForURL(url => url.pathname === '/')
  })

  test('voltar muda de default para focused no hover (desktop)', async ({
    page,
  }) => {
    await page.goto('/termos-de-uso')
    const back = page.getByRole('button', { name: 'Voltar' })
    await expect(back).toBeVisible()

    await page.mouse.move(0, 0)
    const idle = await backgroundOf(page, 'Voltar')
    await back.hover()
    await expect.poll(() => backgroundOf(page, 'Voltar')).not.toBe(idle)
  })
})

test.describe('Termos de uso — lista (autenticado)', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(!hasE2EAuth(), 'E2E_ACCESS_TOKEN não configurado')
    await applyE2EAuthCookies(context)
  })

  test('logado também abre a lista, sem redirecionar', async ({ page }) => {
    await page.goto('/termos-de-uso')

    await expect(page).toHaveURL(/\/termos-de-uso$/)
    await expect(
      page.getByRole('heading', { level: 1, name: 'Termos de uso' })
    ).toBeVisible()
    await expect(platformLinks(page)).toHaveCount(PLATFORMS.length)
  })
})

test.describe('Termos de uso — mobile 360px', () => {
  test.use({ viewport: { width: 360, height: 780 } })

  test.beforeEach(async ({ context }) => {
    await applyE2ECookieConsent(context)
  })

  test('margens de 16px e sem rolagem horizontal', async ({ page }) => {
    await page.goto('/termos-de-uso')
    const first = platformLinks(page).first()
    await expect(first).toBeVisible()

    for (const target of [first, page.getByRole('search')]) {
      const box = await target.boundingBox()
      expect(box?.x).toBe(16)
      expect(Math.round(360 - ((box?.x ?? 0) + (box?.width ?? 0)))).toBe(16)
    }

    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth
    )
    expect(scrollWidth).toBeLessThanOrEqual(360)
  })
})
