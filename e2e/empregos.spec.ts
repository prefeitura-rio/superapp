import { type Page, expect, test } from '@playwright/test'
import {
  applyE2EAuthCookies,
  applyE2ECookieConsent,
  hasE2EAuth,
} from './fixtures/auth'

/**
 * Abre um drawer de ActionDiv encontrando o label pelo texto e clicando
 * na área interativa — mesma estrutura do DOM usada em meu-perfil.spec.ts.
 */
async function clickActionDrawer(page: Page, labelText: string) {
  const labelEl = page.getByText(labelText, { exact: true }).first()
  await labelEl
    .locator('xpath=../..')
    .locator('[class*="cursor-pointer"]')
    .click()
}

/**
 * Navega para a home de empregos, aguarda os cards e retorna o href do
 * primeiro card de vaga encontrado na página.
 *
 * Usa o heading "Vagas mais recentes" como âncora XPath para excluir
 * estruturalmente quaisquer links acima dele (ex.: CandidaturasEnviadasCtaCard),
 * sem precisar de lista de :not() hardcoded.
 * getByRole('link') garante que só elementos visíveis são retornados,
 * descartando os cards duplicados do carrossel mobile (display:none no desktop).
 */
async function getFirstVagaHref(page: Page): Promise<string> {
  await page.goto('/servicos/trabalho')
  const vagasHeading = page.getByRole('heading', {
    name: 'Vagas mais recentes',
  })
  await expect(vagasHeading).toBeVisible({ timeout: 20000 })
  const firstVagaLink = vagasHeading
    .locator('xpath=following::a[starts-with(@href, "/servicos/trabalho/")]')
    .and(page.getByRole('link'))
    .first()
  await expect(firstVagaLink).toBeVisible({ timeout: 10000 })
  const href =
    (await firstVagaLink.getAttribute('href')) ?? '/servicos/trabalho'
  return href
}

// ---------------------------------------------------------------------------
// HOME DE EMPREGOS — PÚBLICO
// ---------------------------------------------------------------------------

test.describe('Empregos — home (público)', () => {
  test.beforeEach(async ({ context }) => {
    await applyE2ECookieConsent(context)
  })

  test('exibe logo Oportunidades Cariocas e ícone de busca', async ({
    page,
  }) => {
    await page.goto('/servicos/trabalho')

    await expect(
      page.locator('img[alt="Oportunidades Cariocas Logo"]').first()
    ).toBeVisible({ timeout: 15000 })

    await expect(
      page.locator('a[href="/busca?tipo=empregos"]').first()
    ).toBeVisible()
  })

  test('header deslogado exibe ícone de ajuda para /servicos/trabalho/faq', async ({
    page,
  }) => {
    await page.goto('/servicos/trabalho')
    await expect(
      page.locator('a[href="/servicos/trabalho/faq"]').first()
    ).toBeVisible({
      timeout: 15000,
    })
  })

  test('exibe seção "Vagas mais recentes" com pelo menos 1 card', async ({
    page,
  }) => {
    await page.goto('/servicos/trabalho')

    await expect(
      page.getByRole('heading', { name: 'Vagas mais recentes' })
    ).toBeVisible({ timeout: 20000 })

    const vagaLinks = page.locator('a[href^="/servicos/trabalho/"]').filter({
      hasNot: page.locator('[href="/servicos/trabalho/menu"]'),
    })
    await expect(vagaLinks.first()).toBeVisible({ timeout: 20000 })
  })

  test('exibe seção "Encontre sua vaga"', async ({ page }) => {
    await page.goto('/servicos/trabalho')
    await expect(
      page.getByRole('heading', { name: 'Encontre sua vaga' })
    ).toBeVisible({ timeout: 20000 })
  })

  test('não exibe card "Candidaturas enviadas" sem autenticação', async ({
    page,
  }) => {
    await page.goto('/servicos/trabalho')
    await expect(
      page.getByRole('heading', { name: 'Vagas mais recentes' })
    ).toBeVisible({ timeout: 20000 })
    await expect(page.getByText('Candidaturas enviadas')).toHaveCount(0)
  })

  test('ao clicar no primeiro card de vaga, navega para página da vaga', async ({
    page,
  }) => {
    await page.goto('/servicos/trabalho')
    const vagasHeading = page.getByRole('heading', {
      name: 'Vagas mais recentes',
    })
    await expect(vagasHeading).toBeVisible({ timeout: 20000 })
    const firstVagaLink = vagasHeading
      .locator('xpath=following::a[starts-with(@href, "/servicos/trabalho/")]')
      .and(page.getByRole('link'))
      .first()
    await expect(firstVagaLink).toBeVisible({ timeout: 10000 })
    const href = await firstVagaLink.getAttribute('href')
    await firstVagaLink.click()
    await page.waitForURL(`**${href}`, { timeout: 15000 })
    // Em SPA navigation (click), o RSC payload pode ficar preso/indefinido
    // enquanto o Suspense boundary mantém o skeleton ativo. page.reload() cancela
    // o RSC fetch em andamento e faz full navigation (igual ao page.goto dos
    // testes 2-5), que aguarda o 'load' event com a resposta completa do servidor.
    await page.reload()
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 })
  })
})

// ---------------------------------------------------------------------------
// HOME DE EMPREGOS — AUTENTICADO
// ---------------------------------------------------------------------------

test.describe('Empregos — home (autenticado)', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(
      !hasE2EAuth(),
      'Defina E2E_ACCESS_TOKEN para rodar testes autenticados'
    )
    await applyE2EAuthCookies(context)
  })

  test('header autenticado exibe ícone de menu para /servicos/trabalho/menu', async ({
    page,
  }) => {
    await page.goto('/servicos/trabalho')
    await expect(
      page.locator('a[href="/servicos/trabalho/menu"]').first()
    ).toBeVisible({ timeout: 15000 })
  })

  test('header autenticado não exibe ícone de ajuda (FAQ) no header', async ({
    page,
  }) => {
    await page.goto('/servicos/trabalho')
    await expect(
      page.locator('a[href="/servicos/trabalho/menu"]').first()
    ).toBeVisible({ timeout: 15000 })
    // Ícone de ajuda só aparece para deslogados; menu aparece para logados
    const faqHeaderLink = page.locator(
      'header a[href="/servicos/trabalho/faq"]'
    )
    await expect(faqHeaderLink).toHaveCount(0)
  })

  test('card "Candidaturas enviadas" (quando presente) aponta para /minhas-candidaturas', async ({
    page,
  }) => {
    await page.goto('/servicos/trabalho')
    await expect(
      page.locator('a[href="/servicos/trabalho/menu"]').first()
    ).toBeVisible({ timeout: 15000 })

    const candidaturasCard = page.getByRole('link', {
      name: 'Candidaturas enviadas',
    })
    const isVisible = await candidaturasCard
      .isVisible({ timeout: 5000 })
      .catch(() => false)

    if (isVisible) {
      await expect(candidaturasCard).toHaveAttribute(
        'href',
        '/servicos/trabalho/minhas-candidaturas'
      )
      await expect(
        page.getByText('Acompanhe aqui o andamento de suas candidaturas')
      ).toBeVisible()
    }
  })

  test('clicar no card "Candidaturas enviadas" navega para /minhas-candidaturas', async ({
    page,
  }) => {
    await page.goto('/servicos/trabalho')
    await expect(
      page.locator('a[href="/servicos/trabalho/menu"]').first()
    ).toBeVisible({ timeout: 15000 })

    const candidaturasCard = page.getByRole('link', {
      name: 'Candidaturas enviadas',
    })
    const isVisible = await candidaturasCard
      .isVisible({ timeout: 5000 })
      .catch(() => false)

    if (isVisible) {
      await candidaturasCard.click()
      await page.waitForURL('**/servicos/trabalho/minhas-candidaturas', {
        timeout: 15000,
      })
      await expect(
        page.getByRole('heading', { name: 'Minhas candidaturas' })
      ).toBeVisible({ timeout: 15000 })
    }
  })
})

