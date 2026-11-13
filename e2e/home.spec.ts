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
    // Com NEXT_PUBLIC_FEATURE_SALESFORCE os demais cards vêm da curadoria da
    // app-catalogo; o de Dívida Ativa é fixo nos dois modos.
    await expect(
      page.getByRole('heading', { name: 'Dívida Ativa: Débitos de IPTU' })
    ).toBeVisible()
  })

  test('exibe múltiplas categorias na grade de serviços', async ({ page }) => {
    await page.goto('/')
    const categoryLinks = page.getByRole('link', {
      name: /cursos|cidade|educação|família|saúde|transporte|cultura/i,
    })
    await expect(categoryLinks.first()).toBeVisible({ timeout: 20000 })
    expect(await categoryLinks.count()).toBeGreaterThanOrEqual(3)
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

  test('exibe banner de atualização de cadastro em vez do banner de login', async ({
    page,
  }) => {
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
      menu.getByRole('link', {
        name: 'Termos de uso e política de privacidade',
      })
    ).toHaveAttribute('href', '/termos-de-uso')
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

  test('Atendimentos deslogado: Consulta de protocolo, Ouvidoria e LAI', async ({
    page,
  }) => {
    test.skip(
      process.env.NEXT_PUBLIC_FEATURE_SALESFORCE !== 'true',
      'Atendimentos depende de NEXT_PUBLIC_FEATURE_SALESFORCE'
    )
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
    test.skip(
      process.env.NEXT_PUBLIC_FEATURE_SALESFORCE !== 'true',
      'Atendimentos depende de NEXT_PUBLIC_FEATURE_SALESFORCE'
    )
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
    test.skip(
      process.env.NEXT_PUBLIC_FEATURE_SALESFORCE !== 'true',
      'Minhas solicitações depende de NEXT_PUBLIC_FEATURE_SALESFORCE'
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

      await expect(
        page.getByRole('button', { name: aba, exact: true })
      ).toHaveClass(/border-foreground/)
      await expect(
        page.getByRole('button', { name: 'Todos', exact: true })
      ).not.toHaveClass(/border-foreground/)
    })
  }
})
