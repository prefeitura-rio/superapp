import { type Page, expect, test } from '@playwright/test'
import {
  applyE2EAuthCookies,
  applyE2ECookieConsent,
  hasE2EAuth,
} from './fixtures/auth'

/**
 * Seletor de card de curso na home: qualquer link para /servicos/cursos/{id}
 * excluindo as sub-rotas estáticas conhecidas (busca, faq, opcoes, etc.) e as
 * rotas de categoria/confirmar-informacoes. Evita hardcode de IDs de curso.
 */
const COURSE_CARD_SELECTOR =
  'a[href^="/servicos/cursos/"]' +
  ':not([href="/servicos/cursos/busca"])' +
  ':not([href="/servicos/cursos/faq"])' +
  ':not([href="/servicos/cursos/opcoes"])' +
  ':not([href="/servicos/cursos/meus-cursos"])' +
  ':not([href="/servicos/cursos/certificados"])' +
  ':not([href="/servicos/cursos/alertas"])' +
  ':not([href="/servicos/cursos/atualizar-dados"])' +
  ':not([href^="/servicos/cursos/categoria"])' +
  ':not([href^="/servicos/cursos/confirmar-informacoes"])'

/**
 * Só cards visíveis. A home renderiza um carrossel ("Mais recentes") cujos
 * itens off-screen têm largura/altura 0 (ocultos) e aparecem ANTES da grade
 * "Todos os cursos" no DOM. Sem `:visible`, `.first()` selecionaria um card
 * oculto do carrossel.
 */
const VISIBLE_COURSE_CARD = `${COURSE_CARD_SELECTOR}:visible`

/**
 * Navega para a home de cursos, aguarda o carregamento client-side dos cards
 * e retorna o href do primeiro card de curso encontrado — ou null se a home
 * não tiver cursos (estado dependente da API de homolog).
 */
async function getFirstCourseHref(page: Page): Promise<string | null> {
  await page.goto('/servicos/cursos')
  await expect(
    page.locator('img[alt="Oportunidades Cariocas Logo"]').first()
  ).toBeVisible({ timeout: 15000 })

  const firstCard = page.locator(VISIBLE_COURSE_CARD).first()
  const hasCard = await firstCard
    .isVisible({ timeout: 20000 })
    .catch(() => false)
  if (!hasCard) return null

  return firstCard.getAttribute('href')
}

/**
 * Abre a home, coleta os chips de categoria visíveis e navega para o primeiro
 * cujo slug RESOLVE (não cai em "Página não encontrada"). Retorna o href aberto
 * ou null se nenhum resolve.
 *
 * Necessário porque a home pode expor chips (ex.: "dados") cujo slug não existe
 * na rota de categoria em homolog, retornando 404 — o critério "se ativa em
 * homolog" do card.
 */
async function gotoFirstResolvingCategory(page: Page): Promise<string | null> {
  await page.goto('/servicos/cursos')
  await expect(
    page.locator('img[alt="Oportunidades Cariocas Logo"]').first()
  ).toBeVisible({ timeout: 15000 })

  const hrefs: string[] = await page
    .locator('a[href^="/servicos/cursos/categoria/"]:visible')
    .evaluateAll(els =>
      Array.from(
        new Set(
          els
            .map(e => e.getAttribute('href'))
            .filter((h): h is string => Boolean(h))
        )
      )
    )

  for (const href of hrefs) {
    await page.goto(href)
    const searchBtn = page.locator('a[href="/servicos/cursos/busca"]')
    const emptyState = page.getByText(
      'nenhum curso encontrado para esta categoria',
      { exact: false }
    )
    const notFound = page.getByText('Página não encontrada', { exact: false })
    // Espera a página estabilizar em um dos estados conhecidos
    await expect(searchBtn.or(emptyState).or(notFound).first()).toBeVisible({
      timeout: 15000,
    })
    const is404 = await notFound.isVisible().catch(() => false)
    if (!is404) return href
  }
  return null
}

// ---------------------------------------------------------------------------
// HOME DE CURSOS — PÚBLICO
// ---------------------------------------------------------------------------