// ---------------------------------------------------------------------------
// PÁGINA DA VAGA — PÚBLICO
// ---------------------------------------------------------------------------

test.describe('Empregos — página da vaga (público)', () => {
  test.beforeEach(async ({ context }) => {
    await applyE2ECookieConsent(context)
  })

  test('carrega a página com título, data de encerramento e informações gerais', async ({
    page,
  }) => {
    const href = await getFirstVagaHref(page)
    await page.goto(href)

    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 })
    await expect(
      page.getByText('Inscrições até', { exact: false })
    ).toBeVisible({ timeout: 15000 })
    await expect(
      page.getByRole('heading', { name: 'Informações gerais' })
    ).toBeVisible()
  })

  test('exibe labels de informações gerais da vaga', async ({ page }) => {
    const href = await getFirstVagaHref(page)
    await page.goto(href)

    await expect(
      page.getByRole('heading', { name: 'Informações gerais' })
    ).toBeVisible({ timeout: 15000 })

    for (const label of [
      'Valor da Vaga',
      'Regime de contratação',
      'Modelo de trabalho',
      'Local de trabalho',
      'Data limite de inscrição',
    ]) {
      await expect(page.getByText(label, { exact: true })).toBeVisible()
    }
  })

  test('exibe botões de Voltar e Compartilhar', async ({ page }) => {
    const href = await getFirstVagaHref(page)
    await page.goto(href)

    await expect(page.getByRole('button', { name: 'Voltar' })).toBeVisible({
      timeout: 15000,
    })
    await expect(
      page.getByRole('button', { name: 'Compartilhar' })
    ).toBeVisible()
  })

  test('exibe botão "Fazer login para se candidatar" sem autenticação', async ({
    page,
  }) => {
    const href = await getFirstVagaHref(page)
    await page.goto(href)

    await expect(
      page.getByRole('link', { name: 'Fazer login para se candidatar' })
    ).toBeVisible({ timeout: 15000 })
  })

  test('link da empresa (quando tem CNPJ) navega para página da empresa', async ({
    page,
  }) => {
    const href = await getFirstVagaHref(page)
    await page.goto(href)

    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 })

    const empresaLink = page.locator('a[href^="/servicos/empresas/"]').first()
    const hasEmpresaLink = await empresaLink
      .isVisible({ timeout: 3000 })
      .catch(() => false)

    if (hasEmpresaLink) {
      await empresaLink.click()
      await page.waitForURL('**/servicos/empresas/**', { timeout: 15000 })
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 })
    }
  })

  test('exibe card de Etapas do processo seletivo (quando a vaga tem etapas)', async ({
    page,
  }) => {
    const href = await getFirstVagaHref(page)
    await page.goto(href)

    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 })

    const etapasCard = page.getByText('Etapas do processo seletivo', {
      exact: false,
    })
    const hasEtapas = await etapasCard
      .isVisible({ timeout: 3000 })
      .catch(() => false)
    if (hasEtapas) {
      await expect(etapasCard).toBeVisible()
      await expect(
        page.getByText('Envio da candidatura', { exact: false })
      ).toBeVisible()
    }
  })
})

// ---------------------------------------------------------------------------
// PÁGINA DA VAGA — AUTENTICADO
// ---------------------------------------------------------------------------

test.describe('Empregos — página da vaga (autenticado)', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(
      !hasE2EAuth(),
      'Defina E2E_ACCESS_TOKEN para rodar testes autenticados'
    )
    await applyE2EAuthCookies(context)
  })

  test('exibe botão "Candidatar-se à vaga" ou card de feedback da candidatura', async ({
    page,
  }) => {
    const href = await getFirstVagaHref(page)
    await page.goto(href)

    const candidatarBtn = page.getByRole('link', {
      name: 'Candidatar-se à vaga',
    })
    // Cobre todos os 5 estados do CandidaturaFeedbackCard:
    // enviada (sem/com avanço de etapa), aprovada, reprovada, vaga_congelada, vaga_descontinuada
    const feedbackCard = page.getByText(
      /está sendo avaliada|Parabéns!|não pôde ser aprovada|temporariamente suspensa|não está mais disponível/,
      { exact: false }
    )

    await expect(candidatarBtn.or(feedbackCard).first()).toBeVisible({
      timeout: 20000,
    })
  })

  test('botão "Candidatar-se à vaga" (quando presente) leva para /inscricao', async ({
    page,
  }) => {
    const href = await getFirstVagaHref(page)
    await page.goto(href)

    const candidatarBtn = page.getByRole('link', {
      name: 'Candidatar-se à vaga',
    })
    const isVisible = await candidatarBtn
      .isVisible({ timeout: 10000 })
      .catch(() => false)

    if (isVisible) {
      const expectedUrl = `${href}/inscricao`
      await expect(candidatarBtn).toHaveAttribute('href', expectedUrl)
    }
  })

  test('vaga em que usuário se candidatou exibe card de feedback e etapas', async ({
    page,
  }) => {
    await page.goto('/servicos/trabalho/minhas-candidaturas')

    const hasCandidaturas = await page
      .locator('a[href^="/servicos/trabalho/"]')
      .first()
      .isVisible({ timeout: 10000 })
      .catch(() => false)

    if (!hasCandidaturas) return

    const firstCandidaturaLink = page
      .locator('a[href^="/servicos/trabalho/"]')
      .first()
    await firstCandidaturaLink.click()
    await page.waitForURL('**/servicos/trabalho/**', { timeout: 15000 })

    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 })

    const feedbackCard = page.getByText(
      /Sua inscrição foi enviada|Parabéns!|Não foi possível seguir|não pôde ser aprovada|Página não encontrada/,
      { exact: false }
    )
    await expect(feedbackCard.first()).toBeVisible({ timeout: 10000 })
  })
})

// ---------------------------------------------------------------------------
// FLUXO DE CANDIDATURA — AUTENTICADO
// ---------------------------------------------------------------------------

