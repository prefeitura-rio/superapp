import { type Page, expect, test } from '@playwright/test'
import {
  applyE2EAuthCookies,
  applyE2ECookieConsent,
  hasE2EAuth,
} from './fixtures/auth'
import { secondaryStateRules } from './fixtures/button-states'

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
    await expect(
      page.getByRole('heading', { level: 1, name: 'Termos de uso: Cursos' })
    ).toBeVisible()
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

  test('logado também abre o detalhe e volta para a lista, sem redirecionar', async ({
    page,
  }) => {
    await page.goto('/termos-de-uso')
    await platformLinks(page).getByText('Empregos', { exact: true }).click()
    await page.waitForURL('**/termos-de-uso/empregos')

    await expect(detailHeading(page, 'Empregos')).toBeVisible()
    await expect(page.getByText(LAST_UPDATE)).toBeVisible()
    // Header Global no estado logado: sem o convite de login.
    await expect(
      page.getByRole('banner').getByText('Faça seu login')
    ).toHaveCount(0)

    await page.getByRole('link', { name: 'Voltar para Termos de uso' }).click()
    await page.waitForURL(/\/termos-de-uso$/)
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

const LAST_UPDATE = 'Última atualização: Abril de 2026 - Versão 1.0'

function detailHeading(page: Page, name: string) {
  return page.getByRole('heading', { level: 1, name: `Termos de uso: ${name}` })
}

test.describe('Termos de uso — detalhe (público)', () => {
  test.beforeEach(async ({ context }) => {
    await applyE2ECookieConsent(context)
  })

  for (const platform of PLATFORMS) {
    test(`${platform.name}: a lista abre o detalhe com título próprio e o voltar retorna à lista`, async ({
      page,
    }) => {
      await page.goto('/termos-de-uso')
      await platformLinks(page)
        .getByText(platform.name, { exact: true })
        .click()
      await page.waitForURL(`**${platform.href}`)

      await expect(page).toHaveTitle(`Termos de uso: ${platform.name}`)
      await expect(detailHeading(page, platform.name)).toBeVisible()
      await expect(page.getByText(LAST_UPDATE)).toBeVisible()
      await expect(
        page.getByRole('heading', { name: '1. Da ciência do Termo de uso' })
      ).toBeVisible()

      await page
        .getByRole('link', { name: 'Voltar para Termos de uso' })
        .click()
      await page.waitForURL(/\/termos-de-uso$/)
      await expect(
        page.getByRole('heading', { level: 1, name: 'Termos de uso' })
      ).toBeVisible()
    })
  }

  test('mostra o texto completo: Termo de Uso e Aviso de Privacidade até o Foro', async ({
    page,
  }) => {
    await page.goto('/termos-de-uso/prefrio-site')
    const article = page.getByRole('article')

    await expect(article.getByRole('heading', { level: 2 })).toHaveCount(10)
    await expect(article.getByRole('heading', { level: 3 })).toHaveCount(15)
    await expect(
      article.getByRole('heading', {
        name: 'II. Aviso de Privacidade – Plataforma Pref.Rio',
      })
    ).toBeVisible()

    const foro = article.getByRole('heading', { name: '15. Foro' })
    await foro.scrollIntoViewIfNeeded()
    await expect(foro).toBeVisible()
    await expect(
      article.getByText(/renunciando as partes desde já a qualquer outro/)
    ).toBeVisible()
  })

  test('voltar do detalhe em acesso direto também vai para a lista', async ({
    page,
  }) => {
    await page.goto('/termos-de-uso/empregos')

    await page.getByRole('link', { name: 'Voltar para Termos de uso' }).click()
    await page.waitForURL(/\/termos-de-uso$/)
  })

  test('plataforma inexistente responde 404', async ({ page }) => {
    const response = await page.goto('/termos-de-uso/ouvidoria')

    expect(response?.status()).toBe(404)
    await expect(page.getByText('Página não encontrada')).toBeVisible()
  })

  test('voltar do detalhe muda de default para focused no hover (desktop)', async ({
    page,
  }) => {
    await page.goto('/termos-de-uso/cursos')
    const back = page.getByRole('link', { name: 'Voltar para Termos de uso' })
    await expect(back).toBeVisible()
    const bgOf = () => back.evaluate(el => getComputedStyle(el).backgroundColor)

    await page.mouse.move(0, 0)
    const idle = await bgOf()
    await back.hover()
    await expect.poll(bgOf).not.toBe(idle)
  })

  test('desktop: conteúdo limitado a 896px', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/termos-de-uso/cursos')
    await expect(detailHeading(page, 'Cursos')).toBeVisible()

    const main = await page.getByRole('main').boundingBox()
    expect(main?.width).toBe(896)
  })
})

test.describe('Termos de uso — detalhe mobile 360px', () => {
  test.use({ viewport: { width: 360, height: 780 } })

  test.beforeEach(async ({ context }) => {
    await applyE2ECookieConsent(context)
  })

  test('margens de 16px e sem rolagem horizontal', async ({ page }) => {
    await page.goto('/termos-de-uso/prefrio-whatsapp')
    const heading = detailHeading(page, 'PrefRio Whatsapp')
    await expect(heading).toBeVisible()

    const firstParagraph = page.getByRole('article').locator('p').first()
    for (const target of [heading, firstParagraph]) {
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

/**
 * Conteúdo provisório: as 5 plataformas exibem o texto atual (Termo de Uso +
 * Aviso de Privacidade v1.0), igual ao de /servicos/trabalho/termos-de-uso, que
 * é o que o staging publica. Compara com a página servida pelo mesmo app, sem
 * depender de rede externa.
 */
test.describe('Termos de uso — texto atual em todas as plataformas', () => {
  const VERSION_LINE = /^(Última atualização: )?Abril de 2026 - Versão 1\.0$/

  interface DocumentTexts {
    body: string[]
    headings: string[]
  }

  async function readTexts(page: Page, scope: 'article' | 'trabalho') {
    return page.evaluate(
      ([target, versionSource]): DocumentTexts => {
        const clean = (el: Element) =>
          (el.textContent ?? '').replace(/\s+/g, ' ').trim()
        let root: Element | null
        if (target === 'article') {
          root = document.querySelector('article')
        } else {
          // Menor bloco que contém o documento inteiro, do "I. TERMO DE USO" ao Foro.
          root =
            [...document.querySelectorAll('h1')].find(h1 =>
              clean(h1).startsWith('I. TERMO DE USO')
            ) ?? null
          while (root && !clean(root).includes('15. FORO')) {
            root = root.parentElement
          }
        }
        if (!root) throw new Error(`documento não encontrado em ${target}`)
        const version = new RegExp(versionSource)
        return {
          body: [...root.querySelectorAll('p, li')]
            .map(clean)
            .filter(text => text && !version.test(text)),
          headings: [...root.querySelectorAll('h1, h2, h3')].map(clean),
        }
      },
      [scope, VERSION_LINE.source] as const
    )
  }

  let reference: DocumentTexts

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext()
    await applyE2ECookieConsent(context)
    const page = await context.newPage()
    await page.goto('/servicos/trabalho/termos-de-uso')
    await expect(
      page.getByRole('heading', {
        name: 'I. TERMO DE USO - PLATAFORMA PREF.RIO',
      })
    ).toBeVisible()
    reference = await readTexts(page, 'trabalho')
    await context.close()
  })

  test.beforeEach(async ({ context }) => {
    await applyE2ECookieConsent(context)
  })

  for (const platform of PLATFORMS) {
    test(`${platform.name}: exibe integralmente o texto atual, v1.0 de abril de 2026`, async ({
      page,
    }) => {
      await page.goto(platform.href)
      await expect(detailHeading(page, platform.name)).toBeVisible()
      await expect(page.getByText(LAST_UPDATE)).toBeVisible()

      const texts = await readTexts(page, 'article')

      expect(reference.body.length).toBeGreaterThan(100)
      expect(texts.body).toEqual(reference.body)
      // O 1º h1 da referência vira o título da página; os demais mudam só de caixa.
      expect(
        texts.headings.map(text => text.toLocaleUpperCase('pt-BR'))
      ).toEqual(reference.headings.slice(1).map(text => text.replace(/:$/, '')))
    })
  }
})

/**
 * Header Global PrefRio (PREF-525) nas duas telas: logo à esquerda, Perfil e
 * Menu à direita, sem header próprio; o voltar do handoff fica abaixo dele.
 */
const SCREENS = [
  {
    name: 'lista',
    path: '/termos-de-uso',
    back: { role: 'button', name: 'Voltar' },
  },
  {
    name: 'detalhe',
    path: '/termos-de-uso/prefrio-site',
    back: { role: 'link', name: 'Voltar para Termos de uso' },
  },
] as const

function backControl(page: Page, screen: (typeof SCREENS)[number]) {
  return page.getByRole(screen.back.role, {
    name: screen.back.name,
    exact: true,
  })
}

async function expectBackBelowHeader(
  page: Page,
  screen: (typeof SCREENS)[number]
) {
  const header = await page.getByRole('banner').boundingBox()
  const back = await backControl(page, screen).boundingBox()
  expect(header && back && back.y >= header.y + header.height).toBe(true)
}

test.describe('Termos de uso — Header Global (público)', () => {
  test.beforeEach(async ({ context }) => {
    await applyE2ECookieConsent(context)
  })

  for (const screen of SCREENS) {
    test(`${screen.name}: Header Global com logo, login e Menu; voltar abaixo dele`, async ({
      page,
    }) => {
      await page.goto(screen.path)
      await expect(page.getByRole('banner')).toHaveCount(1)
      const banner = page.getByRole('banner')

      await expect(
        banner.getByRole('link', { name: 'PrefRio – página inicial' })
      ).toHaveAttribute('href', '/')
      const login = banner.getByRole('link', { name: 'Faça seu login' })
      const href = (await login.getAttribute('href')) ?? ''
      // Visitante: o Perfil leva ao login do Identidade Carioca...
      expect(new URL(href).pathname).toMatch(/\/auth$/)
      expect(new URL(href).origin).not.toBe(new URL(page.url()).origin)
      // ...e o Menu abre o menu global.
      await expect(
        banner.getByRole('button', { name: 'Menu', exact: true })
      ).toHaveAttribute('aria-haspopup', 'dialog')
      // Header próprio de módulo (ex.: faixa Oportunidades Cariocas) não aparece.
      await expect(
        page.getByRole('navigation', { name: 'Oportunidades Cariocas' })
      ).toHaveCount(0)

      await expectBackBelowHeader(page, screen)
    })

    test(`${screen.name}: a logo do Header Global leva à home`, async ({
      page,
    }) => {
      await page.goto(screen.path)
      await page
        .getByRole('banner')
        .getByRole('link', { name: 'PrefRio – página inicial' })
        .click()
      await page.waitForURL(url => url.pathname === '/')
    })
  }

  test('o Header Global é o mesmo na lista e no detalhe', async ({ page }) => {
    const controlsOf = async (path: string) => {
      await page.goto(path)
      // Espera o fim do carregamento do Perfil (antes dele há só esqueletos).
      await expect(
        page.getByRole('banner').getByRole('link', { name: 'Faça seu login' })
      ).toBeVisible()
      return page
        .getByRole('banner')
        .locator('a, button')
        .evaluateAll(elements =>
          elements.map(el => ({
            tag: el.tagName,
            name: (
              el.getAttribute('aria-label') ??
              el.textContent ??
              ''
            ).trim(),
            href: el.getAttribute('href'),
          }))
        )
    }

    const list = await controlsOf(SCREENS[0].path)
    const detail = await controlsOf(SCREENS[1].path)
    expect(list.length).toBe(3)
    expect(detail).toEqual(list)
  })
})

test.describe('Termos de uso — Header Global (autenticado)', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(!hasE2EAuth(), 'E2E_ACCESS_TOKEN não configurado')
    await applyE2EAuthCookies(context)
  })

  for (const screen of SCREENS) {
    test(`${screen.name}: logado, o Perfil leva ao meu perfil e o Menu aparece`, async ({
      page,
    }) => {
      await page.goto(screen.path)
      const banner = page.getByRole('banner')

      await expect(
        banner.getByRole('link', { name: 'PrefRio – página inicial' })
      ).toBeVisible()
      await expect(banner.locator('a[href="/meu-perfil"]')).toBeVisible()
      await expect(banner.getByText('Faça seu login')).toHaveCount(0)
      await expect(banner.getByText('Menu', { exact: true })).toBeAttached()

      await expectBackBelowHeader(page, screen)
      await backControl(page, screen).click()
      if (screen.name === 'detalhe') await page.waitForURL(/\/termos-de-uso$/)
      else await page.waitForURL(url => url.pathname === '/')
    })
  }
})

/**
 * Responsividade fiel ao Figma (seção Responsividade das duas telas):
 * mobile 360px com margem de 16px e desktop com conteúdo de 896px; distâncias
 * medidas no handoff (voltar → título 24, título colado ao subtítulo,
 * subtítulo → busca 16, busca com 56 de altura, itens de 14px etc.).
 */
interface Box {
  top: number
  bottom: number
  left: number
  width: number
  height: number
}

async function box(locator: ReturnType<Page['locator']>): Promise<Box> {
  return locator.evaluate(el => {
    const r = el.getBoundingClientRect()
    return {
      top: r.top,
      bottom: r.bottom,
      left: r.left,
      width: r.width,
      height: r.height,
    }
  })
}

const VIEWPORTS = [
  {
    name: 'mobile 360px',
    width: 360,
    height: 780,
    contentLeft: 16,
    contentWidth: 328,
  },
  // Mesma largura do frame desktop do Figma (1450px).
  {
    name: 'desktop',
    width: 1450,
    height: 900,
    contentLeft: (1450 - 896) / 2 + 16,
    contentWidth: 864,
  },
] as const

for (const viewport of VIEWPORTS) {
  test.describe(`Termos de uso — fiel ao Figma (${viewport.name})`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } })

    test.beforeEach(async ({ context }) => {
      await applyE2ECookieConsent(context)
    })

    test('lista: margens, distâncias e tamanhos do handoff', async ({
      page,
    }) => {
      await page.goto('/termos-de-uso')
      const main = page.getByRole('main')
      const back = await box(page.getByRole('button', { name: 'Voltar' }))
      const h1 = await box(main.getByRole('heading', { level: 1 }))
      const sub = await box(main.locator('h1 + p'))
      const search = await box(page.getByRole('search'))
      const items = page
        .getByRole('navigation', { name: 'Plataformas' })
        .getByRole('link')
      await expect(items).toHaveCount(5)
      const first = await box(items.first())

      expect((await box(main)).width).toBe(Math.min(viewport.width, 896))
      for (const b of [h1, search, first]) {
        expect(b.left).toBe(viewport.contentLeft)
        expect(b.width).toBe(viewport.contentWidth)
      }
      expect(back).toMatchObject({
        left: viewport.contentLeft,
        width: 44,
        height: 44,
      })
      expect(h1.top - back.bottom).toBe(24)
      expect(sub.top).toBe(h1.bottom)
      expect(search.top - sub.bottom).toBe(16)
      expect(search.height).toBe(56)
      expect(first.top - search.bottom).toBe(8)

      for (const item of await items.all()) {
        const { height } = await box(item)
        // Handoff: linha de 60px + respiro antes da divisória = 64–68px por item.
        expect(height).toBeGreaterThanOrEqual(64)
        expect(height).toBeLessThanOrEqual(68)
        const label = item.getByText((await item.textContent()) ?? '', {
          exact: true,
        })
        await expect(label).toHaveCSS('font-size', '14px')
      }
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth)
      ).toBeLessThanOrEqual(viewport.width)
    })

    test('detalhe: margens, distâncias e tipografia do handoff', async ({
      page,
    }) => {
      await page.goto('/termos-de-uso/prefrio-site')
      const main = page.getByRole('main')
      const back = await box(
        page.getByRole('link', { name: 'Voltar para Termos de uso' })
      )
      const h1 = await box(main.getByRole('heading', { level: 1 }))
      const sub = await box(main.locator('h1 + p'))
      const article = page.getByRole('article')
      const sections = article.locator('section')
      const s1 = await box(sections.nth(0))
      const s2 = await box(sections.nth(1))

      expect((await box(main)).width).toBe(Math.min(viewport.width, 896))
      expect(h1.left).toBe(viewport.contentLeft)
      expect(h1.width).toBe(viewport.contentWidth)
      expect(h1.top - back.bottom).toBe(24)
      expect(sub.top).toBe(h1.bottom)
      expect((await box(article)).top - sub.bottom).toBe(20)
      expect(s2.top - s1.bottom).toBe(28)

      // Corpo: título da seção 16px medium; texto 14px na cor foreground-light.
      const sectionTitle = sections.nth(0).getByRole('heading')
      await expect(sectionTitle).toHaveCSS('font-size', '16px')
      await expect(sectionTitle).toHaveCSS('font-weight', '500')
      const paragraph = sections.nth(0).locator('p').first()
      await expect(paragraph).toHaveCSS('font-size', '14px')
      const foregroundLight = await page.evaluate(() => {
        const probe = document.createElement('span')
        probe.style.color = 'var(--foreground-light)'
        document.body.append(probe)
        const color = getComputedStyle(probe).color
        probe.remove()
        return color
      })
      await expect(paragraph).toHaveCSS('color', foregroundLight)
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth)
      ).toBeLessThanOrEqual(viewport.width)
    })
  })
}

