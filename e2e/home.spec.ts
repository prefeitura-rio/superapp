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
  return page.locator('main.max-w-4xl').first()
}

/**
 * `FEATURE_SALESFORCE` é só de servidor e lida em runtime: o mesmo valor que o
 * servidor do E2E recebe (na CI, `"true"` no passo "Run E2E tests"). Libera
 * Atendimentos, Termos de uso e Carta de serviços no menu global.
 */
const salesforceEnabled = process.env.FEATURE_SALESFORCE === 'true'
const SALESFORCE_SKIP_REASON = 'Depende de FEATURE_SALESFORCE=true no servidor'

/**
 * `FEATURE_SGRC_HISTORICO`, também só de servidor e lida em runtime (na CI,
 * `"true"` no passo "Run E2E tests"). Ligada, Minhas Solicitações abre no
 * histórico SGRC, com o seletor "Data de abertura".
 */
const sgrcHistoricoEnabled = process.env.FEATURE_SGRC_HISTORICO === 'true'

/**
 * `FEATURE_HOME_BANNERS_V3`, também só de servidor e lida em runtime (na CI,
 * `"true"` no passo "Run E2E tests"). Ligada, a home mostra o carrossel de
 * banners v3; desligada (padrão de produção), os banners de sugestão anteriores.
 */
const homeBannersV3Enabled = process.env.FEATURE_HOME_BANNERS_V3 === 'true'
const BANNERS_V3_ON_REASON =
  'Depende de FEATURE_HOME_BANNERS_V3=true no servidor'
const BANNERS_V3_OFF_REASON =
  'Só roda com FEATURE_HOME_BANNERS_V3 desligada no servidor'

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
      page.getByRole('heading', { level: 2, name: 'Serviços' })
    ).toBeVisible({ timeout: 20000 })

    await expect(
      page.getByRole('heading', { name: 'Mais acessados' })
    ).toBeVisible()

    // Escopo no <nav> da navegação flutuante: o footer global (contentinfo)
    // também tem um link "Serviços".
    const floatNav = page.getByRole('navigation')
    await expect(floatNav.getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(floatNav.getByRole('link', { name: 'Serviços' })).toBeVisible()
    await expect(
      floatNav.getByRole('link', { name: 'Documentos' })
    ).toBeVisible()
  })

  test('header de visitante tem link para login no header', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(page.locator('header').getByRole('link').first()).toBeVisible({
      timeout: 15000,
    })
  })

  test('link Documentos na barra inferior aponta para fluxo de autenticação', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(
      page.getByRole('link', { name: 'Documentos' })
    ).toHaveAttribute('href', '/autenticacao-necessaria/carteira')
  })

  test('carrossel começa no banner de boas-vindas e troca pelos indicadores', async ({
    page,
  }) => {
    test.skip(!homeBannersV3Enabled, BANNERS_V3_ON_REASON)
    await page.goto('/')
    const carousel = page.getByRole('region', { name: 'Destaques' })

    await expect(
      carousel.getByRole('link', { name: /Carioca Digital e 1746/ })
    ).toHaveAttribute('href', '/servicos')

    await carousel
      .getByRole('button', { name: 'Mostrar banner 2 de 3' })
      .click()
    await expect(
      carousel.getByRole('link', { name: /Encontre seu trabalho/ })
    ).toHaveAttribute('href', '/servicos/trabalho')

    await carousel
      .getByRole('button', { name: 'Mostrar banner 3 de 3' })
      .click()
    await expect(
      carousel.getByRole('link', { name: /Cursos da prefeitura/ })
    ).toHaveAttribute('href', '/servicos/cursos')
  })

  test('carrossel troca sozinho a cada 8 segundos, em repetição contínua', async ({
    page,
  }) => {
    test.skip(!homeBannersV3Enabled, BANNERS_V3_ON_REASON)
    // Relógio simulado: avança os 8s sem esperar de verdade.
    await page.clock.install()
    await page.goto('/')
    const carousel = page.getByRole('region', { name: 'Destaques' })
    const banner = (name: RegExp) => carousel.getByRole('link', { name })

    await expect(banner(/Carioca Digital e 1746/)).toBeVisible()
    await page.clock.runFor(8000)
    await expect(banner(/Encontre seu trabalho/)).toBeVisible()
    await page.clock.runFor(8000)
    await expect(banner(/Cursos da prefeitura/)).toBeVisible()
    await page.clock.runFor(8000)
    await expect(banner(/Carioca Digital e 1746/)).toBeVisible()
  })

  test('sem FEATURE_HOME_BANNERS_V3: exibe banner de login (carteira / serviços municipais)', async ({
    page,
  }) => {
    test.skip(homeBannersV3Enabled, BANNERS_V3_OFF_REASON)
    await page.goto('/')
    await expect(page.getByText('Acesse sua carteira e os')).toBeVisible({
      timeout: 15000,
    })
    await expect(page.getByText('serviços municipais')).toBeVisible()
    await expect(page.getByRole('region', { name: 'Destaques' })).toHaveCount(0)
  })

  test('exibe a seção Mais acessados e cards conhecidos', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByRole('heading', { name: 'Mais acessados' })
    ).toBeVisible()
    await expect(page.getByText('IPTU 2026')).toBeVisible()
    // Com FEATURE_SALESFORCE os demais cards vêm da curadoria da
    // app-catalogo; o de Dívida Ativa é fixo nos dois modos.
    await expect(
      page.getByRole('heading', { name: 'Dívida Ativa: Débitos de IPTU' })
    ).toBeVisible()
  })

  test('exibe múltiplas categorias na grade de serviços', async ({ page }) => {
    await page.goto('/')
    // Nome exato: sem as âncoras, "cidade" casava com o link "Termos de uso e
    // Política de Privacidade" do footer, que vem do servidor antes de a grade
    // (client) hidratar.
    const categoryLinks = page.getByRole('link', {
      name: /^(cidade|educação|família|saúde|transporte|cultura)$/i,
    })
    // Espera a terceira categoria aparecer, em vez de contar logo após a
    // primeira.
    await expect(categoryLinks.nth(2)).toBeVisible({ timeout: 20000 })
  })

  test('não exibe a seção Documentos quando não autenticado', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(
      page.getByRole('heading', { name: 'Mais acessados' })
    ).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Documentos' })).toHaveCount(
      0
    )
  })

  test('sem FEATURE_HOME_BANNERS_V3: não exibe banner de atualização de cadastro do usuário logado', async ({
    page,
  }) => {
    test.skip(homeBannersV3Enabled, BANNERS_V3_OFF_REASON)
    await page.goto('/')
    await expect(page.getByText('Atualize seu cadastro')).toHaveCount(0)
  })
})