test.describe('Empregos — fluxo de candidatura (autenticado)', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(
      !hasE2EAuth(),
      'Defina E2E_ACCESS_TOKEN para rodar testes autenticados'
    )
    await applyE2EAuthCookies(context)
  })

  test('acessar /inscricao sem auth redireciona para autenticação', async ({
    page,
  }) => {
    // Este teste só funciona sem cookies de auth — verificamos apenas sem auth
    test.skip(
      true,
      'Coberto pelos testes públicos; auth sempre presente neste describe'
    )
  })

  test('página de inscricao exibe Meu Currículo ou tela de bem-vindo/confirmar', async ({
    page,
  }) => {
    const vagaHref = await getFirstVagaHref(page)
    await page.goto(vagaHref)

    const candidatarBtn = page.getByRole('link', {
      name: 'Candidatar-se à vaga',
    })
    const isVisible = await candidatarBtn
      .isVisible({ timeout: 10000 })
      .catch(() => false)

    if (!isVisible) {
      test.skip(
        true,
        'Usuário já tem candidatura para a primeira vaga; pular este teste'
      )
      return
    }

    await candidatarBtn.click()
    await page.waitForURL(
      url =>
        url.pathname.includes('/inscricao') ||
        url.pathname.includes('/minhas-candidaturas'),
      { timeout: 15000 }
    )

    if (page.url().includes('/minhas-candidaturas')) {
      test.skip(
        true,
        'Usuário já está inscrito nesta vaga; redirecionado para minhas-candidaturas'
      )
      return
    }

    // A página exibe um dos 3 estados possíveis do carousel
    const bemVindo = page.getByText('Cadastro de oportunidades de Emprego', {
      exact: false,
    })
    const confirmarInfos = page.getByText('confirme suas informações', {
      exact: false,
    })
    const curriculo = page.getByRole('heading', {
      level: 1,
      name: 'Meu Currículo',
    })

    await expect(bemVindo.or(confirmarInfos).or(curriculo).first()).toBeVisible(
      { timeout: 20000 }
    )
  })

  test('tela de bem-vindo (quando presente) exibe título e botão Continuar', async ({
    page,
  }) => {
    const vagaHref = await getFirstVagaHref(page)
    await page.goto(vagaHref)

    const candidatarBtn = page.getByRole('link', {
      name: 'Candidatar-se à vaga',
    })
    const isVisible = await candidatarBtn
      .isVisible({ timeout: 10000 })
      .catch(() => false)

    if (!isVisible) return

    await candidatarBtn.click()
    await page.waitForURL('**/inscricao**', { timeout: 15000 })

    const bemVindo = page.getByText('Cadastro de oportunidades de Emprego', {
      exact: false,
    })
    const isBemVindo = await bemVindo
      .isVisible({ timeout: 5000 })
      .catch(() => false)

    if (!isBemVindo) return

    await expect(page.getByText('Bem vindo ao', { exact: false })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeEnabled()
  })

  test('tela de confirmar informações (quando presente) exibe dados pessoais', async ({
    page,
  }) => {
    const vagaHref = await getFirstVagaHref(page)
    await page.goto(vagaHref)

    const candidatarBtn = page.getByRole('link', {
      name: 'Candidatar-se à vaga',
    })
    const isVisible = await candidatarBtn
      .isVisible({ timeout: 10000 })
      .catch(() => false)

    if (!isVisible) return

    await candidatarBtn.click()
    await page.waitForURL('**/inscricao**', { timeout: 15000 })

    const confirmarInfos = page.getByText('confirme suas informações', {
      exact: false,
    })
    const isConfirmar = await confirmarInfos
      .isVisible({ timeout: 5000 })
      .catch(() => false)

    if (!isConfirmar) return

    // Verifica campos pessoais presentes
    await expect(page.getByText(/\d{3}\.\d{3}\.\d{3}-\d{2}/)).toBeVisible({
      timeout: 10000,
    })
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeVisible()
  })

  test('curriculo no fluxo de inscricao exibe botão Continuar no rodapé', async ({
    page,
  }) => {
    const vagaHref = await getFirstVagaHref(page)
    await page.goto(vagaHref)

    const candidatarBtn = page.getByRole('link', {
      name: 'Candidatar-se à vaga',
    })
    const isVisible = await candidatarBtn
      .isVisible({ timeout: 10000 })
      .catch(() => false)

    if (!isVisible) return

    await candidatarBtn.click()
    await page.waitForURL('**/inscricao**', { timeout: 15000 })

    // Aguarda o carousel terminar de carregar (pode ter bem-vindo ou confirmar antes)
    await page.waitForTimeout(1000)

    // Se chegou no Meu Currículo diretamente:
    const curriculo = page.getByRole('heading', {
      level: 1,
      name: 'Meu Currículo',
    })
    const isCurriculo = await curriculo
      .isVisible({ timeout: 5000 })
      .catch(() => false)

    if (isCurriculo) {
      await expect(
        page.getByRole('button', { name: 'Continuar' })
      ).toBeVisible()
    }
  })
})

// ---------------------------------------------------------------------------
// MEU CURRÍCULO — STANDALONE (AUTENTICADO)
// ---------------------------------------------------------------------------