/**
 * Estados dos botões (seção Comportamento): default → focused no hover do
 * desktop e enquanto pressionado no toque. O Tailwind põe `hover:` dentro de
 * `@media (hover: hover)` e `active:` sem condição.
 */
const STATE_CONTROLS = [
  {
    screen: '/termos-de-uso',
    name: 'voltar da lista',
    get: (page: Page) => page.getByRole('button', { name: 'Voltar' }),
  },
  {
    screen: '/termos-de-uso/cursos',
    name: 'voltar do detalhe',
    get: (page: Page) =>
      page.getByRole('link', { name: 'Voltar para Termos de uso' }),
  },
  {
    screen: '/termos-de-uso',
    name: 'Menu do Header Global',
    get: (page: Page) =>
      page
        .getByRole('banner')
        .getByRole('button', { name: 'Menu', exact: true }),
  },
  {
    screen: '/termos-de-uso/cursos',
    name: 'Perfil do Header Global',
    get: (page: Page) =>
      page
        .getByRole('banner')
        .getByRole('link', { name: 'Faça seu login' })
        .locator('div'),
  },
] as const

test.describe('Termos de uso — estados dos botões no desktop (hover)', () => {
  test.beforeEach(async ({ context }) => {
    await applyE2ECookieConsent(context)
  })

  for (const control of STATE_CONTROLS) {
    test(`${control.name}: default → focused ao passar o mouse`, async ({
      page,
    }) => {
      await page.goto(control.screen)
      const target = control.get(page)
      await expect(target).toBeVisible()
      const bg = () =>
        target.evaluate(el => getComputedStyle(el).backgroundColor)

      await page.mouse.move(0, 0)
      const idle = await bg()
      await target.hover()
      await expect.poll(bg).not.toBe(idle)
      expect(await secondaryStateRules(target)).toEqual({
        hover: true,
        active: true,
      })
    })
  }
})