// ---------------------------------------------------------------------------
// CARROSSEL DE BANNERS × FIGMA ("Novo Banner")
// ---------------------------------------------------------------------------

/**
 * Medidas do banner de boas-vindas relativas ao próprio banner, nas três
 * faixas de largura do Figma (frame "Observações"). Cobrem o que o teste
 * unitário não alcança (jsdom não calcula layout).
 */
async function measureWelcomeBanner(page: Page) {
  const carousel = page.getByRole('region', { name: 'Destaques' })
  const link = carousel.locator('a[href="/servicos"]')
  await expect(link).toBeAttached()
  return link.evaluate(a => {
    const box = a.getBoundingClientRect()
    const rel = (el: Element) => {
      const r = el.getBoundingClientRect()
      return {
        top: r.top - box.top,
        bottom: r.bottom - box.top,
        height: r.height,
      }
    }
    const spans = Array.from(a.children)
    const text = spans.find(
      s => s.querySelector('span') && !s.hasAttribute('aria-hidden')
    )
    if (!text) throw new Error('bloco de texto do banner não encontrado')
    const [title, subtitle] = Array.from(text.children)
    const cta = spans[spans.length - 1]
    const img = a.querySelector('img')
    if (!img) throw new Error('ilustração do banner não encontrada')
    const viewport = a.closest('section')?.firstElementChild
    const heading = Array.from(document.querySelectorAll('h2')).find(
      h => h.textContent?.trim() === 'Serviços' && h.getClientRects().length > 0
    )
    return {
      height: box.height,
      title: rel(title),
      subtitle: rel(subtitle),
      subtitleWeight: getComputedStyle(subtitle).fontWeight,
      cta: rel(cta),
      illustrationBottom: rel(img).bottom,
      gapToServicos:
        heading && viewport
          ? heading.getBoundingClientRect().top -
            viewport.getBoundingClientRect().bottom
          : null,
    }
  })
}