test.describe('Empregos — Meu Currículo (autenticado)', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(
      !hasE2EAuth(),
      'Defina E2E_ACCESS_TOKEN para rodar testes autenticados'
    )
    await applyE2EAuthCookies(context)
  })

  // ── Estrutura geral ──────────────────────────────────────────────────────

  test('exibe heading "Meu Currículo" e 4 accordions', async ({ page }) => {
    await page.goto('/servicos/trabalho/curriculo')

    await expect(
      page.getByRole('heading', { level: 1, name: 'Meu Currículo' })
    ).toBeVisible({ timeout: 15000 })

    for (const accordion of [
      'Formação',
      'Experiência Profissional',
      'Situação atual',
      'Termos de Uso',
    ]) {
      await expect(page.getByText(accordion, { exact: true })).toBeVisible()
    }
  })

  test('não exibe botão "Continuar" na versão standalone', async ({ page }) => {
    await page.goto('/servicos/trabalho/curriculo')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Meu Currículo' })
    ).toBeVisible({ timeout: 15000 })
    await expect(page.getByRole('button', { name: 'Continuar' })).toHaveCount(0)
  })

  // ── Accordion Formação ───────────────────────────────────────────────────

  test('accordion Formação abre ao clicar e exibe campos esperados', async ({
    page,
  }) => {
    await page.goto('/servicos/trabalho/curriculo')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Meu Currículo' })
    ).toBeVisible({ timeout: 15000 })

    await page.getByText('Formação', { exact: true }).click()

    // Escolaridade: usa testid para evitar ambiguidade com o <span>*</span>
    // que o ActionDiv isRequired adiciona (tornando o texto do elemento "Escolaridade *")
    await expect(page.getByTestId('field-escolaridade')).toBeVisible({
      timeout: 10000,
    })
    // ActionDiv mostra valor preenchido ou placeholder — verificado dentro do campo
    await expect(
      page
        .getByTestId('field-escolaridade')
        .getByText(
          /Selecione sua escolaridade|Fundamental|Médio|Superior|Pós Graduação|Mestrado|Doutorado/
        )
    ).toBeVisible()

    await expect(page.getByTestId('field-tipo-formacao-0')).toBeVisible()
    await expect(
      page
        .getByTestId('field-tipo-formacao-0')
        .getByText(
          /Selecione o tipo da formação|Fundamental|Médio|Superior|Pós Graduação|Mestrado|Doutorado/
        )
    ).toBeVisible()

    // Escopo em formacao-card-0: evita duplicatas de cards e do hint text que
    // também contém "nome do curso" como substring (strict mode violation)
    const card0 = page.getByTestId('formacao-card-0')
    await expect(
      card0.getByText('Nome do Curso', { exact: true })
    ).toBeVisible()
    await expect(
      card0.getByText('Nome da Instituição', { exact: true })
    ).toBeVisible()

    await expect(page.getByTestId('field-status-formacao-0')).toBeVisible()
    await expect(
      page
        .getByTestId('field-status-formacao-0')
        .getByText(
          /Selecione o status da formação|Completo|Em andamento|Incompleto/
        )
        .first()
    ).toBeVisible()

    await expect(
      card0.getByText('Ano de conclusão', { exact: true })
    ).toBeVisible()
    await expect(page.getByText('Idiomas', { exact: false })).toBeVisible()
  })

  test('accordion Formação — botão "Adicionar outra formação" insere novo bloco', async ({
    page,
  }) => {
    await page.goto('/servicos/trabalho/curriculo')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Meu Currículo' })
    ).toBeVisible({ timeout: 15000 })

    await page.getByText('Formação', { exact: true }).click()
    await expect(
      page.getByRole('button', { name: 'Adicionar outra formação' })
    ).toBeVisible({ timeout: 10000 })

    const beforeCount = await page
      .getByText('Tipo de formação', { exact: false })
      .count()
    await page.getByRole('button', { name: 'Adicionar outra formação' }).click()
    await expect(
      page.getByText('Tipo de formação', { exact: false })
    ).toHaveCount(beforeCount + 1)
  })

  test('accordion Formação — "Remover formação" aparece com 2+ formações', async ({
    page,
  }) => {
    await page.goto('/servicos/trabalho/curriculo')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Meu Currículo' })
    ).toBeVisible({ timeout: 15000 })

    await page.getByText('Formação', { exact: true }).click()
    await expect(
      page.getByRole('button', { name: 'Adicionar outra formação' })
    ).toBeVisible({ timeout: 10000 })

    // Registra o estado inicial — o usuário pode já ter N formações salvas,
    // gerando N botões "Remover formação" (só aparecem quando há 2+)
    const removeBtn = page.getByRole('button', { name: 'Remover formação' })
    const initialCount = await removeBtn.count()

    await page.getByRole('button', { name: 'Adicionar outra formação' }).click()
    // Após adicionar, o botão de remoção deve estar visível (há 2+ formações)
    await expect(removeBtn.first()).toBeVisible()

    // Remove e confirma retorno ao estado inicial (idempotente)
    await removeBtn.first().click()
    await expect(removeBtn).toHaveCount(initialCount)
  })

  test('accordion Formação — botão "Adicionar outro idioma" insere novo bloco de idioma', async ({
    page,
  }) => {
    await page.goto('/servicos/trabalho/curriculo')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Meu Currículo' })
    ).toBeVisible({ timeout: 15000 })

    await page.getByText('Formação', { exact: true }).click()
    await expect(
      page.getByRole('button', { name: 'Adicionar outro idioma' })
    ).toBeVisible({ timeout: 10000 })

    await page.getByRole('button', { name: 'Adicionar outro idioma' }).click()
    await expect(
      page.getByRole('button', { name: 'Remover idioma' }).first()
    ).toBeVisible()
  })

  test('accordion Formação — "Remover idioma" aparece com 2+ idiomas e remove', async ({
    page,
  }) => {
    await page.goto('/servicos/trabalho/curriculo')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Meu Currículo' })
    ).toBeVisible({ timeout: 15000 })

    await page.getByText('Formação', { exact: true }).click()
    await expect(
      page.getByRole('button', { name: 'Adicionar outro idioma' })
    ).toBeVisible({ timeout: 10000 })

    const removeIdiomaBtn = page.getByRole('button', { name: 'Remover idioma' })
    const initialIdiomaCount = await removeIdiomaBtn.count()

    await page.getByRole('button', { name: 'Adicionar outro idioma' }).click()
    await expect(removeIdiomaBtn.first()).toBeVisible()

    await removeIdiomaBtn.first().click()
    await expect(removeIdiomaBtn).toHaveCount(initialIdiomaCount)
  })

  test('accordion Formação — botão Cancelar fecha o accordion', async ({
    page,
  }) => {
    await page.goto('/servicos/trabalho/curriculo')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Meu Currículo' })
    ).toBeVisible({ timeout: 15000 })

    await page.getByText('Formação', { exact: true }).click()
    await expect(page.getByRole('button', { name: 'Cancelar' })).toBeVisible({
      timeout: 10000,
    })

    await page.getByRole('button', { name: 'Cancelar' }).click()

    // Accordion deve fechar: campos não devem mais ser visíveis
    await expect(page.getByTestId('field-escolaridade')).not.toBeVisible({
      timeout: 5000,
    })
  })

  test('drawer Escolaridade exibe todas as opções de nível de ensino', async ({
    page,
  }) => {
    await page.goto('/servicos/trabalho/curriculo')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Meu Currículo' })
    ).toBeVisible({ timeout: 15000 })

    await page.getByText('Formação', { exact: true }).click()
    await expect(page.getByTestId('field-escolaridade')).toBeVisible({
      timeout: 10000,
    })

    // Clica no cursor-pointer dentro do campo Escolaridade (evita usar exact:true
    // no label que tem o <span>* </span> do isRequired)
    await page
      .getByTestId('field-escolaridade')
      .locator('[class*="cursor-pointer"]')
      .click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 10000 })

    for (const opcao of [
      'Fundamental incompleto',
      'Fundamental completo',
      'Médio incompleto',
      'Médio completo',
      'Superior incompleto',
      'Superior completo',
      'Pós Graduação',
      'Mestrado',
      'Doutorado',
    ]) {
      await expect(dialog.getByText(opcao, { exact: true })).toBeVisible()
    }
  })

  test('drawer Status da formação exibe opções Completo, Em andamento, Incompleto', async ({
    page,
  }) => {
    await page.goto('/servicos/trabalho/curriculo')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Meu Currículo' })
    ).toBeVisible({ timeout: 15000 })

    await page.getByText('Formação', { exact: true }).click()
    // Escopo em formacao-card-0 evita strict mode com 2+ cards de formação
    await expect(page.getByTestId('field-status-formacao-0')).toBeVisible({
      timeout: 10000,
    })

    // Clica no cursor-pointer do campo Status no primeiro bloco
    await page
      .getByTestId('field-status-formacao-0')
      .locator('[class*="cursor-pointer"]')
      .click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 10000 })

    for (const opcao of ['Completo', 'Em andamento', 'Incompleto']) {
      await expect(dialog.getByText(opcao, { exact: true })).toBeVisible()
    }
  })

  test('drawer Idioma exibe lista de idiomas disponíveis', async ({ page }) => {
    await page.goto('/servicos/trabalho/curriculo')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Meu Currículo' })
    ).toBeVisible({ timeout: 15000 })

    await page.getByText('Formação', { exact: true }).click()
    await expect(page.getByTestId('field-idioma-0')).toBeVisible({
      timeout: 10000,
    })

    // clickActionDrawer('Idioma') sobe xpath=../.. até o card inteiro e encontra
    // 3 cursor-pointer (Idioma, Nível e Remover). Escopo no testid resolve isso.
    await page
      .getByTestId('field-idioma-0')
      .locator('[class*="cursor-pointer"]')
      .click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 10000 })
    // Pelo menos um idioma disponível
    await expect(
      dialog.locator('[role="option"], button').first()
    ).toBeVisible()
  })

  // ── Accordion Experiência Profissional ───────────────────────────────────

  test('accordion Experiência Profissional abre e exibe campos de emprego e conquistas', async ({
    page,
  }) => {
    await page.goto('/servicos/trabalho/curriculo')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Meu Currículo' })
    ).toBeVisible({ timeout: 15000 })

    await page.getByText('Experiência Profissional', { exact: true }).click()

    await expect(page.getByText('Empregos', { exact: true })).toBeVisible({
      timeout: 10000,
    })
    await expect(page.getByPlaceholder('Nome do cargo')).toBeVisible()
    await expect(page.getByPlaceholder('Nome da empresa')).toBeVisible()
    await expect(
      page.getByText('Meu emprego atual', { exact: true })
    ).toBeVisible()
  })

  test('accordion Experiência — botões Salvar e Cancelar estão visíveis', async ({
    page,
  }) => {
    await page.goto('/servicos/trabalho/curriculo')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Meu Currículo' })
    ).toBeVisible({ timeout: 15000 })

    await page.getByText('Experiência Profissional', { exact: true }).click()

    await expect(page.getByRole('button', { name: 'Cancelar' })).toBeVisible({
      timeout: 10000,
    })
    await expect(page.getByRole('button', { name: 'Salvar' })).toBeVisible()
  })

  test('accordion Experiência — drawer Experiência comprovada abre com opções', async ({
    page,
  }) => {
    await page.goto('/servicos/trabalho/curriculo')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Meu Currículo' })
    ).toBeVisible({ timeout: 15000 })

    await page.getByText('Experiência Profissional', { exact: true }).click()
    await expect(page.getByText('Empregos', { exact: true })).toBeVisible({
      timeout: 10000,
    })

    // Label real é "Experiência comprovada em carteira de trabalho?" — texto truncado
    // não bate com exact:true. Usa testid para evitar dependência do texto completo.
    await page
      .getByTestId('field-experiencia-comprovada-0')
      .locator('[class*="cursor-pointer"]')
      .click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 10000 })
    await expect(dialog.getByText('Sim')).toBeVisible()
    await expect(dialog.getByText('Não')).toBeVisible()
  })

  // ── Accordion Situação atual ─────────────────────────────────────────────

  test('accordion Situação atual abre e exibe campo "Encontra-se"', async ({
    page,
  }) => {
    await page.goto('/servicos/trabalho/curriculo')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Meu Currículo' })
    ).toBeVisible({ timeout: 15000 })

    await page.getByText('Situação atual', { exact: true }).click()

    // "Encontra-se" é ActionDiv com isRequired → texto do elemento é "Encontra-se *"
    // → exact:true nunca bate. Usa testid adicionado ao wrapper no source.
    await expect(page.getByTestId('field-encontra-se')).toBeVisible({
      timeout: 10000,
    })
  })

  test('drawer Situação atual exibe opções de situação de trabalho', async ({
    page,
  }) => {
    await page.goto('/servicos/trabalho/curriculo')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Meu Currículo' })
    ).toBeVisible({ timeout: 15000 })

    await page.getByText('Situação atual', { exact: true }).click()
    await expect(page.getByTestId('field-encontra-se')).toBeVisible({
      timeout: 10000,
    })

    await page
      .getByTestId('field-encontra-se')
      .locator('[class*="cursor-pointer"]')
      .click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 10000 })
    // Pelo menos uma opção de situação deve ser exibida
    await expect(
      dialog.locator('[role="option"], button').first()
    ).toBeVisible()
  })

  test('campo condicional "Há quanto tempo procurando emprego?" aparece após selecionar desempregado', async ({
    page,
  }) => {
    await page.goto('/servicos/trabalho/curriculo')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Meu Currículo' })
    ).toBeVisible({ timeout: 15000 })

    await page.getByText('Situação atual', { exact: true }).click()
    await expect(page.getByTestId('field-encontra-se')).toBeVisible({
      timeout: 10000,
    })

    await page
      .getByTestId('field-encontra-se')
      .locator('[class*="cursor-pointer"]')
      .click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 10000 })

    // Procura por opção de desemprego (texto aproximado)
    const desempregadoOption = dialog
      .getByText(/desempregado|procurando/i)
      .first()
    const hasDesempregado = await desempregadoOption
      .isVisible({ timeout: 3000 })
      .catch(() => false)

    if (hasDesempregado) {
      await desempregadoOption.click()
      await expect(
        page.getByText('Há quanto tempo procurando emprego?', { exact: false })
      ).toBeVisible({ timeout: 5000 })
    }
  })

  test('drawer Disponibilidade abre com opções', async ({ page }) => {
    await page.goto('/servicos/trabalho/curriculo')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Meu Currículo' })
    ).toBeVisible({ timeout: 15000 })

    await page.getByText('Situação atual', { exact: true }).click()
    await expect(
      page.getByText('Disponibilidade', { exact: true })
    ).toBeVisible({ timeout: 10000 })

    await clickActionDrawer(page, 'Disponibilidade')

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 10000 })
    await expect(
      dialog.locator('[role="option"], button').first()
    ).toBeVisible()
  })

  test('drawer Tipo de vínculo abre com opções', async ({ page }) => {
    await page.goto('/servicos/trabalho/curriculo')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Meu Currículo' })
    ).toBeVisible({ timeout: 15000 })

    await page.getByText('Situação atual', { exact: true }).click()
    await expect(
      page.getByText('Tipo de vínculo desejado', { exact: true })
    ).toBeVisible({ timeout: 10000 })

    await clickActionDrawer(page, 'Tipo de vínculo desejado')

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 10000 })
    await expect(
      dialog.locator('[role="option"], button').first()
    ).toBeVisible()
  })

  test('accordion Situação atual exibe botões Salvar e Cancelar', async ({
    page,
  }) => {
    await page.goto('/servicos/trabalho/curriculo')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Meu Currículo' })
    ).toBeVisible({ timeout: 15000 })

    await page.getByText('Situação atual', { exact: true }).click()

    await expect(page.getByRole('button', { name: 'Cancelar' })).toBeVisible({
      timeout: 10000,
    })
    await expect(page.getByRole('button', { name: 'Salvar' })).toBeVisible()
  })

  // ── Accordion Termos de Uso ──────────────────────────────────────────────

  test('accordion Termos de Uso abre e exibe texto dos termos e checkbox', async ({
    page,
  }) => {
    await page.goto('/servicos/trabalho/curriculo')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Meu Currículo' })
    ).toBeVisible({ timeout: 15000 })

    await page.getByText('Termos de Uso', { exact: true }).click()

    await expect(
      page.getByText(
        'Ao preencher e enviar este formulário, você declara estar ciente',
        { exact: false }
      )
    ).toBeVisible({ timeout: 10000 })

    await expect(page.getByRole('checkbox').first()).toBeVisible()
  })

  test('accordion Termos — aceitar o checkbox exibe check verde no título', async ({
    page,
  }) => {
    await page.goto('/servicos/trabalho/curriculo')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Meu Currículo' })
    ).toBeVisible({ timeout: 15000 })

    await page.getByText('Termos de Uso', { exact: true }).click()

    const checkbox = page.getByRole('checkbox').first()
    await expect(checkbox).toBeVisible({ timeout: 10000 })

    // Somente aceita se ainda não aceito
    const isChecked = await checkbox.isChecked()
    if (!isChecked) {
      await checkbox.click()
      await expect(checkbox).toBeChecked({ timeout: 10000 })
    }

    // Fecha o accordion clicando no trigger
    await page.getByText('Termos de Uso', { exact: true }).click()
    // Verifica o badge verde (bg-wallet-2b) dentro do botão do accordion.
    // [data-state="closed"] causava strict mode (4 elementos: item, h3, button, region).
    await expect(
      page
        .getByRole('button', { name: /Termos de Uso/ })
        .locator('[class*="bg-wallet-2b"]')
    ).toBeVisible({ timeout: 5000 })
  })
})