test.describe('Termos de uso — estados dos botões no toque (mobile)', () => {
  test.use({
    viewport: { width: 360, height: 780 },
    hasTouch: true,
    isMobile: true,
  })

  test.beforeEach(async ({ context }) => {
    await applyE2ECookieConsent(context)
  })

  for (const control of STATE_CONTROLS) {
    test(`${control.name}: sem hover no toque; focused enquanto pressionado`, async ({
      page,
    }) => {
      await page.goto(control.screen)
      const target = control.get(page)
      await expect(target).toBeVisible()

      expect(
        await page.evaluate(() => matchMedia('(hover: hover)').matches)
      ).toBe(false)
      expect(await secondaryStateRules(target)).toEqual({
        hover: false,
        active: true,
      })

      const bg = () =>
        target.evaluate(el => getComputedStyle(el).backgroundColor)
      const idle = await bg()
      const box = await target.boundingBox()
      if (!box) throw new Error(`${control.name} sem bounding box`)

      // Ponteiro em cima sem pressionar: no toque não existe hover, nada muda.
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
      await page.waitForTimeout(400)
      expect(await bg()).toBe(idle)

      // Pressionado: focused. (O toque emulado do headless não aplica :active;
      // o mouse.down aplica, e com hover desligado isola o estado pressionado.)
      // Sem mouse.up: soltar navegaria para outra página.
      await page.mouse.down()
      await expect.poll(bg).not.toBe(idle)
    })
  }
})

