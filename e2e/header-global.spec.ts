import { type Locator, type Page, expect, test } from '@playwright/test'
import {
  applyE2EAuthCookies,
  applyE2ECookieConsent,
  hasE2EAuth,
} from './fixtures/auth'
import { backgroundOf, secondaryStateRules } from './fixtures/button-states'

/**
 * Header Global PrefRio (MainHeader → HeaderUserLink): Perfil e Menu mudam de
 * default (bg-card) para focused (bg-secondary) no hover do desktop e
 * enquanto pressionados no toque, em todas as páginas que usam o componente,
 * não só nos Termos de uso. Uma página por forma de montar o header.
 */
const PUBLIC_PAGES = [
  { path: '/', via: 'HeaderWrapperClient (home)' },
  { path: '/ouvidoria', via: 'HeaderWrapperClient' },
  { path: '/busca', via: 'MainHeader direto (busca)' },
  { path: '/servicos/trabalho', via: 'OportunidadesSubHeader' },
]

const LOGGED_PAGES = [
  // Logado sem menuHref: o Menu é um <button>.
  { path: '/', via: 'HeaderWrapperClient (home)' },
  // /meu-perfil esconde o avatar (hideAvatar); aqui o Menu é link.
  { path: '/meu-perfil/autorizacoes', via: 'ProfileHeaderWrapper' },
]

function headerControls(page: Page, logged: boolean) {
  // Primeiro <header> da página. Não por role=banner: na home o header fica
  // dentro do <main> e perde o papel de banner.
  const header = page.locator('header').first()
  const avatarLink = header
    .locator('a[href="/meu-perfil"]')
    .filter({ hasNotText: 'Menu' })
  return {
    ready: logged
      ? avatarLink
      : header.getByRole('link', { name: 'Faça seu login' }),
    perfil: logged
      ? avatarLink.locator('div')
      : header.getByRole('link', { name: 'Faça seu login' }).locator('div'),
    menu: header.getByText('Menu', { exact: true }).locator('..'),
  }
}

async function expectHoverState(page: Page, target: Locator) {
  await page.mouse.move(0, 0)
  const idle = await backgroundOf(target)
  await target.hover()
  await expect.poll(() => backgroundOf(target)).not.toBe(idle)
  expect(await secondaryStateRules(target)).toEqual({
    hover: true,
    active: true,
  })
}

async function expectTouchState(page: Page, target: Locator) {
  expect(await secondaryStateRules(target)).toEqual({
    hover: false,
    active: true,
  })
  const idle = await backgroundOf(target)
  const box = await target.boundingBox()
  if (!box) throw new Error('controle sem bounding box')
  // Sem hover no toque: ponteiro em cima não muda nada.
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.waitForTimeout(400)
  expect(await backgroundOf(target)).toBe(idle)
  // Pressionado → focused. Sem mouse.up: soltar navegaria.
  await page.mouse.down()
  await expect.poll(() => backgroundOf(target)).not.toBe(idle)
}

test.describe('Header Global — estados no desktop (visitante)', () => {
  test.beforeEach(async ({ context }) => {
    await applyE2ECookieConsent(context)
  })

  for (const { path, via } of PUBLIC_PAGES) {
    for (const control of ['perfil', 'menu'] as const) {
      test(`${path} [${via}]: ${control} default → focused no hover`, async ({
        page,
      }) => {
        await page.goto(path)
        const controls = headerControls(page, false)
        await expect(controls.ready).toBeVisible({ timeout: 20_000 })
        await expectHoverState(page, controls[control])
      })
    }
  }
})

test.describe('Header Global — estados no toque (visitante)', () => {
  test.use({
    viewport: { width: 360, height: 780 },
    hasTouch: true,
    isMobile: true,
  })

  test.beforeEach(async ({ context }) => {
    await applyE2ECookieConsent(context)
  })

  for (const { path, via } of PUBLIC_PAGES) {
    for (const control of ['perfil', 'menu'] as const) {
      test(`${path} [${via}]: ${control} sem hover; focused enquanto pressionado`, async ({
        page,
      }) => {
        await page.goto(path)
        const controls = headerControls(page, false)
        await expect(controls.ready).toBeVisible({ timeout: 20_000 })
        expect(
          await page.evaluate(() => matchMedia('(hover: hover)').matches)
        ).toBe(false)
        await expectTouchState(page, controls[control])
      })
    }
  }
})

test.describe('Header Global — estados com sessão', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(!hasE2EAuth(), 'E2E_ACCESS_TOKEN não configurado')
    await applyE2EAuthCookies(context)
  })

  for (const { path, via } of LOGGED_PAGES) {
    test(`${path} [${via}]: Perfil e Menu (botão) focused no hover`, async ({
      page,
    }) => {
      await page.goto(path)
      const controls = headerControls(page, true)
      await expect(controls.ready).toBeVisible({ timeout: 20_000 })
      await expectHoverState(page, controls.perfil)
      await expectHoverState(page, controls.menu)
    })
  }
})