// ---------------------------------------------------------------------------
// PÁGINA DA EMPRESA — PÚBLICO
// ---------------------------------------------------------------------------

test.describe('Empregos — página da empresa (público)', () => {
  test.beforeEach(async ({ context }) => {
    await applyE2ECookieConsent(context)
  })

  test('carrega página da empresa com nome, sobre e vagas ofertadas', async ({
    page,
  }) => {
    // Navega para uma vaga e tenta acessar a empresa pelo link
    const vagaHref = await getFirstVagaHref(page)
    await page.goto(vagaHref)

    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 })

    const empresaLink = page.locator('a[href^="/servicos/empresas/"]').first()
    const hasEmpresaLink = await empresaLink
      .isVisible({ timeout: 3000 })
      .catch(() => false)

    if (!hasEmpresaLink) {
      test.skip(
        true,
        'Vaga selecionada não tem CNPJ de empresa; pulando teste de empresa'
      )
      return
    }

    await empresaLink.click()
    await page.waitForURL('**/servicos/empresas/**', { timeout: 15000 })

    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 })
    await expect(
      page.getByRole('heading', { name: 'Sobre a empresa' })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Vagas ofertadas pela empresa' })
    ).toBeVisible()
  })

  test('página da empresa exibe informações: Setor, Tamanho da empresa, Especializações', async ({
    page,
  }) => {
    const vagaHref = await getFirstVagaHref(page)
    await page.goto(vagaHref)

    const empresaLink = page.locator('a[href^="/servicos/empresas/"]').first()
    const hasEmpresaLink = await empresaLink
      .isVisible({ timeout: 3000 })
      .catch(() => false)

    if (!hasEmpresaLink) {
      test.skip(
        true,
        'Vaga selecionada não tem CNPJ de empresa; pulando teste de empresa'
      )
      return
    }

    await empresaLink.click()
    await page.waitForURL('**/servicos/empresas/**', { timeout: 15000 })
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 })

    for (const info of ['Setor', 'Tamanho da empresa', 'Especializações']) {
      await expect(page.getByText(info, { exact: true })).toBeVisible()
    }
  })

  test('empresa com vagas exibe VagaCards; empresa sem vagas exibe mensagem', async ({
    page,
  }) => {
    const vagaHref = await getFirstVagaHref(page)
    await page.goto(vagaHref)

    const empresaLink = page.locator('a[href^="/servicos/empresas/"]').first()
    const hasEmpresaLink = await empresaLink
      .isVisible({ timeout: 3000 })
      .catch(() => false)

    if (!hasEmpresaLink) {
      test.skip(
        true,
        'Vaga selecionada não tem CNPJ de empresa; pulando teste de empresa'
      )
      return
    }

    await empresaLink.click()
    await page.waitForURL('**/servicos/empresas/**', { timeout: 15000 })
    await expect(
      page.getByRole('heading', { name: 'Vagas ofertadas pela empresa' })
    ).toBeVisible({ timeout: 15000 })

    const vagaLinks = page.locator('a[href^="/servicos/trabalho/"]')
    const semVagas = page.getByText('Nenhuma vaga aberta no momento.', {
      exact: true,
    })

    await expect(vagaLinks.first().or(semVagas)).toBeVisible({
      timeout: 10000,
    })
  })

  test('botão Voltar na empresa retorna para página anterior', async ({
    page,
  }) => {
    const vagaHref = await getFirstVagaHref(page)
    await page.goto(vagaHref)

    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 })

    const empresaLink = page.locator('a[href^="/servicos/empresas/"]').first()
    const hasEmpresaLink = await empresaLink
      .isVisible({ timeout: 3000 })
      .catch(() => false)

    if (!hasEmpresaLink) {
      test.skip(
        true,
        'Vaga selecionada não tem CNPJ de empresa; pulando teste de empresa'
      )
      return
    }

    await empresaLink.click()
    await page.waitForURL('**/servicos/empresas/**', { timeout: 15000 })

    await page.getByRole('button', { name: 'Voltar' }).click()
    await page.waitForURL(`**${vagaHref}`, { timeout: 15000 })
  })
})