test.describe('Termos de uso — busca com estado focused', () => {
  test.beforeEach(async ({ context }) => {
    await applyE2ECookieConsent(context)
  })

  test('tocar/clicar na busca abre a digitação e destaca o campo', async ({
    page,
  }) => {
    await page.goto('/termos-de-uso')
    const field = page.getByRole('search')
    const ring = () => field.evaluate(el => getComputedStyle(el).boxShadow)

    expect(await ring()).toBe('none')
    await searchBox(page).click()
    await expect(searchBox(page)).toBeFocused()
    await expect.poll(ring).not.toBe('none')

    await page.keyboard.press('Tab')
    await expect.poll(ring).toBe('none')
  })
})

test.describe('Termos de uso — Menu logado (desktop)', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(!hasE2EAuth(), 'E2E_ACCESS_TOKEN não configurado')
    await applyE2EAuthCookies(context)
  })

  test('o botão Menu logado também muda para focused no hover', async ({
    page,
  }) => {
    await page.goto('/termos-de-uso')
    const menu = page
      .getByRole('banner')
      .getByRole('button', { name: 'Menu', exact: true })
    await expect(menu).toBeVisible()
    const bg = () => menu.evaluate(el => getComputedStyle(el).backgroundColor)

    await page.mouse.move(0, 0)
    const idle = await bg()
    await menu.hover()
    await expect.poll(bg).not.toBe(idle)
  })
})

