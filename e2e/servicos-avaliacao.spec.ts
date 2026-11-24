import { type Page, type Request, expect, test } from '@playwright/test'
import { applyE2ECookieConsent } from './fixtures/auth'

/**
 * Página de serviço atualizada: título de 24px com "Última atualização" logo
 * abaixo, em primary, e "Este conteúdo foi útil?" no fim.
 *
 * O voto do navegador é interceptado (`page.route`): a CI não tem as credenciais
 * do Salesforce e não pode gravar votos de verdade. A rota do portal é chamada
 * direto só em casos que ela recusa antes de falar com o Salesforce.
 *
 * Lido em runtime pelo servidor; com qualquer flag desligada o spec é pulado.
 */
const ratingEnabled =
  process.env.FEATURE_SALESFORCE === 'true' &&
  process.env.FEATURE_AVALIACAO_SERVICO === 'true'

/** Categoria da Carta de Serviços em staging; o serviço é o primeiro da lista. */
const CATEGORY_PATH = '/servicos/categoria/animais'
const VOTE_ROUTE = '**/api/servicos/*/avaliacao'
const ARTICLE_ID = /^[a-zA-Z0-9]{15,18}$/
// --primary (#13335a) no tema claro.
const PRIMARY = 'rgb(19, 51, 90)'
const THANKS = 'Obrigado pela avaliação!'
const ERROR =
  'Não foi possível registrar sua avaliação agora. Tente mais tarde.'

async function openFirstService(page: Page) {
  await page.goto(CATEGORY_PATH)
  const firstService = page
    .getByRole('main')
    .locator('a')
    .filter({ has: page.locator('h3') })
    .first()
  await expect(firstService).toBeVisible({ timeout: 20_000 })
  await firstService.click()
  await page.waitForURL(/\/servicos\/categoria\/animais\/[^/]+$/, {
    timeout: 20_000,
  })
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible({
    timeout: 20_000,
  })
}

/** Intercepta o voto e devolve os corpos enviados pelo navegador. */
async function mockVote(page: Page, status = 200) {
  const bodies: Record<string, unknown>[] = []
  await page.route(VOTE_ROUTE, async route => {
    bodies.push(route.request().postDataJSON())
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(
        status === 200 ? { ok: true } : { code: 'unavailable' }
      ),
    })
  })
  return bodies
}

function ratingCard(page: Page) {
  return page.getByRole('region', { name: 'Este conteúdo foi útil?' })
}

test.describe('Página de serviço — cabeçalho', () => {
  test.skip(
    process.env.FEATURE_SALESFORCE !== 'true',
    'FEATURE_SALESFORCE desligada'
  )

  test.beforeEach(async ({ context }) => {
    await applyE2ECookieConsent(context)
  })

  test('título de 24px e data de atualização logo abaixo, em primary', async ({
    page,
  }) => {
    await openFirstService(page)

    const title = page.getByRole('heading', { level: 1 })
    await expect(title).toHaveCSS('font-size', '24px')
    await expect(title).toHaveCSS('line-height', '32px')

    const updated = page.getByText(/^Última atualização: \d{2}\/\d{2}\/\d{4}$/)
    // A data vem do lastModifiedDate da Carta, que é opcional no contrato.
    if ((await updated.count()) === 0) return

    await expect(updated).toHaveCount(1)
    await expect(updated).toHaveCSS('color', PRIMARY)
    await expect(updated).toHaveCSS('font-size', '14px')
    const followsTitle = await title.evaluate(
      element =>
        element.nextElementSibling?.textContent?.startsWith(
          'Última atualização:'
        ) ?? false
    )
    expect(followsTitle).toBe(true)
  })
})