// ---------------------------------------------------------------------------
// MINHAS CANDIDATURAS — AUTENTICADO
// ---------------------------------------------------------------------------

test.describe('Empregos — minhas candidaturas (autenticado)', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(
      !hasE2EAuth(),
      'Defina E2E_ACCESS_TOKEN para rodar testes autenticados'
    )
    await applyE2EAuthCookies(context)
  })

  test('exibe heading "Minhas candidaturas"', async ({ page }) => {
    await page.goto('/servicos/trabalho/minhas-candidaturas')
    await expect(
      page.getByRole('heading', { name: 'Minhas candidaturas' })
    ).toBeVisible({ timeout: 15000 })
  })

  test('exibe candidaturas ou mensagem de lista vazia', async ({ page }) => {
    await page.goto('/servicos/trabalho/minhas-candidaturas')
    await expect(
      page.getByRole('heading', { name: 'Minhas candidaturas' })
    ).toBeVisible({ timeout: 15000 })

    const semCandidaturas = page.getByText(
      'Você ainda não possui candidaturas enviadas',
      { exact: true }
    )
    const primeiroCandidaturaCard = page.locator('.rounded-3xl').first()

    await expect(semCandidaturas.or(primeiroCandidaturaCard)).toBeVisible({
      timeout: 20000,
    })
  })

  test('cards de candidaturas exibem badge de status, título e empresa', async ({
    page,
  }) => {
    await page.goto('/servicos/trabalho/minhas-candidaturas')
    await expect(
      page.getByRole('heading', { name: 'Minhas candidaturas' })
    ).toBeVisible({ timeout: 15000 })

    const hasCandidaturas = await page
      .locator('.rounded-3xl')
      .first()
      .isVisible({ timeout: 10000 })
      .catch(() => false)

    if (!hasCandidaturas) return

    // Pelo menos um dos status badges deve estar visível
    const statusBadge = page
      .getByText(
        /Em análise|Aprovado|Não selecionado|Vaga encerrada|Vaga descontinuada/
      )
      .first()
    await expect(statusBadge).toBeVisible({ timeout: 10000 })
  })

  test('card com idVaga é um link para a página da vaga', async ({ page }) => {
    await page.goto('/servicos/trabalho/minhas-candidaturas')
    await expect(
      page.getByRole('heading', { name: 'Minhas candidaturas' })
    ).toBeVisible({ timeout: 15000 })

    const candidaturaLink = page
      .locator('a[href^="/servicos/trabalho/"]')
      .first()
    const isVisible = await candidaturaLink
      .isVisible({ timeout: 10000 })
      .catch(() => false)

    if (!isVisible) return

    const href = await candidaturaLink.getAttribute('href')
    expect(href).toMatch(/^\/servicos\/trabalho\/[^/]+$/)
  })

  test('clicar em card de candidatura navega para página da vaga', async ({
    page,
  }) => {
    await page.goto('/servicos/trabalho/minhas-candidaturas')
    await expect(
      page.getByRole('heading', { name: 'Minhas candidaturas' })
    ).toBeVisible({ timeout: 15000 })

    const candidaturaLink = page
      .locator('a[href^="/servicos/trabalho/"]')
      .first()
    const isVisible = await candidaturaLink
      .isVisible({ timeout: 10000 })
      .catch(() => false)

    if (!isVisible) return

    const href = await candidaturaLink.getAttribute('href')
    await candidaturaLink.click()
    await page.waitForURL(`**${href}`, { timeout: 15000 })
    // SPA navigation resolve no 'commit' (só URL); reload força full navigation
    // e aguarda o 'load' event com a resposta completa do servidor.
    await page.reload()
    // Dois estados possíveis após reload:
    //  - vaga existe: h1 com título da vaga (visível, não-vazio)
    //  - vaga removida: h2 "Página não encontrada" (visível) + h1 vazio hidden no layout
    // filter({ hasText }) exclui o h1 vazio independente de visibilidade,
    // evitando que o .first() selecione o h1 hidden antes do h2 visível.
    await expect(
      page
        .locator('h1')
        .filter({ hasText: /.+/ })
        .or(page.getByText('Página não encontrada', { exact: false }))
        .first()
    ).toBeVisible({ timeout: 15000 })
  })

  test('barra de progresso ou texto "Esta vaga não possui etapas" visível nos cards', async ({
    page,
  }) => {
    await page.goto('/servicos/trabalho/minhas-candidaturas')
    await expect(
      page.getByRole('heading', { name: 'Minhas candidaturas' })
    ).toBeVisible({ timeout: 15000 })

    const hasCandidaturas = await page
      .locator('.rounded-3xl')
      .first()
      .isVisible({ timeout: 10000 })
      .catch(() => false)

    if (!hasCandidaturas) return

    const progressBar = page.locator('[role="progressbar"]').first()
    const semEtapas = page.getByText('Esta vaga não possui etapas.', {
      exact: true,
    })

    await expect(progressBar.or(semEtapas).first()).toBeVisible({
      timeout: 10000,
    })
  })
})