// ---------------------------------------------------------------------------
// MENU GLOBAL → LISTA → DETALHE → VOLTAR
// ---------------------------------------------------------------------------

async function openTermosFromGlobalMenu(page: Page) {
  // Primeiro <header>, não role=banner: na home o header fica dentro do <main>.
  await page
    .locator('header')
    .first()
    .getByRole('button', { name: 'Menu', exact: true })
    .click()
  const menu = page.getByRole('dialog', { name: 'Menu' })
  await expect(menu).toBeVisible()
  // Item de primeiro nível no handoff: Termos de uso e Política de
  // Privacidade são um documento só.
  const termos = menu.getByRole('link', {
    name: 'Termos de uso e política de privacidade',
  })
  await expect(termos).toHaveAttribute('href', '/termos-de-uso')
  await expect(
    menu.getByRole('link', { name: /^Política de Privacidade/ })
  ).toHaveCount(0)
  await termos.click()
  await page.waitForURL(url => url.pathname === '/termos-de-uso')
  await expect(page.getByRole('dialog')).toHaveCount(0)
}

async function expectListThenDetailThenBack(page: Page) {
  await expect(
    page.getByRole('heading', { level: 1, name: 'Termos de uso' })
  ).toBeVisible()
  await expect(platformLinks(page)).toHaveCount(PLATFORMS.length)

  await platformLinks(page).getByText('Cursos', { exact: true }).click()
  await page.waitForURL('**/termos-de-uso/cursos')
  await expect(detailHeading(page, 'Cursos')).toBeVisible()

  await page.getByRole('link', { name: 'Voltar para Termos de uso' }).click()
  await page.waitForURL(url => url.pathname === '/termos-de-uso')
  await expect(platformLinks(page)).toHaveCount(PLATFORMS.length)
}

