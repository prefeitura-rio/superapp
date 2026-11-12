import { type APIRequestContext, expect, test } from '@playwright/test'
import { applyE2EAuthCookies, hasE2EAuth } from './fixtures/auth'

const AREA_SEM_DEFINICAO = 'Sem área definida'

/**
 * A conta E2E é compartilhada entre execuções e o teste salva habilidades
 * nela: o estado é zerado antes (para começar sem habilidades) e depois (para
 * não deixar resíduo para a próxima execução ou retry). Corpo sem área e com
 * listas vazias substitui tudo pelo vazio.
 */
async function limparHabilidades(request: APIRequestContext): Promise<void> {
  const base = process.env.COURSES_BASE_API_URL
  expect(
    base,
    'COURSES_BASE_API_URL deve estar definido para limpar as habilidades da conta E2E'
  ).toBeTruthy()

  const res = await request.put(
    `${(base as string).replace(/\/+$/, '')}/api/v1/empregabilidade/curriculo/habilidades-competencias`,
    {
      headers: { Authorization: `Bearer ${process.env.E2E_ACCESS_TOKEN}` },
      data: {
        id_area_atuacao: null,
        habilidade_ids: [],
        comportamento_atitudes_ids: [],
      },
      timeout: 15000,
    }
  )
  expect(
    res.ok(),
    `Limpar habilidades da conta E2E respondeu ${res.status()}`
  ).toBeTruthy()
}

test.describe('PREF-381 — Habilidades e Competências', () => {
  test.beforeEach(async ({ context, request }) => {
    test.skip(
      !hasE2EAuth(),
      'Defina E2E_ACCESS_TOKEN para executar testes autenticados'
    )

    await limparHabilidades(request)
    await applyE2EAuthCookies(context)
  })

  test.afterEach(async ({ request }) => {
    if (!hasE2EAuth()) return
    await limparHabilidades(request)
  })

  test('escolhe uma área, marca tags e salva', async ({ page }) => {
    await page.goto('/servicos/trabalho/curriculo')

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Meu Currículo',
      })
    ).toBeVisible({ timeout: 15000 })

    const secao = page.getByRole('button', {
      name: /Habilidades e Competências/,
    })
    await expect(secao.getByTestId('habilidades-check')).toHaveCount(0)

    await secao.click()

    const salvar = page.getByRole('button', {
      name: 'Salvar',
      exact: true,
    })
    await expect(salvar).toBeVisible()
    await expect(salvar).toBeDisabled()

    await page.getByTestId('field-area-atuacao').getByRole('button').click()
    await expect(page.getByTestId('area-atuacao-search-icon')).toBeVisible()

    // "Sem área definida" fica fixa no topo da lista e pode não ter
    // conhecimentos: escolhe a primeira área de atuação real.
    const sheet = page.getByRole('dialog')
    await sheet
      .getByRole('radio', { name: new RegExp(`^(?!${AREA_SEM_DEFINICAO})`) })
      .first()
      .click()
    await expect(secao.getByTestId('habilidades-check')).toBeVisible()

    await page
      .getByText('Selecione conhecimentos', { exact: true })
      .locator('..')
      .getByRole('button')
      .first()
      .click()
    await page
      .getByText('Selecione comportamentos e atitudes', { exact: true })
      .locator('..')
      .getByRole('button')
      .first()
      .click()

    await expect(salvar).toBeEnabled()
    await salvar.click()

    await expect(page.getByText('Habilidades salvas com sucesso')).toBeVisible()
    // Salvo, o acordeão fecha e a seção fica marcada como preenchida.
    await expect(salvar).toBeHidden()
    await expect(secao.getByTestId('habilidades-check')).toBeVisible()
  })
})
