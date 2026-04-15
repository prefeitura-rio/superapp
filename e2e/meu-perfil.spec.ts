import { type Page, expect, test } from '@playwright/test'
import { applyE2EAuthCookies, hasE2EAuth } from './fixtures/auth'

/**
 * Clica no campo de um ActionDiv que abre um bottom sheet.
 *
 * Estrutura do ActionDiv no DOM:
 *   div.space-y-2                          ← wrapper
 *     div.flex.items-center.gap-2          ← label row
 *       div.text-sm.font-normal.text-primary  ← texto do label  ← ponto de partida
 *     div.[cursor-pointer]                 ← área clicável (sobe 2 níveis e desce)
 */
async function clickActionDrawer(page: Page, labelText: string) {
  const labelEl = page.getByText(labelText, { exact: true }).first()
  await labelEl
    .locator('xpath=../..')
    .locator('[class*="cursor-pointer"]')
    .click()
}

// ---------------------------------------------------------------------------
// HUB — /meu-perfil
// ---------------------------------------------------------------------------

test.describe('Meu Perfil — hub (autenticado)', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(
      !hasE2EAuth(),
      'Defina E2E_ACCESS_TOKEN para rodar testes autenticados'
    )
    await applyE2EAuthCookies(context)
  })

  test('exibe SecondaryHeader "Perfil", nome do usuário e CPF', async ({
    page,
  }) => {
    await page.goto('/meu-perfil')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Perfil' })
    ).toBeVisible({ timeout: 15000 })

    // h2 com nome de exibição do usuário
    await expect(page.locator('h2').first()).toBeVisible()

    // CPF no formato XXX.XXX.XXX-XX
    await expect(page.getByText(/\d{3}\.\d{3}\.\d{3}-\d{2}/)).toBeVisible()
  })

  test('menu exibe todos os itens com links corretos', async ({ page }) => {
    await page.goto('/meu-perfil')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Perfil' })
    ).toBeVisible({ timeout: 15000 })

    await expect(
      page.getByRole('link', { name: 'Meus dados' })
    ).toHaveAttribute('href', '/meu-perfil/informacoes-pessoais')
    await expect(page.getByRole('link', { name: 'Endereço' })).toHaveAttribute(
      'href',
      '/meu-perfil/endereco'
    )
    await expect(
      page.getByRole('link', { name: 'Autorizações' })
    ).toHaveAttribute('href', '/meu-perfil/autorizacoes')
    await expect(
      page.getByRole('link', { name: 'Configurações' })
    ).toHaveAttribute('href', '/meu-perfil/configuracoes')
    await expect(page.getByRole('link', { name: 'FAQ' })).toHaveAttribute(
      'href',
      '/faq'
    )
  })

  test('botão Sair inicia processo de logout', async ({ page }) => {
    await page.goto('/meu-perfil')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Perfil' })
    ).toBeVisible({ timeout: 15000 })

    // Intercepta o endpoint de logout para evitar redirecionamento externo
    await page.route('/api/auth/logout', route =>
      route.fulfill({ status: 200 })
    )

    const sairBtn = page.getByRole('button', { name: 'Sair' })
    await expect(sairBtn).toBeVisible()
    await sairBtn.click()

    // setIsLoading(true) roda de forma síncrona: label muda para "Saindo..."
    await expect(page.getByText('Saindo...')).toBeVisible({ timeout: 5000 })
  })
})

// ---------------------------------------------------------------------------
// INFORMAÇÕES PESSOAIS — /meu-perfil/informacoes-pessoais
// ---------------------------------------------------------------------------