test.describe('Termos de uso — pelo menu global (público)', () => {
  test.beforeEach(async ({ context }) => {
    await applyE2ECookieConsent(context)
  })

  for (const start of ['/', '/servicos', '/servicos/trabalho']) {
    test(`de ${start}: Menu → Termos de uso → lista → detalhe → voltar`, async ({
      page,
    }) => {
      await page.goto(start)
      await openTermosFromGlobalMenu(page)
      await expectListThenDetailThenBack(page)
    })
  }

  test('o menu global também abre dentro dos Termos de uso', async ({
    page,
  }) => {
    await page.goto('/termos-de-uso/empregos')
    await openTermosFromGlobalMenu(page)
    await expectListThenDetailThenBack(page)
  })

  test('mobile 360px: Menu → Termos de uso → lista → detalhe → voltar', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 760 })
    await page.goto('/')
    await openTermosFromGlobalMenu(page)
    await expectListThenDetailThenBack(page)
  })
})

test.describe('Termos de uso — pelo menu global (autenticado)', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(!hasE2EAuth(), 'E2E_ACCESS_TOKEN não configurado')
    await applyE2EAuthCookies(context)
  })

  test('logado: Menu → Termos de uso → lista → detalhe → voltar', async ({
    page,
  }) => {
    await page.goto('/')
    await openTermosFromGlobalMenu(page)
    await expectListThenDetailThenBack(page)
  })
})