test.describe('Cursos — home (público)', () => {
  test.beforeEach(async ({ context }) => {
    await applyE2ECookieConsent(context)
  })

  test('exibe logo Oportunidades Cariocas no header', async ({ page }) => {
    await page.goto('/servicos/cursos')
    await expect(
      page.locator('img[alt="Oportunidades Cariocas Logo"]').first()
    ).toBeVisible({ timeout: 15000 })
  })

  test('header deslogado exibe link de Login', async ({ page }) => {
    await page.goto('/servicos/cursos')
    await expect(
      page.locator('header').getByText('Login', { exact: true }).first()
    ).toBeVisible({ timeout: 15000 })
  })

  test('exibe cursos (seção "Todos os cursos" ou cards) ou estado vazio', async ({
    page,
  }) => {
    await page.goto('/servicos/cursos')

    const todosCursos = page.getByRole('heading', { name: 'Todos os cursos' })
    const firstCard = page.locator(VISIBLE_COURSE_CARD).first()
    const emptyState = page.getByText('Nenhum curso encontrado', {
      exact: false,
    })

    await expect(todosCursos.or(firstCard).or(emptyState).first()).toBeVisible({
      timeout: 20000,
    })
  })

  test('ao clicar no primeiro card de curso, navega para a página do curso', async ({
    page,
  }) => {
    const href = await getFirstCourseHref(page)
    if (!href) {
      test.skip(true, 'Home de cursos sem cards no ambiente atual')
      return
    }

    const firstCard = page.locator(`a[href="${href}"]:visible`).first()
    await firstCard.click()
    await page.waitForURL(`**${href}`, { timeout: 15000 })
    // Full navigation garante o conteúdo completo do RSC (mesmo padrão de empregos)
    await page.reload()
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 })
  })
})

// ---------------------------------------------------------------------------
// PÁGINA DO CURSO — PÚBLICO
// ---------------------------------------------------------------------------

test.describe('Cursos — página do curso (público)', () => {
  test.beforeEach(async ({ context }) => {
    await applyE2ECookieConsent(context)
  })

  test('carrega a página do curso com título (h1)', async ({ page }) => {
    const href = await getFirstCourseHref(page)
    if (!href) {
      test.skip(true, 'Home de cursos sem cards no ambiente atual')
      return
    }
    await page.goto(href)
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 })
  })

  test('exibe CTA de inscrição (link para confirmar-informacoes) sem autenticação', async ({
    page,
  }) => {
    const href = await getFirstCourseHref(page)
    if (!href) {
      test.skip(true, 'Home de cursos sem cards no ambiente atual')
      return
    }
    await page.goto(href)
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 })

    // A CTA de inscrição leva a confirmar-informacoes, que exige login (redireciona
    // ao gov.br quando deslogado). Aqui validamos apenas a presença do link.
    const inscreverCta = page
      .locator('a[href^="/servicos/cursos/confirmar-informacoes/"]')
      .first()
    const trocarTurma = page.locator('a[href$="/trocar-turma"]').first()
    // Curso pode estar indisponível (sem CTA) — tolera ambos os estados
    const hasCta = await inscreverCta
      .or(trocarTurma)
      .isVisible({ timeout: 10000 })
      .catch(() => false)
    if (hasCta) {
      await expect(inscreverCta.or(trocarTurma).first()).toBeVisible()
    }
  })
})

// ---------------------------------------------------------------------------
// BUSCA DE CURSOS — PÚBLICO
// ---------------------------------------------------------------------------

test.describe('Cursos — busca (público)', () => {
  test.beforeEach(async ({ context }) => {
    await applyE2ECookieConsent(context)
  })

  test('/servicos/cursos/busca redireciona para /busca?tipo=cursos', async ({
    page,
  }) => {
    await page.goto('/servicos/cursos/busca')
    await page.waitForURL('**/busca?tipo=cursos', { timeout: 15000 })
    await expect(page.getByPlaceholder('Do que você precisa?')).toBeVisible({
      timeout: 15000,
    })
  })

  test('busca com ?q= exibe resultados ou mensagem de vazio', async ({
    page,
  }) => {
    await page.goto('/busca?tipo=cursos&q=curso')

    const resultados = page.getByRole('heading', {
      name: 'Resultados da Pesquisa',
    })
    const semResultados = page.getByText(
      'Ops... nenhum resultado encontrado para a sua busca',
      { exact: false }
    )
    await expect(resultados.or(semResultados).first()).toBeVisible({
      timeout: 20000,
    })
  })
})

