import { expect, test } from '@playwright/test'
import { applyE2EAuthCookies, hasE2EAuth } from './fixtures/auth'

const apiUrl = '**/api/user/empregos/curriculo/habilidades-competencias'

const initialData = {
  areasAtuacao: [
    {
      nome: 'Área A',
      checked: true,
      vinculos: [
        {
          idTupla: 187,
          nome: 'Conhecimento A',
          checked: true,
        },
        {
          idTupla: 188,
          nome: 'Conhecimento B',
          checked: false,
        },
      ],
    },
    {
      nome: 'Área B',
      checked: false,
      vinculos: [
        {
          idTupla: 342,
          nome: 'Conhecimento A',
          checked: false,
        },
      ],
    },
  ],
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

test.describe('PREF-381 — Habilidades e Competências', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(
      !hasE2EAuth(),
      'Defina E2E_ACCESS_TOKEN para executar testes autenticados'
    )

    await applyE2EAuthCookies(context)
  })

  test('seleciona conhecimentos e comportamentos e salva os IDs corretos', async ({
    page,
  }) => {
    const payloads: unknown[] = []

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
            message: 'Currículo atualizado',
          }),
        })
        return
      }

      await route.continue()
    })

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

    // Seleciona um conhecimento da Área A.
    await page
      .getByRole('button', {
        name: 'Conhecimento B',
        exact: true,
      })
      .click()

    // Seleciona um comportamento.
    await page
      .getByRole('button', {
        name: 'Organização',
        exact: true,
      })
      .click()

    await expect(salvar).toBeEnabled()

    await salvar.click()

    await expect.poll(() => payloads.length).toBe(1)

    expect(payloads[0]).toEqual({
      area_atuacao_habilidade_ids: [187, 188],
      comportamento_atitudes_ids: [5, 6],
    })

    await expect(salvar).toBeDisabled()
  })
})
