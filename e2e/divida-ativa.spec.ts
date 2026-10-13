import { expect, test } from '@playwright/test'
import { applyE2EAuthCookies, hasE2EAuth } from './fixtures/auth'

/**
 * O módulo inteiro exige login e está atrás de `NEXT_PUBLIC_FEATURE_DIVIDA_ATIVA`. Com a flag
 * desligada o middleware reescreve para `/not-found`, então estes testes só fazem sentido em
 * ambiente com a flag ligada (`.env` local e o quality gate).
 *
 * "Meus imóveis" busca a lista no servidor (DAL → `BASE_API_URL_DIVIDA_ATIVA`), então
 * `page.route()` não intercepta nada ali: o teste aceita os dois estados reais (lista ou
 * vazio) e só roda quando a API está configurada. Sem ela a página cai no error boundary,
 * que redireciona para /servicos. A URL de homolog ainda não está provisionada para o CI
 * (ver docs/divida-ativa.md, "Provisionamento pendente").
 */

test.describe('Dívida Ativa', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(
      !hasE2EAuth(),
      'Defina E2E_ACCESS_TOKEN para rodar testes autenticados'
    )
    await applyE2EAuthCookies(context)
  })

  test('landing anuncia o módulo, os serviços e o acesso a Meus imóveis', async ({
    page,
  }) => {
    await page.goto('/divida-ativa')

    await expect(
      page.getByRole('heading', { level: 1, name: 'Dívida ativa' })
    ).toBeVisible({ timeout: 20000 })

    await expect(page.getByRole('link', { name: /Meus imóveis/ })).toBeVisible()
    await expect(
      page.getByRole('heading', { level: 2, name: 'Serviços' })
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Parcelar débitos' })
    ).toBeVisible()
  })

  test('serviços ainda não construídos explicam a situação em vez de dar 404', async ({
    page,
  }) => {
    await page.goto('/divida-ativa/parcelamento')

    await expect(
      page.getByRole('heading', { level: 1, name: 'Parcelar débitos' })
    ).toBeVisible({ timeout: 20000 })
    await expect(
      page.getByRole('link', { name: 'Voltar a página de Dívida ativa' })
    ).toBeVisible()
  })

  test('cidadão chega à lista de imóveis a partir da landing', async ({
    page,
  }) => {
    test.skip(
      !process.env.BASE_API_URL_DIVIDA_ATIVA,
      'BASE_API_URL_DIVIDA_ATIVA ausente: a lista é buscada no servidor e a página cai no error boundary'
    )

    await page.goto('/divida-ativa')
    await page.getByRole('link', { name: /Meus imóveis/ }).click()
    await page.waitForURL('**/divida-ativa/imoveis', { timeout: 20000 })

    // Com imóveis o h1 é "Meus imóveis"; sem nenhum, a mensagem de vazio assume o h1.
    const comLista = page.getByRole('heading', {
      level: 1,
      name: 'Meus imóveis',
    })
    const vazio = page.getByRole('heading', {
      level: 1,
      name: 'Não encontramos nenhum imóvel cadastrado no seu CPF',
    })
    await expect(comLista.or(vazio)).toBeVisible({ timeout: 20000 })
    await expect(
      page.getByRole('link', { name: 'Adicionar imóvel' })
    ).toBeVisible()
  })

  test('formulário de inclusão mascara a inscrição enquanto o cidadão digita', async ({
    page,
  }) => {
    await page.goto('/divida-ativa/imoveis/novo')

    const campo = page.getByLabel('Inscrição imobiliária')
    await expect(campo).toBeVisible({ timeout: 20000 })

    await campo.fill('')
    await campo.pressSequentially('05217663')

    await expect(campo).toHaveValue('0.521.766-3')
  })
})