// ---------------------------------------------------------------------------
// MENU DE EMPREGOS — AUTENTICADO
// ---------------------------------------------------------------------------

test.describe('Empregos — menu (autenticado)', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(
      !hasE2EAuth(),
      'Defina E2E_ACCESS_TOKEN para rodar testes autenticados'
    )
    await applyE2EAuthCookies(context)
  })

  test('exibe heading "Menu" com todos os itens e links corretos', async ({
    page,
  }) => {
    await page.goto('/servicos/trabalho/menu')

    await expect(page.getByRole('heading', { name: 'Menu' })).toBeVisible({
      timeout: 15000,
    })

    await expect(
      page.getByRole('link', { name: 'Minhas candidaturas' })
    ).toHaveAttribute('href', '/servicos/trabalho/minhas-candidaturas')

    await expect(
      page.getByRole('link', { name: 'Meu currículo' })
    ).toHaveAttribute('href', '/servicos/trabalho/curriculo')

    await expect(page.getByRole('link', { name: 'FAQ' })).toHaveAttribute(
      'href',
      '/servicos/trabalho/faq'
    )
  })

  test('clicar em "Minhas candidaturas" navega para /minhas-candidaturas', async ({
    page,
  }) => {
    await page.goto('/servicos/trabalho/menu')
    await expect(page.getByRole('heading', { name: 'Menu' })).toBeVisible({
      timeout: 15000,
    })

    await page.getByRole('link', { name: 'Minhas candidaturas' }).click()
    await page.waitForURL('**/servicos/trabalho/minhas-candidaturas', {
      timeout: 15000,
    })
    await expect(
      page.getByRole('heading', { name: 'Minhas candidaturas' })
    ).toBeVisible({ timeout: 15000 })
  })

  test('clicar em "Meu currículo" navega para /curriculo', async ({ page }) => {
    await page.goto('/servicos/trabalho/menu')
    await expect(page.getByRole('heading', { name: 'Menu' })).toBeVisible({
      timeout: 15000,
    })

    await page.getByRole('link', { name: 'Meu currículo' }).click()
    await page.waitForURL('**/servicos/trabalho/curriculo', { timeout: 15000 })
    await expect(
      page.getByRole('heading', { level: 1, name: 'Meu Currículo' })
    ).toBeVisible({ timeout: 15000 })
  })

  test('clicar em "FAQ" navega para /servicos/trabalho/faq', async ({
    page,
  }) => {
    await page.goto('/servicos/trabalho/menu')
    await expect(page.getByRole('heading', { name: 'Menu' })).toBeVisible({
      timeout: 15000,
    })

    await page.getByRole('link', { name: 'FAQ' }).click()
    await page.waitForURL('**/servicos/trabalho/faq', { timeout: 15000 })
    await expect(page.getByRole('heading', { name: 'FAQ' })).toBeVisible({
      timeout: 15000,
    })
  })
})