// ---------------------------------------------------------------------------
// MEU CURRÍCULO (EMPREGOS) → TERMOS DE USO: EMPREGOS
// ---------------------------------------------------------------------------

const CURRICULO = '/servicos/trabalho/curriculo'
const TERMOS_DO_CURRICULO = '/termos-de-uso/empregos?origem=curriculo'
const BACK_TO_CURRICULO = 'Voltar para o currículo'

function curriculoTermsLink(page: Page) {
  return page.getByRole('link', {
    name: /Termos de Uso e nosso Aviso de Privacidade/,
  })
}

test.describe('Termos de uso — voltar para o currículo (público)', () => {
  test.beforeEach(async ({ context }) => {
    await applyE2ECookieConsent(context)
  })

  test('?origem=curriculo troca o voltar da lista pelo voltar para o currículo', async ({
    page,
  }) => {
    await page.goto(TERMOS_DO_CURRICULO)

    await expect(detailHeading(page, 'Empregos')).toBeVisible()
    await expect(
      page.getByRole('button', { name: BACK_TO_CURRICULO })
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Voltar para Termos de uso' })
    ).toHaveCount(0)
  })

  test('origem desconhecida é ignorada: o voltar continua indo para a lista', async ({
    page,
  }) => {
    await page.goto('/termos-de-uso/empregos?origem=qualquer-coisa')

    await expect(
      page.getByRole('link', { name: 'Voltar para Termos de uso' })
    ).toHaveAttribute('href', '/termos-de-uso')
    await expect(
      page.getByRole('button', { name: BACK_TO_CURRICULO })
    ).toHaveCount(0)
  })
})