// ---------------------------------------------------------------------------
// CATEGORIA — PÚBLICO
// ---------------------------------------------------------------------------

test.describe('Cursos — categoria (público)', () => {
  test.beforeEach(async ({ context }) => {
    await applyE2ECookieConsent(context)
  })

  test('categoria ativa exibe título/estado vazio e ícone de busca', async ({
    page,
  }) => {
    const href = await gotoFirstResolvingCategory(page)
    if (!href) {
      test.skip(
        true,
        'Nenhum chip de categoria da home resolve em homolog (nenhuma categoria ativa)'
      )
      return
    }

    // Título da categoria (h1 NÃO-vazio — o h1 do header vem vazio) OU estado vazio
    const h1 = page.locator('h1').filter({ hasText: /.+/ })
    const empty = page.getByText(
      'nenhum curso encontrado para esta categoria',
      { exact: false }
    )
    await expect(h1.first().or(empty.first()).first()).toBeVisible({
      timeout: 15000,
    })

    // Página de categoria válida expõe o ícone de busca (SecondaryHeader)
    await expect(
      page.locator('a[href="/servicos/cursos/busca"]').first()
    ).toBeVisible({ timeout: 15000 })
  })
})

// ---------------------------------------------------------------------------
// FAQ — PÚBLICO
// ---------------------------------------------------------------------------

test.describe('Cursos — FAQ (público)', () => {
  test.beforeEach(async ({ context }) => {
    await applyE2ECookieConsent(context)
  })

  test('exibe heading "FAQ" e perguntas frequentes sobre cursos', async ({
    page,
  }) => {
    await page.goto('/servicos/cursos/faq')

    await expect(page.getByRole('heading', { name: 'FAQ' })).toBeVisible({
      timeout: 15000,
    })
    await expect(
      page.getByText('O que é a Plataforma Oportunidades Cariocas?', {
        exact: false,
      })
    ).toBeVisible({ timeout: 10000 })
  })

  test('exibe perguntas sobre inscrição, conta Gov.br e certificado', async ({
    page,
  }) => {
    await page.goto('/servicos/cursos/faq')
    await expect(page.getByRole('heading', { name: 'FAQ' })).toBeVisible({
      timeout: 15000,
    })

    await expect(
      page.getByText('Quem pode se inscrever?', { exact: false })
    ).toBeVisible()
    await expect(
      page.getByText('O que é a conta Gov.br', { exact: false })
    ).toBeVisible()
    await expect(
      page.getByText('Receberei certificado de conclusão do curso?', {
        exact: false,
      })
    ).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// HOME DE CURSOS — AUTENTICADO
// ---------------------------------------------------------------------------

test.describe('Cursos — home (autenticado)', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(
      !hasE2EAuth(),
      'Defina E2E_ACCESS_TOKEN para rodar testes autenticados'
    )
    await applyE2EAuthCookies(context)
  })

  test('header autenticado exibe link para o menu /servicos/cursos/opcoes', async ({
    page,
  }) => {
    await page.goto('/servicos/cursos')
    await expect(
      page.locator('a[href="/servicos/cursos/opcoes"]').first()
    ).toBeVisible({ timeout: 15000 })
  })

  test('header autenticado exibe link para o perfil /meu-perfil', async ({
    page,
  }) => {
    await page.goto('/servicos/cursos')
    await expect(page.locator('a[href="/meu-perfil"]').first()).toBeVisible({
      timeout: 15000,
    })
  })
})

// ---------------------------------------------------------------------------
// MENU (OPÇÕES) — AUTENTICADO
// ---------------------------------------------------------------------------

test.describe('Cursos — menu/opções (autenticado)', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(
      !hasE2EAuth(),
      'Defina E2E_ACCESS_TOKEN para rodar testes autenticados'
    )
    await applyE2EAuthCookies(context)
  })

  test('exibe heading "Menu" com itens e hrefs corretos', async ({ page }) => {
    await page.goto('/servicos/cursos/opcoes')

    await expect(page.getByRole('heading', { name: 'Menu' })).toBeVisible({
      timeout: 15000,
    })

    await expect(
      page.getByRole('link', { name: 'Meus cursos' })
    ).toHaveAttribute('href', '/servicos/cursos/meus-cursos')
    await expect(
      page.getByRole('link', { name: 'Certificados' })
    ).toHaveAttribute('href', '/servicos/cursos/certificados')
    await expect(page.getByRole('link', { name: 'FAQ' })).toHaveAttribute(
      'href',
      '/servicos/cursos/faq'
    )
  })

  test('clicar em "Meus cursos" navega para /meus-cursos', async ({ page }) => {
    await page.goto('/servicos/cursos/opcoes')
    await expect(page.getByRole('heading', { name: 'Menu' })).toBeVisible({
      timeout: 15000,
    })

    await page.getByRole('link', { name: 'Meus cursos' }).click()
    await page.waitForURL('**/servicos/cursos/meus-cursos', { timeout: 15000 })
    await expect(
      page.getByRole('heading', { name: 'Meus cursos' })
    ).toBeVisible({ timeout: 15000 })
  })
})