test.describe('Meu Perfil — informações pessoais (autenticado)', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(
      !hasE2EAuth(),
      'Defina E2E_ACCESS_TOKEN para rodar testes autenticados'
    )
    await applyE2EAuthCookies(context)
  })

  test('exibe SecondaryHeader e todos os campos esperados', async ({
    page,
  }) => {
    await page.goto('/meu-perfil/informacoes-pessoais')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Informações pessoais' })
    ).toBeVisible({ timeout: 15000 })

    const campos = [
      'CPF',
      'Nome completo',
      'Nome de exibição',
      'Celular',
      'E-mail',
      'Cor / Raça',
      'Gênero',
      'Renda familiar',
      'Escolaridade',
      'Você tem alguma deficiência?',
      'Data de nascimento',
      'Nacionalidade',
    ]
    for (const campo of campos) {
      await expect(page.getByText(campo, { exact: true })).toBeVisible()
    }
  })

  test('Nome de exibição navega para /atualizar-nome-exibicao', async ({
    page,
  }) => {
    await page.goto('/meu-perfil/informacoes-pessoais')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Informações pessoais' })
    ).toBeVisible({ timeout: 15000 })

    await page
      .locator(
        'a[href="/meu-perfil/informacoes-pessoais/atualizar-nome-exibicao"]'
      )
      .first()
      .click()

    await expect(page).toHaveURL(
      '/meu-perfil/informacoes-pessoais/atualizar-nome-exibicao'
    )
    await expect(page.getByText('Como prefere ser')).toBeVisible({
      timeout: 10000,
    })
    await expect(page.getByText('chamado(a)?')).toBeVisible()
  })

  test('Celular navega para /atualizar-telefone', async ({ page }) => {
    await page.goto('/meu-perfil/informacoes-pessoais')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Informações pessoais' })
    ).toBeVisible({ timeout: 15000 })

    await page
      .locator('a[href="/meu-perfil/informacoes-pessoais/atualizar-telefone"]')
      .first()
      .click()

    await expect(page).toHaveURL(
      '/meu-perfil/informacoes-pessoais/atualizar-telefone'
    )
    await expect(page.getByText('Escreva seu')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('celular')).toBeVisible()
    await expect(
      page.getByText('Você irá receber um código via Whatsapp')
    ).toBeVisible()
  })

  test('E-mail navega para /atualizar-email', async ({ page }) => {
    await page.goto('/meu-perfil/informacoes-pessoais')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Informações pessoais' })
    ).toBeVisible({ timeout: 15000 })

    await page
      .locator('a[href="/meu-perfil/informacoes-pessoais/atualizar-email"]')
      .first()
      .click()

    await expect(page).toHaveURL(
      '/meu-perfil/informacoes-pessoais/atualizar-email'
    )
    await expect(page.getByText('Escreva seu')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('email')).toBeVisible()
  })

  test('bottom sheet Cor / Raça exibe todas as opções', async ({ page }) => {
    await page.goto('/meu-perfil/informacoes-pessoais')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Informações pessoais' })
    ).toBeVisible({ timeout: 15000 })

    await clickActionDrawer(page, 'Cor / Raça')

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 10000 })

    for (const opcao of [
      'Branca',
      'Preta',
      'Parda',
      'Amarela',
      'Indígena',
      'Outra',
    ]) {
      await expect(dialog.getByText(opcao)).toBeVisible()
    }
  })

  test('bottom sheet Gênero exibe todas as opções', async ({ page }) => {
    await page.goto('/meu-perfil/informacoes-pessoais')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Informações pessoais' })
    ).toBeVisible({ timeout: 15000 })

    await clickActionDrawer(page, 'Gênero')

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 10000 })

    for (const opcao of [
      'Homem cisgênero',
      'Homem transgênero',
      'Mulher cisgênero',
      'Mulher transgênero',
      'Não binário',
      'Prefiro não informar',
      'Outro',
    ]) {
      await expect(dialog.getByText(opcao)).toBeVisible()
    }
  })

  test('bottom sheet Renda familiar exibe todas as opções', async ({
    page,
  }) => {
    await page.goto('/meu-perfil/informacoes-pessoais')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Informações pessoais' })
    ).toBeVisible({ timeout: 15000 })

    await clickActionDrawer(page, 'Renda familiar')

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 10000 })

    for (const opcao of [
      'Menos de 1 salário mínimo',
      '1 a 2 salários mínimos',
      '2 a 3 salários mínimos',
      '3 a 5 salários mínimos',
      'Mais de 5 salários mínimos',
    ]) {
      await expect(dialog.getByText(opcao)).toBeVisible()
    }
  })

  test('bottom sheet Escolaridade exibe todas as opções', async ({ page }) => {
    await page.goto('/meu-perfil/informacoes-pessoais')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Informações pessoais' })
    ).toBeVisible({ timeout: 15000 })

    await clickActionDrawer(page, 'Escolaridade')

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
      await expect(dialog.getByText(opcao)).toBeVisible()
    }
  })

  test('bottom sheet Deficiência exibe todas as opções', async ({ page }) => {
    await page.goto('/meu-perfil/informacoes-pessoais')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Informações pessoais' })
    ).toBeVisible({ timeout: 15000 })

    await clickActionDrawer(page, 'Você tem alguma deficiência?')

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 10000 })

    for (const opcao of [
      'Não sou pessoa com deficiência',
      'Física',
      'Auditiva',
      'Visual',
      'Transtorno do Espectro Autista',
      'Intelectual',
      'Mental (psicossocial)',
      'Reabilitado do INSS',
    ]) {
      await expect(dialog.getByText(opcao)).toBeVisible()
    }
  })
})

// ---------------------------------------------------------------------------
// ENDEREÇO — /meu-perfil/endereco
// ---------------------------------------------------------------------------