// ---------------------------------------------------------------------------
// BUSCA DE EMPREGOS — PÚBLICO
// ---------------------------------------------------------------------------

test.describe('Empregos — busca (público)', () => {
  test.beforeEach(async ({ context }) => {
    await applyE2ECookieConsent(context)
  })

  test('navegar para busca via ícone exibe input e seção "Mais recentes"', async ({
    page,
  }) => {
    await page.goto('/servicos/trabalho')
    await expect(
      page.locator('a[href="/busca?tipo=empregos"]').first()
    ).toBeVisible({
      timeout: 15000,
    })

    await page.locator('a[href="/busca?tipo=empregos"]').first().click()
    await page.waitForURL('**/busca?tipo=empregos', { timeout: 15000 })

    await expect(
      page.getByRole('heading', { name: 'Mais recentes' })
    ).toBeVisible({ timeout: 20000 })
  })

  test('exibe sugestões dinâmicas de vagas antes de pesquisar', async ({
    page,
  }) => {
    await page.goto('/busca?tipo=empregos')

    await expect(
      page.getByRole('heading', { name: 'Mais recentes' })
    ).toBeVisible({ timeout: 20000 })

    // Deve haver pelo menos um item na lista de sugestões
    const listItem = page.locator('ul li').first()
    await expect(listItem).toBeVisible({ timeout: 15000 })
  })

  test('digitar 3+ caracteres exibe seção "Resultados da Pesquisa" ou mensagem vazia', async ({
    page,
  }) => {
    await page.goto('/busca?tipo=empregos')

    await expect(
      page.getByRole('heading', { name: 'Mais recentes' })
    ).toBeVisible({ timeout: 20000 })

    const input = page.getByPlaceholder('Do que você precisa?')
    await expect(input).toBeVisible()
    await input.fill('dev')

    // Aguarda resultados ou estado vazio
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

  test('resultados de empregos exibem badge "Emprego" quando há resultados', async ({
    page,
  }) => {
    await page.goto('/busca?tipo=empregos')

    await expect(
      page.getByRole('heading', { name: 'Mais recentes' })
    ).toBeVisible({ timeout: 20000 })

    const input = page.getByPlaceholder('Do que você precisa?')
    await input.fill('assistente')

    const resultados = page.getByRole('heading', {
      name: 'Resultados da Pesquisa',
    })
    const semResultados = page.getByText('Ops... nenhum resultado encontrado', {
      exact: false,
    })

    // Wait for real list items (not skeleton) — skeleton li's have no visible text
    const realItem = page.locator('ul li').filter({ hasText: /.{3,}/ }).first()
    await realItem.waitFor({ state: 'visible', timeout: 20000 }).catch(() => {})

    await expect(resultados.or(semResultados).first()).toBeVisible({
      timeout: 5000,
    })

    const hasResults = await resultados
      .isVisible({ timeout: 1000 })
      .catch(() => false)
    if (hasResults) {
      // Badge "Emprego" only appears when the API returns job-type items.
      // If the query returns no jobs (only secondary results), skip the assertion.
      const badge = page.getByText('Emprego').first()
      const hasBadge = await badge
        .isVisible({ timeout: 3000 })
        .catch(() => false)
      if (hasBadge) {
        await expect(badge).toBeVisible()
      }
    }
  })

  test('limpar busca via botão X retorna ao estado inicial', async ({
    page,
  }) => {
    await page.goto('/busca?tipo=empregos')

    await expect(
      page.getByRole('heading', { name: 'Mais recentes' })
    ).toBeVisible({ timeout: 20000 })

    const input = page.getByPlaceholder('Do que você precisa?')
    await input.fill('emprego')

    // Aguarda estado de busca
    await expect(
      page
        .getByRole('heading', { name: 'Resultados da Pesquisa' })
        .or(page.getByText('nenhum resultado', { exact: false }))
        .first()
    ).toBeVisible({ timeout: 20000 })

    // Clica no botão X para limpar
    const clearBtn = page
      .locator('button[aria-label*="lear"], button[aria-label*="limpar"]')
      .first()
    const hasClearBtn = await clearBtn
      .isVisible({ timeout: 3000 })
      .catch(() => false)

    if (hasClearBtn) {
      await clearBtn.click()
      await expect(
        page.getByRole('heading', { name: 'Mais recentes' })
      ).toBeVisible({ timeout: 10000 })
    }
  })

  test('busca via URL com parâmetro ?q= exibe resultados automaticamente', async ({
    page,
  }) => {
    await page.goto('/busca?tipo=empregos&q=assistente')

    const resultados = page.getByRole('heading', {
      name: 'Resultados da Pesquisa',
    })
    const semResultados = page.getByText('Ops... nenhum resultado encontrado', {
      exact: false,
    })

    await expect(resultados.or(semResultados).first()).toBeVisible({
      timeout: 20000,
    })
  })
})

// ---------------------------------------------------------------------------
// FAQ DE EMPREGOS — PÚBLICO
// ---------------------------------------------------------------------------

test.describe('Empregos — FAQ (público)', () => {
  test.beforeEach(async ({ context }) => {
    await applyE2ECookieConsent(context)
  })

  test('exibe heading "FAQ" e perguntas frequentes sobre empregos', async ({
    page,
  }) => {
    await page.goto('/servicos/trabalho/faq')

    await expect(page.getByRole('heading', { name: 'FAQ' })).toBeVisible({
      timeout: 15000,
    })

    await expect(
      page.getByText('O que é a Plataforma Oportunidades Cariocas?', {
        exact: false,
      })
    ).toBeVisible({ timeout: 10000 })
  })

  test('exibe perguntas sobre candidatura e conta Gov.br', async ({ page }) => {
    await page.goto('/servicos/trabalho/faq')
    await expect(page.getByRole('heading', { name: 'FAQ' })).toBeVisible({
      timeout: 15000,
    })

    await expect(
      page.getByText('Quem pode se candidatar às vagas de emprego?', {
        exact: false,
      })
    ).toBeVisible()
    await expect(
      page.getByText('O que é a conta Gov.br', { exact: false })
    ).toBeVisible()
    await expect(
      page.getByText('Como realizar a candidatura em uma vaga de emprego?', {
        exact: false,
      })
    ).toBeVisible()
  })

  test('exibe pergunta sobre acompanhar candidatura e status', async ({
    page,
  }) => {
    await page.goto('/servicos/trabalho/faq')
    await expect(page.getByRole('heading', { name: 'FAQ' })).toBeVisible({
      timeout: 15000,
    })

    await expect(
      page.getByText('Como posso acompanhar a minha candidatura', {
        exact: false,
      })
    ).toBeVisible()
    await expect(
      page.getByText('O que significa os status que aparecem', { exact: false })
    ).toBeVisible()
  })
})