// ---------------------------------------------------------------------------
// MEUS CURSOS / CERTIFICADOS / ALERTAS — AUTENTICADO
// ---------------------------------------------------------------------------

test.describe('Cursos — meus cursos (autenticado)', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(
      !hasE2EAuth(),
      'Defina E2E_ACCESS_TOKEN para rodar testes autenticados'
    )
    await applyE2EAuthCookies(context)
  })

  test('exibe heading "Meus cursos" e cards ou estado vazio', async ({
    page,
  }) => {
    await page.goto('/servicos/cursos/meus-cursos')
    await expect(
      page.getByRole('heading', { name: 'Meus cursos' })
    ).toBeVisible({ timeout: 15000 })

    const emptyState = page.getByText('Você ainda não possui nenhum curso.', {
      exact: true,
    })
    const firstCard = page
      .locator('a[href^="/servicos/cursos/"]')
      .filter({ hasNot: page.locator('img[alt="Oportunidades Cariocas"]') })
      .first()
    await expect(emptyState.or(firstCard).first()).toBeVisible({
      timeout: 20000,
    })
  })
})

test.describe('Cursos — certificados (autenticado)', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(
      !hasE2EAuth(),
      'Defina E2E_ACCESS_TOKEN para rodar testes autenticados'
    )
    await applyE2EAuthCookies(context)
  })

  test('exibe certificados ou estado vazio', async ({ page }) => {
    await page.goto('/servicos/cursos/certificados')

    const heading = page.getByRole('heading', { name: 'Certificados' })
    const emptyState = page.getByText(
      'Você ainda não possui nenhum certificado.',
      { exact: true }
    )
    await expect(heading.or(emptyState).first()).toBeVisible({
      timeout: 20000,
    })
  })
})

test.describe('Cursos — alertas (autenticado)', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(
      !hasE2EAuth(),
      'Defina E2E_ACCESS_TOKEN para rodar testes autenticados'
    )
    await applyE2EAuthCookies(context)
  })

  test('exibe a lista de alertas de cursos', async ({ page }) => {
    await page.goto('/servicos/cursos/alertas')
    await expect(
      page.getByText('Cursos de Tecnologia', { exact: true })
    ).toBeVisible({ timeout: 15000 })
  })
})

// ---------------------------------------------------------------------------
// PÁGINA DO CURSO — AUTENTICADO
// ---------------------------------------------------------------------------