test.describe('Página de serviço — "Este conteúdo foi útil?"', () => {
  test.skip(
    !ratingEnabled,
    'FEATURE_SALESFORCE e FEATURE_AVALIACAO_SERVICO precisam estar ligadas'
  )

  test.beforeEach(async ({ context }) => {
    await applyE2ECookieConsent(context)
  })

  test('like envia na hora, agradece por 3s e não reenvia o mesmo voto', async ({
    page,
  }) => {
    const bodies = await mockVote(page)
    await openFirstService(page)

    const card = ratingCard(page)
    await card.scrollIntoViewIfNeeded()
    const like = card.getByRole('button', { name: 'Sim, foi útil' })
    await like.click()

    await expect(like).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByText(THANKS)).toBeVisible()
    expect(bodies).toHaveLength(1)
    expect(bodies[0]).toEqual({ vote: 'up', articleId: expect.any(String) })
    expect(bodies[0].articleId).toMatch(ARTICLE_ID)

    await expect(page.getByText(THANKS)).toHaveCount(0, { timeout: 6_000 })

    await like.click()
    await expect(page.getByText(THANKS)).toBeVisible()
    expect(bodies).toHaveLength(1)
  })

  test('dislike abre os motivos e envia motivos e comentário em "Enviar avaliação"', async ({
    page,
  }) => {
    const bodies = await mockVote(page)
    await openFirstService(page)

    const card = ratingCard(page)
    await card.scrollIntoViewIfNeeded()
    const dislike = card.getByRole('button', { name: 'Não foi útil' })
    await dislike.click()

    await expect(dislike).toHaveAttribute('aria-pressed', 'true')
    await expect(card.getByText('O que podemos melhorar?')).toBeVisible()
    expect(bodies).toHaveLength(0)

    const submit = card.getByRole('button', { name: 'Enviar avaliação' })
    await expect(submit).toBeDisabled()

    const incorrect = card.getByRole('button', { name: 'Informação incorreta' })
    await incorrect.click()
    await expect(incorrect).toHaveAttribute('aria-pressed', 'true')
    await expect(submit).toBeEnabled()

    const comment = card.getByRole('textbox', { name: 'Quer explicar melhor?' })
    await expect(comment).toHaveCount(0)
    await card.getByRole('button', { name: 'Outro motivo' }).click()
    await expect(comment).toBeVisible()
    await expect(comment).toHaveAttribute('maxlength', '500')
    await comment.fill('O endereço do atendimento mudou.')

    await submit.click()

    await expect(page.getByText(THANKS)).toBeVisible()
    await expect(card.getByText('O que podemos melhorar?')).toHaveCount(0)
    expect(bodies).toEqual([
      {
        vote: 'down',
        articleId: expect.stringMatching(ARTICLE_ID),
        rejectionReasons: ['Informacao_incorreta', 'Outro_motivo'],
        rejectionDescription: 'O endereço do atendimento mudou.',
      },
    ])
  })

  test('falha no envio mostra a mensagem de erro e desfaz a seleção', async ({
    page,
  }) => {
    const bodies = await mockVote(page, 503)
    await openFirstService(page)

    const card = ratingCard(page)
    await card.scrollIntoViewIfNeeded()
    const like = card.getByRole('button', { name: 'Sim, foi útil' })
    await like.click()

    await expect(page.getByText(ERROR)).toBeVisible()
    await expect(page.getByText(THANKS)).toHaveCount(0)
    await expect(like).toHaveAttribute('aria-pressed', 'false')
    expect(bodies).toHaveLength(1)
  })

  test('cabe em 360px sem rolagem horizontal', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    await mockVote(page)
    await openFirstService(page)

    const card = ratingCard(page)
    await card.scrollIntoViewIfNeeded()
    await card.getByRole('button', { name: 'Não foi útil' }).click()
    await card.getByRole('button', { name: 'Outro motivo' }).click()

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    )
    expect(overflow).toBeLessThanOrEqual(0)
    const box = await card.boundingBox()
    expect(box?.width).toBeLessThanOrEqual(360 - 32)
  })

  test('a rota do portal recusa voto inválido sem falar com o Salesforce', async ({
    page,
  }) => {
    let browserCalls = 0
    page.on('request', (request: Request) => {
      if (request.url().includes('/avaliacao')) browserCalls++
    })
    await openFirstService(page)
    const slug = new URL(page.url()).pathname.split('/').pop() ?? ''

    const invalidBody = await page.request.post(
      `/api/servicos/${slug}/avaliacao`,
      { data: { vote: 'down', articleId: 'ka089000000BUO5AAO' } }
    )
    expect(invalidBody.status()).toBe(400)
    expect(await invalidBody.json()).toEqual({ code: 'invalid_payload' })
    expect(invalidBody.headers()['cache-control']).toBe('no-store')

    const invalidSlug = await page.request.post(
      '/api/servicos/Slug_Invalido/avaliacao',
      { data: { vote: 'up', articleId: 'ka089000000BUO5AAO' } }
    )
    expect(invalidSlug.status()).toBe(404)
    expect(await invalidSlug.json()).toEqual({ code: 'not_found' })

    // Abrir a página não envia voto nenhum.
    expect(browserCalls).toBe(0)
  })
})