test.describe('Carrossel de banners × Figma', () => {
  test.skip(!homeBannersV3Enabled, BANNERS_V3_ON_REASON)

  test.beforeEach(async ({ context }) => {
    await applyE2ECookieConsent(context)
  })

  for (const { label, width, expected } of [
    {
      label: 'mobile (< 500px)',
      width: 375,
      expected: { height: 120, titleTop: 16, subtitleTop: 60, ctaHeight: 20 },
    },
    {
      label: 'intermediário (500–767px)',
      width: 600,
      expected: { height: 120, titleTop: 16, subtitleTop: 40, ctaHeight: 20 },
    },
    {
      label: 'tablet/desktop (≥ 768px)',
      width: 1024,
      expected: { height: 160, titleTop: 24, subtitleTop: 56, ctaHeight: 36 },
    },
  ]) {
    test(`banner de boas-vindas segue as medidas do Figma — ${label}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/')
      await expect(
        page.getByRole('heading', { level: 2, name: 'Serviços' })
      ).toBeVisible({ timeout: 20000 })

      const m = await measureWelcomeBanner(page)
      expect(m.height).toBe(expected.height)
      expect(m.title.top).toBeCloseTo(expected.titleTop, 0)
      expect(m.subtitle.top).toBeCloseTo(expected.subtitleTop, 0)
      expect(m.cta.height).toBe(expected.ctaHeight)
      // O CTA fica a 16px (mobile/intermediário) ou 24px (tablet) da base.
      expect(m.height - m.cta.bottom).toBeCloseTo(
        expected.height === 120 ? 16 : 24,
        0
      )
      // A ilustração vai até a borda de baixo (o banner corta o excesso).
      expect(m.illustrationBottom).toBeGreaterThanOrEqual(expected.height - 0.5)
      // 24px entre o carrossel e a seção Serviços.
      expect(m.gapToServicos).toBeCloseTo(24, 0)
    })
  }

  test('subtítulo longo usa DM Sans 300 carregada a partir de 768px', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 900 })
    await page.goto('/')
    const carousel = page.getByRole('region', { name: 'Destaques' })
    await expect(
      carousel.getByText(
        'Acesse tudo o que você precisa da Prefeitura em um só lugar'
      )
    ).toBeVisible()
    await expect(carousel.getByText('Acesse tudo em um só lugar')).toBeHidden()

    expect((await measureWelcomeBanner(page)).subtitleWeight).toBe('300')
    // Sem o peso 300 em next/font, o navegador sintetizaria a fonte a partir
    // do 400 e o subtítulo sairia mais grosso que no Figma.
    await expect
      .poll(() =>
        page.evaluate(async () => {
          await document.fonts.ready
          return Array.from(document.fonts).some(
            f =>
              f.family.replace(/["']/g, '') === 'DM Sans' &&
              f.weight === '300' &&
              f.status === 'loaded'
          )
        })
      )
      .toBe(true)
  })

  test.describe('no celular', () => {
    test.use({ viewport: { width: 375, height: 812 } })

    test('mostra o subtítulo curto', async ({ page }) => {
      await page.goto('/')
      const carousel = page.getByRole('region', { name: 'Destaques' })
      await expect(
        carousel.getByText('Acesse tudo em um só lugar')
      ).toBeVisible()
      await expect(
        carousel.getByText(
          'Acesse tudo o que você precisa da Prefeitura em um só lugar'
        )
      ).toBeHidden()
    })

    test('arrastar para o lado troca de banner sem abrir o link', async ({
      page,
    }) => {
      await page.goto('/')
      const carousel = page.getByRole('region', { name: 'Destaques' })
      const welcome = carousel.getByRole('link', {
        name: /Carioca Digital e 1746/,
      })
      await expect(welcome).toBeVisible()

      const box = await welcome.boundingBox()
      if (!box) throw new Error('banner sem bounding box')
      const y = box.y + box.height / 2
      const drag = async (fromX: number, toX: number) => {
        await page.mouse.move(fromX, y)
        await page.mouse.down()
        await page.mouse.move(toX, y, { steps: 5 })
        await page.mouse.up()
      }

      // Para a esquerda: próximo banner.
      await drag(box.x + box.width * 0.8, box.x + box.width * 0.2)
      await expect(
        carousel.getByRole('link', { name: /Encontre seu trabalho/ })
      ).toBeVisible()
      expect(new URL(page.url()).pathname).toBe('/')

      // Para a direita: volta ao anterior.
      await drag(box.x + box.width * 0.2, box.x + box.width * 0.8)
      await expect(welcome).toBeVisible()
      expect(new URL(page.url()).pathname).toBe('/')
    })
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
      page.getByRole('heading', { level: 2, name: 'Serviços' })
    ).toBeVisible({ timeout: 20000 })
  })

  test('header não pede login e leva ao perfil', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Faça seu login')).toHaveCount(0)
    await expect(page.locator('a[href="/meu-perfil"]')).toBeVisible({
      timeout: 15000,
    })
  })

  test('link Documentos na barra inferior aponta para /carteira', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(
      page.getByRole('link', { name: 'Documentos' })
    ).toHaveAttribute('href', '/carteira')
  })

  test('sem FEATURE_HOME_BANNERS_V3: exibe banner de atualização de cadastro em vez do banner de login', async ({
    page,
  }) => {
    test.skip(homeBannersV3Enabled, BANNERS_V3_OFF_REASON)
    await page.goto('/')
    await expect(page.getByText('Atualize seu cadastro')).toBeVisible({
      timeout: 15000,
    })
    await expect(page.getByText('Acesse sua carteira e os')).toHaveCount(0)
  })

  test('exibe Documentos ou estado de carteira vazia após carregar', async ({
    page,
  }) => {
    await page.goto('/')
    const carteira = page.getByRole('heading', { name: 'Documentos' })
    const empty = page.getByText('No momento sua carteira está vazia.')
    await expect(carteira.or(empty).first()).toBeVisible({ timeout: 25000 })
  })
})

// ---------------------------------------------------------------------------
// MENU GLOBAL
// ---------------------------------------------------------------------------

test.describe('Menu global (público)', () => {
  test.beforeEach(async ({ context }) => {
    await applyE2ECookieConsent(context)
  })

  test('abre pelo header e exibe os acessos públicos do handoff', async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Menu', exact: true }).click()

    const menu = page.getByRole('dialog')
    await expect(menu).toBeVisible()
    await expect(
      menu.getByRole('link', { name: 'Faça seu login' })
    ).toBeVisible()
    await expect(
      menu.getByRole('link', { name: 'Serviços', exact: true })
    ).toBeVisible()
    await expect(
      menu.getByRole('button', { name: 'Oportunidades Cariocas' })
    ).toBeVisible()
    await expect(
      menu.getByRole('link', { name: 'Perguntas frequentes' })
    ).toHaveAttribute('href', '/faq')
    await expect(menu.getByLabel('Tema claro')).toBeVisible()
    // Sem "Página inicial" nem a seção "Outros" no handoff atual.
    await expect(
      menu.getByRole('link', { name: 'Página inicial' })
    ).toHaveCount(0)
    await expect(menu.getByRole('button', { name: 'Outros' })).toHaveCount(0)
  })

  test('com FEATURE_SALESFORCE: Atendimentos, Termos de uso e Carta de serviços', async ({
    page,
  }) => {
    test.skip(!salesforceEnabled, SALESFORCE_SKIP_REASON)
    await page.goto('/')
    await page.getByRole('button', { name: 'Menu', exact: true }).click()
    const menu = page.getByRole('dialog')

    // A flag é só de servidor: o menu (client component) precisa recebê-la
    // do layout, e não ler process.env no navegador.
    await expect(
      menu.getByRole('button', { name: 'Atendimentos' })
    ).toBeVisible()
    await expect(
      menu.getByRole('link', {
        name: 'Termos de uso e política de privacidade',
      })
    ).toHaveAttribute('href', '/termos-de-uso')
    await expect(
      menu.getByRole('link', { name: 'Carta de serviços' })
    ).toHaveAttribute('href', '/carta-de-servicos')
  })

  test('sem FEATURE_SALESFORCE: sem Atendimentos, Termos de uso e Carta de serviços', async ({
    page,
  }) => {
    test.skip(salesforceEnabled, 'Só roda com FEATURE_SALESFORCE desligada')
    await page.goto('/')
    await page.getByRole('button', { name: 'Menu', exact: true }).click()
    const menu = page.getByRole('dialog')

    await expect(
      menu.getByRole('link', { name: 'Perguntas frequentes' })
    ).toBeVisible()
    await expect(
      menu.getByRole('button', { name: 'Atendimentos' })
    ).toHaveCount(0)
    await expect(
      menu.getByRole('link', {
        name: 'Termos de uso e política de privacidade',
      })
    ).toHaveCount(0)
    await expect(
      menu.getByRole('link', { name: 'Carta de serviços' })
    ).toHaveCount(0)
  })

  test('Carta de serviços leva à carta e fecha o menu', async ({ page }) => {
    test.skip(!salesforceEnabled, SALESFORCE_SKIP_REASON)
    await page.goto('/')
    await page.getByRole('button', { name: 'Menu', exact: true }).click()
    await page
      .getByRole('dialog')
      .getByRole('link', { name: 'Carta de serviços' })
      .click()

    await page.waitForURL('**/carta-de-servicos', { timeout: 15000 })
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })

  test('Atendimentos deslogado: Consulta de protocolo, Ouvidoria e LAI', async ({
    page,
  }) => {
    test.skip(!salesforceEnabled, SALESFORCE_SKIP_REASON)
    await page.goto('/')
    await page.getByRole('button', { name: 'Menu', exact: true }).click()
    const menu = page.getByRole('dialog')

    await menu.getByRole('button', { name: 'Atendimentos' }).click()
    await expect(
      menu.getByRole('link', { name: 'Consulta de protocolo' })
    ).toHaveAttribute('href', '/consulta-protocolo')
    await expect(menu.getByRole('link', { name: 'Ouvidoria' })).toHaveAttribute(
      'href',
      /\/ouvidoria$/
    )
    await expect(
      menu.getByRole('link', { name: 'Lei de Acesso à Informação' })
    ).toHaveAttribute('href', /\/lai$/)
    await expect(
      menu.getByRole('link', { name: 'Minhas solicitações' })
    ).toHaveCount(0)
  })

  test('deslogado oculta os itens que exigem login', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Menu', exact: true }).click()

    const menu = page.getByRole('dialog')
    // Documentos continua no menu, mas leva à tela de autenticação necessária
    await expect(
      menu.getByRole('link', { name: 'Documentos' })
    ).toHaveAttribute('href', '/autenticacao-necessaria/carteira')
    // Sair só existe para quem está logado
    await expect(menu.getByRole('button', { name: 'Sair' })).toHaveCount(0)

    await menu.getByRole('button', { name: 'Oportunidades Cariocas' }).click()
    await expect(menu.getByRole('link', { name: 'Ver cursos' })).toBeVisible()
    await expect(menu.getByRole('link', { name: 'Meus cursos' })).toHaveCount(0)
    await expect(
      menu.getByRole('link', { name: 'Meus certificados' })
    ).toHaveCount(0)
    await expect(
      menu.getByRole('link', { name: 'Minhas candidaturas' })
    ).toHaveCount(0)
  })

  test('Documentos deslogado leva à tela de autenticação necessária', async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Menu', exact: true }).click()
    await page
      .getByRole('dialog')
      .getByRole('link', { name: 'Documentos' })
      .click()

    await page.waitForURL('**/autenticacao-necessaria/carteira', {
      timeout: 15000,
    })
    await expect(
      page.getByText('Informações para você em um só lugar')
    ).toBeVisible({ timeout: 15000 })
    await expect(page.getByText('Entre com a sua conta gov.br')).toBeVisible()
  })

  test('fecha ao navegar por um item', async ({ page }) => {
    test.skip(!salesforceEnabled, SALESFORCE_SKIP_REASON)
    await page.goto('/')
    await page.getByRole('button', { name: 'Menu', exact: true }).click()
    await page
      .getByRole('link', { name: 'Termos de uso e política de privacidade' })
      .click()

    await page.waitForURL('**/termos-de-uso', { timeout: 15000 })
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(
      page.getByRole('heading', { level: 1, name: 'Termos de uso' })
    ).toBeVisible({ timeout: 15000 })
  })

  test('fecha pelo botão X', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Menu', exact: true }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByRole('button', { name: 'Fechar menu' }).click()
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })

  test('toggle "Tema claro" alterna o tema do app', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Menu', exact: true }).click()

    const toggle = page.locator('#global-menu-theme')
    await expect(toggle).toHaveAttribute('data-state', 'checked')

    await toggle.click()
    await expect(toggle).toHaveAttribute('data-state', 'unchecked')
    await expect(page.locator('html')).toHaveClass(/dark/)

    await toggle.click()
    await expect(page.locator('html')).not.toHaveClass(/dark/)
  })
})

test.describe('Menu global (autenticado)', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(
      !hasE2EAuth(),
      'Defina E2E_ACCESS_TOKEN para rodar testes autenticados'
    )
    await applyE2ECookieConsent(context)
    await applyE2EAuthCookies(context)
  })

  test('exibe bloco do usuário, Documentos, Meu perfil e Sair', async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Menu', exact: true }).click()

    const menu = page.getByRole('dialog')
    await expect(menu.getByText(/\d{3}\.\d{3}\.\d{3}-\d{2}/)).toBeVisible({
      timeout: 15000,
    })
    await expect(
      menu.getByRole('link', { name: 'Documentos' })
    ).toHaveAttribute('href', '/carteira')
    await expect(
      menu.getByRole('link', { name: 'Meu perfil' })
    ).toHaveAttribute('href', '/meu-perfil')
    await expect(menu.getByRole('button', { name: 'Sair' })).toBeVisible()
    await expect(
      menu.getByRole('link', { name: 'Faça seu login' })
    ).toHaveCount(0)
  })

  test('com FEATURE_SALESFORCE: Atendimentos, Termos de uso e Carta de serviços', async ({
    page,
  }) => {
    test.skip(!salesforceEnabled, SALESFORCE_SKIP_REASON)
    await page.goto('/')
    await page.getByRole('button', { name: 'Menu', exact: true }).click()
    const menu = page.getByRole('dialog')
    await expect(menu.getByRole('button', { name: 'Sair' })).toBeVisible({
      timeout: 15000,
    })

    await expect(
      menu.getByRole('button', { name: 'Atendimentos' })
    ).toBeVisible()
    await expect(
      menu.getByRole('link', {
        name: 'Termos de uso e política de privacidade',
      })
    ).toHaveAttribute('href', '/termos-de-uso')
    await expect(
      menu.getByRole('link', { name: 'Carta de serviços' })
    ).toHaveAttribute('href', '/carta-de-servicos')
  })

  test('Oportunidades Cariocas logado: Meus cursos/certificados e Minhas candidaturas/currículo', async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Menu', exact: true }).click()
    const menu = page.getByRole('dialog')
    await expect(menu.getByRole('button', { name: 'Sair' })).toBeVisible({
      timeout: 15000,
    })

    await menu.getByRole('button', { name: 'Oportunidades Cariocas' }).click()
    for (const [name, href] of [
      ['Ver cursos', '/servicos/cursos'],
      ['Meus cursos', '/servicos/cursos/meus-cursos'],
      ['Meus certificados', '/servicos/cursos/certificados'],
      ['Ver vagas', '/servicos/trabalho'],
      ['Minhas candidaturas', '/servicos/trabalho/minhas-candidaturas'],
      ['Meu currículo', '/servicos/trabalho/curriculo'],
    ]) {
      await expect(
        menu.getByRole('link', { name, exact: true })
      ).toHaveAttribute('href', href)
    }
  })

  test('Atendimentos logado: Ouvidoria e LAI abrem a aba de Minhas solicitações', async ({
    page,
  }) => {
    test.skip(!salesforceEnabled, SALESFORCE_SKIP_REASON)
    await page.goto('/')
    await page.getByRole('button', { name: 'Menu', exact: true }).click()
    const menu = page.getByRole('dialog')
    await expect(menu.getByRole('button', { name: 'Sair' })).toBeVisible({
      timeout: 15000,
    })

    await menu.getByRole('button', { name: 'Atendimentos' }).click()
    await expect(
      menu.getByRole('link', { name: 'Minhas solicitações' })
    ).toHaveAttribute('href', '/minhas-solicitacoes')
    await expect(menu.getByRole('link', { name: 'Ouvidoria' })).toHaveAttribute(
      'href',
      '/minhas-solicitacoes?filtro=ouvidoria'
    )
    await expect(
      menu.getByRole('link', { name: 'Lei de Acesso à Informação' })
    ).toHaveAttribute('href', '/minhas-solicitacoes?filtro=acesso-a-informacao')
    await expect(
      menu.getByRole('link', { name: 'Consulta de protocolo' })
    ).toHaveCount(0)
  })

  test('bloco do usuário leva para Dados pessoais', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Menu', exact: true }).click()

    await page
      .getByRole('dialog')
      .getByRole('link', { name: /\d{3}\.\d{3}\.\d{3}-\d{2}/ })
      .click()

    await page.waitForURL('**/meu-perfil', { timeout: 15000 })
    await expect(
      page.getByRole('heading', { level: 1, name: 'Dados pessoais' })
    ).toBeVisible({ timeout: 15000 })
  })
})

// ---------------------------------------------------------------------------
// MENUS POR MÓDULO → MENU GLOBAL
// ---------------------------------------------------------------------------

test.describe('Menus por módulo absorvidos pelo menu global', () => {
  test.beforeEach(async ({ context }) => {
    await applyE2ECookieConsent(context)
  })

  for (const [from, to] of [
    ['/servicos/cursos/opcoes', '/servicos/cursos'],
    ['/servicos/trabalho/menu', '/servicos/trabalho'],
  ]) {
    test(`${from} responde 308 e leva a ${to}`, async ({
      page,
      request,
      baseURL,
    }) => {
      const response = await request.get(from, { maxRedirects: 0 })
      expect(response.status()).toBe(308)
      expect(new URL(response.headers().location, baseURL).pathname).toBe(to)

      await page.goto(from)
      await page.waitForURL(url => url.pathname === to)
      await expect(
        page
          .locator('header')
          .first()
          .getByRole('button', { name: 'Menu', exact: true })
      ).toBeVisible({ timeout: 15000 })
    })
  }
})

test.describe('Minhas solicitações pela aba do menu global (autenticado)', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(
      !hasE2EAuth(),
      'Defina E2E_ACCESS_TOKEN para rodar testes autenticados'
    )
    test.skip(!salesforceEnabled, SALESFORCE_SKIP_REASON)
    // A página lista os chamados na API pref-rio-cidadao e quebra (500) sem a
    // URL base, que a CI lê da variável do repositório de mesmo nome.
    test.skip(
      !process.env.BASE_API_URL_PREF_RIO_CIDADAO,
      'Minhas solicitações depende de BASE_API_URL_PREF_RIO_CIDADAO'
    )
    await applyE2ECookieConsent(context)
    await applyE2EAuthCookies(context)
  })

  for (const [filtro, aba] of [
    ['ouvidoria', 'Ouvidoria'],
    ['acesso-a-informacao', 'Acesso à informação'],
  ]) {
    test(`?filtro=${filtro} abre a aba ${aba}`, async ({ page }) => {
      await page.goto(`/minhas-solicitacoes?filtro=${filtro}`)
      await expect(
        page.getByRole('heading', { level: 1, name: 'Minhas Solicitações' })
      ).toBeVisible({ timeout: 20000 })

      // Com o histórico SGRC, a página abre nele (só "Todos"); as abas do
      // filtro estão nas solicitações do Salesforce. Sem a flag, já abre lá.
      if (sgrcHistoricoEnabled) {
        await page.getByRole('button', { name: 'Data de abertura' }).click()
        await page
          .getByRole('radio', { name: 'abertas a partir de 27/11/2026' })
          .click()
        await page.getByRole('button', { name: 'Aplicar' }).click()
      } else {
        await expect(
          page.getByRole('button', { name: 'Data de abertura' })
        ).toHaveCount(0)
      }

      await expect(
        page.getByRole('button', { name: aba, exact: true })
      ).toHaveClass(/border-foreground/)
      await expect(
        page.getByRole('button', { name: 'Todos', exact: true })
      ).not.toHaveClass(/border-foreground/)
    })
  }
})

// ---------------------------------------------------------------------------
// MENU GLOBAL × BANNER DE COOKIES
// ---------------------------------------------------------------------------

/**
 * Visitante que ainda não respondeu ao banner de cookies (sem o cookie de
 * consentimento). O menu global é modal: com ele aberto, o resto da página
 * não recebe cliques. O banner fica por cima do menu e, se continuasse
 * visível, o toque em "Rejeitar" cairia no item do menu embaixo dele (em
 * staging abria Perguntas frequentes). O banner some com o menu aberto e
 * volta, clicável, ao fechar.
 */
test.describe('Menu global × banner de cookies (visitante sem consentimento)', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('o banner some com o menu aberto e volta, clicável, ao fechar', async ({
    page,
  }) => {
    await page.goto('/')
    const banner = page.getByRole('region', {
      name: 'Consentimento de cookies',
    })
    const rejeitar = banner
      .getByRole('button', { name: 'Apenas essenciais' })
      .first()
    await expect(rejeitar).toBeVisible()

    await page
      .locator('header')
      .first()
      .getByRole('button', { name: 'Menu', exact: true })
      .click()
    const menu = page.getByRole('dialog', { name: 'Menu' })
    await expect(menu).toBeVisible()
    // Por CSS, não por papel: com o menu (modal) aberto o resto da página
    // ganha aria-hidden, e getByRole deixaria de achar o banner mesmo com ele
    // visível na tela.
    await expect(
      page.locator('[aria-label="Consentimento de cookies"]')
    ).toBeHidden()

    await menu.getByRole('button', { name: 'Fechar menu' }).click()
    await expect(menu).toBeHidden()
    await expect(rejeitar).toBeVisible()

    await rejeitar.click()
    await expect(banner).toBeHidden()
    // O toque fica no banner: nada por baixo dele é acionado.
    expect(new URL(page.url()).pathname).toBe('/')
  })
})

// ---------------------------------------------------------------------------
// CONSENTIMENTO DE COOKIES (LGPD)
// ---------------------------------------------------------------------------

/**
 * O Google Analytics só pode carregar depois do consentimento, e o site não
 * carrega mais GTM nem Hotjar. Antes da escolha e depois da recusa, nenhuma
 * requisição vai para eles e nenhum cookie `_ga*`/`_hj*` fica no navegador.
 */
test.describe('Consentimento de cookies (visitante sem escolha)', () => {
  const TRACKERS =
    /googletagmanager\.com|google-analytics\.com|analytics\.google\.com|hotjar\.(com|io)/

  test('nenhum terceiro de medição carrega antes da escolha nem depois da recusa', async ({
    page,
    context,
  }) => {
    const trackerRequests: string[] = []
    page.on('request', request => {
      if (TRACKERS.test(request.url())) trackerRequests.push(request.url())
    })

    await page.goto('/')
    const banner = page.getByRole('region', {
      name: 'Consentimento de cookies',
    })
    // O banner só aparece depois da hidratação, quando o GA já teria carregado.
    await expect(banner).toBeVisible()
    expect(trackerRequests).toEqual([])

    await banner.getByRole('button', { name: 'Apenas essenciais' }).click()
    await expect(banner).toBeHidden()

    await page.reload()
    await page.waitForLoadState('networkidle')
    await expect(banner).toBeHidden()

    expect(trackerRequests).toEqual([])
    const trackerCookies = (await context.cookies())
      .map(cookie => cookie.name)
      .filter(name => name.startsWith('_ga') || name.startsWith('_hj'))
    expect(trackerCookies).toEqual([])
  })

  test('cookies do Hotjar e do GA de antes do banner são apagados na carga', async ({
    page,
    context,
    baseURL,
  }) => {
    const domain = new URL(baseURL ?? 'http://localhost:3000').hostname
    await context.addCookies([
      { name: '_hjSessionUser_6494379', value: 'antigo', domain, path: '/' },
      { name: '_ga', value: 'GA1.1.antigo', domain, path: '/' },
    ])

    await page.goto('/')
    await expect(
      page.getByRole('region', { name: 'Consentimento de cookies' })
    ).toBeVisible()

    const trackerCookies = (await context.cookies())
      .map(cookie => cookie.name)
      .filter(name => name.startsWith('_ga') || name.startsWith('_hj'))
    expect(trackerCookies).toEqual([])
  })

  test('"Preferências de cookies" no rodapé reabre a escolha', async ({
    page,
  }) => {
    await page.goto('/')
    const banner = page.getByRole('region', {
      name: 'Consentimento de cookies',
    })
    await banner.getByRole('button', { name: 'Apenas essenciais' }).click()
    await expect(banner).toBeHidden()

    await page
      .locator('footer')
      .getByRole('button', { name: 'Preferências de cookies' })
      .click()
    const dialog = page.getByRole('dialog', { name: 'Preferências de cookies' })
    await expect(dialog).toBeVisible()
    await expect(
      dialog.getByRole('switch', { name: 'Análise (Google Analytics)' })
    ).not.toBeChecked()
    await expect(dialog.getByRole('switch')).toHaveCount(1)
  })
})