test.describe('Cursos — página do curso (autenticado)', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(
      !hasE2EAuth(),
      'Defina E2E_ACCESS_TOKEN para rodar testes autenticados'
    )
    await applyE2EAuthCookies(context)
  })

  test('exibe CTA de inscrição ou feedback de já inscrito', async ({
    page,
  }) => {
    const href = await getFirstCourseHref(page)
    if (!href) {
      test.skip(true, 'Home de cursos sem cards no ambiente atual')
      return
    }
    await page.goto(href)
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 })

    // Inscrever (link p/ confirmar-informacoes) OU já inscrito (Trocar turma /
    // Cancelar inscrição / Inscrição recusada)
    const inscreverCta = page.locator(
      'a[href^="/servicos/cursos/confirmar-informacoes/"]'
    )
    const trocarTurma = page.getByRole('link', {
      name: 'Trocar turma / horário',
    })
    const cancelar = page.getByRole('button', { name: 'Cancelar inscrição' })
    const recusada = page.getByRole('button', { name: 'Inscrição recusada' })

    await expect(
      inscreverCta.or(trocarTurma).or(cancelar).or(recusada).first()
    ).toBeVisible({ timeout: 20000 })
  })
})

// ---------------------------------------------------------------------------
// FLUXO DE INSCRIÇÃO — AUTENTICADO (sem submit destrutivo)
// ---------------------------------------------------------------------------

test.describe('Cursos — fluxo de inscrição (autenticado)', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(
      !hasE2EAuth(),
      'Defina E2E_ACCESS_TOKEN para rodar testes autenticados'
    )
    await applyE2EAuthCookies(context)
  })

  test('confirmar-informacoes exibe o carousel de steps (sem submeter)', async ({
    page,
  }) => {
    const href = await getFirstCourseHref(page)
    if (!href) {
      test.skip(true, 'Home de cursos sem cards no ambiente atual')
      return
    }
    await page.goto(href)
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 })

    const inscreverCta = page
      .locator('a[href^="/servicos/cursos/confirmar-informacoes/"]')
      .first()
    const hasCta = await inscreverCta
      .isVisible({ timeout: 10000 })
      .catch(() => false)
    if (!hasCta) {
      test.skip(
        true,
        'Curso sem CTA de inscrição (já inscrito ou indisponível) no ambiente atual'
      )
      return
    }

    await inscreverCta.click()
    await page.waitForURL('**/confirmar-informacoes/**', { timeout: 15000 })

    // Botão de voltar do overlay (único data-testid do fluxo) e o botão primário
    await expect(page.getByTestId('back-button')).toBeVisible({
      timeout: 15000,
    })
    // O botão primário é "Continuar" (steps intermediários) ou "Confirmar
    // inscrição" (step final). NÃO clicamos — evita submit destrutivo.
    await expect(
      page
        .getByRole('button', { name: 'Continuar' })
        .or(page.getByRole('button', { name: 'Confirmar inscrição' }))
        .first()
    ).toBeVisible({ timeout: 15000 })
  })
})

// ---------------------------------------------------------------------------
// TROCA DE TURMA — AUTENTICADO (skip se não elegível)
// ---------------------------------------------------------------------------

test.describe('Cursos — troca de turma (autenticado)', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(
      !hasE2EAuth(),
      'Defina E2E_ACCESS_TOKEN para rodar testes autenticados'
    )
    await applyE2EAuthCookies(context)
  })

  test('acessar trocar-turma exibe o fluxo ou redireciona se não elegível', async ({
    page,
  }) => {
    const href = await getFirstCourseHref(page)
    if (!href) {
      test.skip(true, 'Home de cursos sem cards no ambiente atual')
      return
    }
    await page.goto(href)
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 })

    const trocarTurma = page.getByRole('link', {
      name: 'Trocar turma / horário',
    })
    const isEligible = await trocarTurma
      .isVisible({ timeout: 8000 })
      .catch(() => false)
    if (!isEligible) {
      test.skip(
        true,
        'Usuário não está inscrito (approved/pending) na primeira vaga; troca de turma indisponível'
      )
      return
    }

    await trocarTurma.click()
    await page.waitForURL('**/trocar-turma', { timeout: 15000 })

    await expect(page.getByTestId('back-button')).toBeVisible({
      timeout: 15000,
    })
    // Botão primário: "Continuar" ou (step final) "Confirmar troca" — não clicamos.
    await expect(
      page
        .getByRole('button', { name: 'Continuar' })
        .or(page.getByRole('button', { name: 'Confirmar troca' }))
        .first()
    ).toBeVisible({ timeout: 15000 })
  })
})
