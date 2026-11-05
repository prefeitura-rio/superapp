import { type Page, expect, test } from '@playwright/test'
import { applyE2EAuthCookies, hasE2EAuth } from './fixtures/auth'

const apiUrl = '**/api/user/empregos/curriculo/habilidades-competencias'
const areaUrl =
  /\/api\/user\/empregos\/curriculo\/habilidades-competencias\/areas\/(\d+)\/habilidades$/

const initialData = {
  areasAtuacao: [
    { id: 10, nome: 'Área A' },
    { id: 20, nome: 'Área B' },
  ],
  areaAtuacaoSelecionada: { id: 10, nome: 'Área A' },
  conhecimentosSelecionados: [{ id: 1, nome: 'Conhecimento A' }],
  comportamentoAtitudes: [
    {
      id: 5,
      nome: 'Colaboração',
      clicked: true,
    },
    {
      id: 6,
      nome: 'Organização',
      clicked: false,
    },
  ],
}

const conhecimentosPorArea: Record<string, { id: number; nome: string }[]> = {
  '10': [
    { id: 1, nome: 'Conhecimento A' },
    { id: 2, nome: 'Conhecimento B' },
  ],
  '20': [
    { id: 1, nome: 'Conhecimento A' },
    { id: 3, nome: 'Conhecimento C' },
  ],
}

/** Simula o BFF da tela e devolve os corpos enviados pelo Salvar. */
async function simularBff(page: Page): Promise<unknown[]> {
  const payloads: unknown[] = []

  await page.route(areaUrl, async route => {
    const idArea = areaUrl.exec(new URL(route.request().url()).pathname)?.[1]
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        conhecimentos: conhecimentosPorArea[idArea ?? ''] ?? [],
      }),
    })
  })

  await page.route(apiUrl, async route => {
    const request = route.request()

    if (request.method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(initialData),
      })
      return
    }

    if (request.method() === 'PUT') {
      payloads.push(request.postDataJSON())

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          area_atuacao: null,
          conhecimentos: [],
          comportamentos_atitudes: [],
        }),
      })
      return
    }

    await route.continue()
  })

  return payloads
}

async function abrirHabilidadesCompetencias(page: Page) {
  await page.goto('/servicos/trabalho/curriculo')

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Meu Currículo',
    })
  ).toBeVisible({ timeout: 15000 })

  await page
    .getByRole('button', {
      name: /Habilidades e Competências/,
    })
    .click()

  const salvar = page.getByRole('button', {
    name: 'Salvar',
    exact: true,
  })

  await expect(salvar).toBeVisible()
  await expect(salvar).toBeDisabled()

  return salvar
}

test.describe('PREF-381 — Habilidades e Competências', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(
      !hasE2EAuth(),
      'Defina E2E_ACCESS_TOKEN para executar testes autenticados'
    )

    await applyE2EAuthCookies(context)
  })

  test('seleciona conhecimentos e comportamentos da área salva e envia área e IDs', async ({
    page,
  }) => {
    const payloads = await simularBff(page)
    const salvar = await abrirHabilidadesCompetencias(page)

    await expect(
      page.getByRole('textbox', { name: 'Área de atuação' })
    ).toHaveValue('Área A')

    // Conhecimento já salvo vem marcado.
    await expect(
      page.getByRole('button', { name: 'Conhecimento A', exact: true })
    ).toHaveAttribute('aria-pressed', 'true')

    // Marca outro conhecimento da Área A e um comportamento.
    await page
      .getByRole('button', { name: 'Conhecimento B', exact: true })
      .click()
    await page.getByRole('button', { name: 'Organização', exact: true }).click()

    await expect(salvar).toBeEnabled()

    await salvar.click()

    await expect.poll(() => payloads.length).toBe(1)

    expect(payloads[0]).toEqual({
      id_area_atuacao: 10,
      habilidade_ids: [1, 2],
      comportamento_atitudes_ids: [5, 6],
    })

    await expect(salvar).toBeDisabled()
  })

  test('troca de área, limpa os conhecimentos e envia só os da área nova', async ({
    page,
  }) => {
    const payloads = await simularBff(page)
    const salvar = await abrirHabilidadesCompetencias(page)

    const area = page.getByRole('textbox', { name: 'Área de atuação' })
    await area.clear()
    await area.click()
    await page.getByRole('button', { name: 'Área B', exact: true }).click()

    const conhecimentoC = page.getByRole('button', {
      name: 'Conhecimento C',
      exact: true,
    })
    await expect(conhecimentoC).toHaveAttribute('aria-pressed', 'false')
    await expect(
      page.getByRole('button', { name: 'Conhecimento A', exact: true })
    ).toHaveAttribute('aria-pressed', 'false')

    await conhecimentoC.click()
    await expect(salvar).toBeEnabled()

    await salvar.click()

    await expect.poll(() => payloads.length).toBe(1)

    expect(payloads[0]).toEqual({
      id_area_atuacao: 20,
      habilidade_ids: [3],
      comportamento_atitudes_ids: [5],
    })
  })
})