test.describe('Termos de uso — link no Meu Currículo (autenticado)', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(!hasE2EAuth(), 'E2E_ACCESS_TOKEN não configurado')
    await applyE2EAuthCookies(context)
  })

  async function openCurriculo(page: Page) {
    await page.goto(CURRICULO)
    await expect(
      page.getByRole('heading', { level: 1, name: 'Meu Currículo' })
    ).toBeVisible({ timeout: 15000 })
  }

  async function openTermosAccordion(page: Page) {
    await page.getByText('Termos de Uso', { exact: true }).click()
    await expect(curriculoTermsLink(page)).toBeVisible({ timeout: 10000 })
  }

  test('o link leva a "Termos de uso: Empregos" em nova aba; frase, checkbox e botões seguem iguais', async ({
    page,
  }) => {
    await openCurriculo(page)
    await openTermosAccordion(page)

    const link = curriculoTermsLink(page)
    await expect(link).toHaveAttribute('href', TERMOS_DO_CURRICULO)
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    await expect(link).toHaveClass(/\bunderline\b/)
    await expect(
      page.getByText(
        'Ao preencher e enviar este formulário, você declara que leu e concorda com nossos',
        { exact: false }
      )
    ).toBeVisible()
    await expect(
      page.getByText('Li e concordo com os termos de uso')
    ).toBeVisible()
    await expect(page.getByRole('button', { name: 'Cancelar' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Salvar' })).toBeVisible()

    // Nenhuma referência à página antiga de termos no Meu Currículo.
    await expect(
      page.locator('a[href^="/servicos/trabalho/termos-de-uso"]')
    ).toHaveCount(0)
  })

  test('abre o texto completo em nova aba e o voltar fecha a aba, com o currículo intacto', async ({
    page,
    context,
  }) => {
    await openCurriculo(page)

    // Preenche um campo sem salvar: tem que continuar lá na volta.
    const typed = `Curso E2E termos ${Date.now()}`
    await page.getByText('Formação', { exact: true }).click()
    const nomeCurso = page
      .getByTestId('formacao-card-0')
      .getByPlaceholder('Preencha com o nome do curso')
    await expect(nomeCurso).toBeVisible({ timeout: 10000 })
    await nomeCurso.fill(typed)

    await openTermosAccordion(page)
    const [termos] = await Promise.all([
      context.waitForEvent('page'),
      curriculoTermsLink(page).click(),
    ])
    await termos.waitForLoadState()

    expect(new URL(termos.url()).pathname).toBe('/termos-de-uso/empregos')
    await expect(detailHeading(termos, 'Empregos')).toBeVisible()
    await expect(
      termos.getByRole('heading', { name: '1. Da ciência do Termo de uso' })
    ).toBeVisible()
    await expect(
      termos.getByRole('heading', { name: '15. Foro' })
    ).toBeAttached()

    // O currículo não saiu do lugar enquanto os termos estavam abertos.
    expect(new URL(page.url()).pathname).toBe(CURRICULO)

    await Promise.all([
      termos.waitForEvent('close'),
      termos.getByRole('button', { name: BACK_TO_CURRICULO }).click(),
    ])

    expect(new URL(page.url()).pathname).toBe(CURRICULO)
    await expect(curriculoTermsLink(page)).toBeVisible()
    await page.getByText('Formação', { exact: true }).click()
    await expect(nomeCurso).toHaveValue(typed)
  })

  test('na mesma aba, o voltar volta no histórico para o currículo', async ({
    page,
    baseURL,
  }) => {
    await openCurriculo(page)
    await page.goto(TERMOS_DO_CURRICULO, { referer: `${baseURL}${CURRICULO}` })

    await page.getByRole('button', { name: BACK_TO_CURRICULO }).click()
    await page.waitForURL(url => url.pathname === CURRICULO)
    await expect(
      page.getByRole('heading', { level: 1, name: 'Meu Currículo' })
    ).toBeVisible({ timeout: 15000 })
  })

  test('se a aba não pode ser fechada, o voltar abre o currículo', async ({
    page,
  }) => {
    // Aba com histórico próprio e sem referrer: o navegador não deixa fechar.
    await page.goto('/termos-de-uso')
    await page.goto(TERMOS_DO_CURRICULO)

    await page.getByRole('button', { name: BACK_TO_CURRICULO }).click()
    await page.waitForURL(url => url.pathname === CURRICULO)
    await expect(
      page.getByRole('heading', { level: 1, name: 'Meu Currículo' })
    ).toBeVisible({ timeout: 15000 })
  })
})