test.describe('Meu Perfil — endereço (autenticado)', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(
      !hasE2EAuth(),
      'Defina E2E_ACCESS_TOKEN para rodar testes autenticados'
    )
    await applyE2EAuthCookies(context)
  })

  test('exibe SecondaryHeader "Endereço"', async ({ page }) => {
    await page.goto('/meu-perfil/endereco')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Endereço' })
    ).toBeVisible({ timeout: 15000 })
  })
})

// ---------------------------------------------------------------------------
// AUTORIZAÇÕES — /meu-perfil/autorizacoes
// ---------------------------------------------------------------------------

test.describe('Meu Perfil — autorizações (autenticado)', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(
      !hasE2EAuth(),
      'Defina E2E_ACCESS_TOKEN para rodar testes autenticados'
    )
    await applyE2EAuthCookies(context)
  })

  test('exibe SecondaryHeader "Autorizações", texto explicativo e switch', async ({
    page,
  }) => {
    await page.goto('/meu-perfil/autorizacoes')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Autorizações' })
    ).toBeVisible({ timeout: 15000 })

    await expect(
      page.getByText('Você autoriza receber comunicações', { exact: false })
    ).toBeVisible()

    const switchEl = page.getByRole('switch')
    await expect(switchEl).toBeVisible()

    // Label reflete o estado atual: "Autorizo" ou "Não autorizo"
    await expect(page.getByText(/^Autorizo$|^Não autorizo$/)).toBeVisible()
  })

  test('toggle do switch de autorização', async ({ page }) => {
    await page.goto('/meu-perfil/autorizacoes')
    await expect(page.getByRole('switch')).toBeVisible({ timeout: 15000 })

    const switchEl = page.getByRole('switch')
    const initialChecked = await switchEl.isChecked()

    if (!initialChecked) {
      // Autoriza: toggle liga sem confirmação
      await switchEl.click()
      await expect(page.getByText('Autorizo')).toBeVisible({ timeout: 10000 })
    } else {
      // Desautoriza: abre drawer de confirmação
      await switchEl.click()
      const dialog = page.getByRole('dialog')
      if (await dialog.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Cancela para não alterar o estado real do usuário
        const cancelBtn = dialog.getByRole('button', { name: /Cancelar/i })
        if (await cancelBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await cancelBtn.click()
        }
      }
    }
  })
})

// ---------------------------------------------------------------------------
// CONFIGURAÇÕES — /meu-perfil/configuracoes
// ---------------------------------------------------------------------------

test.describe('Meu Perfil — configurações (autenticado)', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(
      !hasE2EAuth(),
      'Defina E2E_ACCESS_TOKEN para rodar testes autenticados'
    )
    await applyE2EAuthCookies(context)
  })

  test('exibe SecondaryHeader "Configurações" e opções de tema', async ({
    page,
  }) => {
    await page.goto('/meu-perfil/configuracoes')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Configurações' })
    ).toBeVisible({ timeout: 15000 })

    await expect(page.getByText('Modo Claro')).toBeVisible()
    await expect(page.getByText('Modo Escuro')).toBeVisible()
    await expect(page.getByRole('radio', { name: 'Modo Claro' })).toBeVisible()
    await expect(page.getByRole('radio', { name: 'Modo Escuro' })).toBeVisible()
  })

  test('selecionar Modo Escuro e restaurar Modo Claro', async ({ page }) => {
    await page.goto('/meu-perfil/configuracoes')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Configurações' })
    ).toBeVisible({ timeout: 15000 })

    // Aguarda next-themes inicializar o estado React antes de interagir
    await expect(page.getByRole('radio', { name: 'Modo Claro' })).toBeChecked({
      timeout: 10000,
    })

    await page.getByRole('radio', { name: 'Modo Escuro' }).click()
    await expect(page.getByRole('radio', { name: 'Modo Escuro' })).toBeChecked({
      timeout: 10000,
    })

    // Restaura modo claro para não afetar outros testes
    await page.getByRole('radio', { name: 'Modo Claro' }).click()
    await expect(page.getByRole('radio', { name: 'Modo Claro' })).toBeChecked({
      timeout: 10000,
    })
  })
})

// ---------------------------------------------------------------------------
// FAQ — /faq
// ---------------------------------------------------------------------------

test.describe('FAQ (autenticado)', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(
      !hasE2EAuth(),
      'Defina E2E_ACCESS_TOKEN para rodar testes autenticados'
    )
    await applyE2EAuthCookies(context)
  })

  test('exibe SecondaryHeader "FAQ" e texto "O que é a Plataforma PrefRio?"', async ({
    page,
  }) => {
    await page.goto('/faq')
    await expect(
      page.getByRole('heading', { level: 1, name: 'FAQ' })
    ).toBeVisible({ timeout: 15000 })

    await expect(page.getByText('O que é a Plataforma PrefRio?')).toBeVisible({
      timeout: 10000,
    })
  })
})
