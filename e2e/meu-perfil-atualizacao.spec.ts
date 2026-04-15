import { expect, test } from '@playwright/test'
import { applyE2EAuthCookies, hasE2EAuth } from './fixtures/auth'

// ---------------------------------------------------------------------------
// ATUALIZAR NOME DE EXIBIÇÃO
// ---------------------------------------------------------------------------

test.describe('Meu Perfil — atualizar nome de exibição (autenticado)', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(
      !hasE2EAuth(),
      'Defina E2E_ACCESS_TOKEN para rodar testes autenticados'
    )
    await applyE2EAuthCookies(context)
  })

  test('página contém "Como prefere ser chamado(a)?", input e botão Salvar', async ({
    page,
  }) => {
    await page.goto('/meu-perfil/informacoes-pessoais/atualizar-nome-exibicao')
    await expect(page.getByText('Como prefere ser')).toBeVisible({
      timeout: 15000,
    })
    await expect(page.getByText('chamado(a)?')).toBeVisible()
    await expect(
      page.getByPlaceholder('Digite como quer ser chamado')
    ).toBeVisible()
    await expect(page.getByRole('button', { name: 'Salvar' })).toBeVisible()
  })

  test('fluxo feliz: input → "Nome de exibição atualizado!" → Finalizar → /informacoes-pessoais', async ({
    page,
  }) => {
    // Navega via clique para construir o histórico correto (router.back() no Finalizar)
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

    const input = page.getByPlaceholder('Digite como quer ser chamado')
    await expect(input).toBeVisible({ timeout: 10000 })
    await input.fill('Teste end to end')

    const salvarBtn = page.getByRole('button', { name: 'Salvar' })
    await expect(salvarBtn).toBeEnabled({ timeout: 10000 })
    await salvarBtn.click()

    // Drawer de sucesso
    const drawerTitle = page.locator('[data-slot="drawer-title"]')
    await expect(drawerTitle).toContainText('Nome de exibição', {
      timeout: 20000,
    })
    await expect(drawerTitle).toContainText('atualizado!')

    // Finalizar usa router.back() → volta para informacoes-pessoais
    await page.getByRole('button', { name: 'Finalizar' }).click()
    await expect(page).toHaveURL('/meu-perfil/informacoes-pessoais', {
      timeout: 10000,
    })
  })
})

// ---------------------------------------------------------------------------
// ATUALIZAR CELULAR
// ---------------------------------------------------------------------------

test.describe('Meu Perfil — atualizar celular (autenticado)', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(
      !hasE2EAuth(),
      'Defina E2E_ACCESS_TOKEN para rodar testes autenticados'
    )
    await applyE2EAuthCookies(context)
  })

  test('página contém "Escreva seu celular" e aviso de WhatsApp', async ({
    page,
  }) => {
    await page.goto('/meu-perfil/informacoes-pessoais/atualizar-telefone')
    await expect(page.getByText('Escreva seu')).toBeVisible({ timeout: 15000 })
    await expect(page.getByText('celular')).toBeVisible()
    await expect(
      page.getByText('Você irá receber um código via Whatsapp')
    ).toBeVisible()
    await expect(page.getByRole('button', { name: 'Enviar' })).toBeVisible()
  })

  test('input de número válido envia token e redireciona para token-input', async ({
    page,
  }) => {
    await page.goto('/meu-perfil/informacoes-pessoais/atualizar-telefone')
    await expect(
      page.getByText('Você irá receber um código via Whatsapp')
    ).toBeVisible({ timeout: 15000 })

    // Preenche campo de celular brasileiro
    const phoneInput = page.locator('input[type="tel"]')
    await phoneInput.fill('(21) 99999-9999')

    const enviarBtn = page.getByRole('button', { name: 'Enviar' })
    await expect(enviarBtn).toBeEnabled({ timeout: 5000 })
    await enviarBtn.click()

    // Toast de confirmação e redirect para token-input
    await expect(page.getByText('Token enviado')).toBeVisible({
      timeout: 15000,
    })
    await expect(page).toHaveURL(
      /\/meu-perfil\/informacoes-pessoais\/atualizar-telefone\/token-input/,
      { timeout: 15000 }
    )

    // Verifica parâmetros na URL: DDD 21, DDI 55
    const url = page.url()
    expect(url).toContain('ddd=21')
    expect(url).toContain('ddi=55')
  })
})

// ---------------------------------------------------------------------------
// ATUALIZAR E-MAIL
// ---------------------------------------------------------------------------

test.describe('Meu Perfil — atualizar e-mail (autenticado)', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(
      !hasE2EAuth(),
      'Defina E2E_ACCESS_TOKEN para rodar testes autenticados'
    )
    await applyE2EAuthCookies(context)
  })

  test('página contém "Escreva seu email", input e botão Salvar', async ({
    page,
  }) => {
    await page.goto('/meu-perfil/informacoes-pessoais/atualizar-email')
    await expect(page.getByText('Escreva seu')).toBeVisible({ timeout: 15000 })
    await expect(page.getByText('email')).toBeVisible()
    await expect(page.getByPlaceholder('Digite seu email')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Salvar' })).toBeVisible()
  })

  test('fluxo completo: atualiza e-mail → sucesso → Finalizar → /informacoes-pessoais; mesma tentativa exibe "Email já cadastrado"', async ({
    page,
  }) => {
    // Navega via clique para construir histórico (router.back() no Finalizar)
    await page.goto('/meu-perfil/informacoes-pessoais')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Informações pessoais' })
    ).toBeVisible({ timeout: 15000 })

    await page
      .locator('a[href="/meu-perfil/informacoes-pessoais/atualizar-email"]')
      .first()
      .click()

    const emailInput = page.getByPlaceholder('Digite seu email')
    await expect(emailInput).toBeVisible({ timeout: 10000 })
    await emailInput.fill('lucas.teste.e2e@gmail.com')

    const salvarBtn = page.getByRole('button', { name: 'Salvar' })
    await expect(salvarBtn).toBeEnabled({ timeout: 5000 })
    await salvarBtn.click()

    // A primeira chamada pode retornar sucesso ou 409 (já cadastrado)
    const drawerTitle = page.locator('[data-slot="drawer-title"]')
    const duplicateToast = page.getByText('Email já cadastrado')

    const firstOutcome = await Promise.race([
      drawerTitle
        .waitFor({ state: 'visible', timeout: 20000 })
        .then(() => 'success'),
      duplicateToast
        .waitFor({ state: 'visible', timeout: 20000 })
        .then(() => 'duplicate'),
    ])

    if (firstOutcome === 'success') {
      // Sucesso: verifica drawer e navega de volta
      await expect(drawerTitle).toContainText('Email')
      await expect(drawerTitle).toContainText('atualizado!')

      await page.getByRole('button', { name: 'Finalizar' }).click()
      await expect(page).toHaveURL('/meu-perfil/informacoes-pessoais', {
        timeout: 10000,
      })

      // Segunda tentativa com o mesmo e-mail deve retornar o erro de duplicata
      await page
        .locator('a[href="/meu-perfil/informacoes-pessoais/atualizar-email"]')
        .first()
        .click()
      await expect(emailInput).toBeVisible({ timeout: 10000 })
      await emailInput.fill('lucas.teste.e2e@gmail.com')
      await expect(salvarBtn).toBeEnabled({ timeout: 5000 })
      await salvarBtn.click()
      await expect(page.getByText('Email já cadastrado')).toBeVisible({
        timeout: 15000,
      })
    } else {
      // Já estava cadastrado — o toast de duplicata já foi verificado acima
      await expect(page.getByText('Email já cadastrado')).toBeVisible()
    }
  })
})

// ---------------------------------------------------------------------------
// ENDEREÇO — fluxo completo: excluir → estado vazio → adicionar
// ---------------------------------------------------------------------------

test.describe('Meu Perfil — endereço: fluxo completo (autenticado)', () => {
  test.beforeEach(async ({ context }) => {
    test.skip(
      !hasE2EAuth(),
      'Defina E2E_ACCESS_TOKEN para rodar testes autenticados'
    )
    await applyE2EAuthCookies(context)
  })

  test('exclui endereço existente, verifica estado vazio e adiciona novo endereço', async ({
    page,
  }) => {
    await page.goto('/meu-perfil/endereco')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Endereço' })
    ).toBeVisible({ timeout: 15000 })

    // --- Passo 1: exclusão (se houver endereço cadastrado) ---
    const addressCard = page
      .locator('[class*="rounded-2xl"][class*="cursor-pointer"]')
      .first()
    const hasAddress = await addressCard
      .isVisible({ timeout: 5000 })
      .catch(() => false)

    if (hasAddress) {
      await addressCard.click()

      const deleteDialog = page.getByRole('dialog')
      await expect(deleteDialog).toBeVisible({ timeout: 10000 })
      await deleteDialog.getByRole('button', { name: 'Excluir' }).click()

      // Aguarda o estado vazio aparecer após revalidação do servidor
      await expect(
        page.getByText('Não há nenhum endereço cadastrado')
      ).toBeVisible({ timeout: 15000 })
    } else {
      // Já está no estado vazio
      await expect(
        page.getByText('Não há nenhum endereço cadastrado')
      ).toBeVisible({ timeout: 10000 })
    }

    // --- Passo 2: estado vazio e botão Adicionar ---
    const addLink = page.getByRole('link', { name: 'Adicionar' })
    await expect(addLink).toBeVisible()
    await addLink.click()
    await expect(page).toHaveURL('/meu-perfil/endereco/atualizar-endereco')

    // --- Passo 3: busca e seleção do endereço ---
    const searchInput = page.getByPlaceholder('Digite o seu endereço')
    await searchInput.click() // aciona handleFocusInput (hasInteracted = true)
    await searchInput.fill('rua mora campo grande 303')

    // Aguarda debounce (400 ms) + resposta da API de autocomplete
    await page.waitForTimeout(600)
    const firstSuggestion = page
      .locator('.flex.px-2.items-center.gap-3.py-5.cursor-pointer')
      .first()
    await expect(firstSuggestion).toBeVisible({ timeout: 15000 })
    await firstSuggestion.click()

    // --- Passo 4: bottom sheet de detalhes do endereço ---
    const detailsDialog = page.getByRole('dialog')
    await expect(detailsDialog).toBeVisible({ timeout: 10000 })

    // Garante que o número está preenchido — a sugestão do Google pode não
    // incluir o número no main_text, então extractNumberFromAddress retorna "".
    const numberInput = detailsDialog.getByPlaceholder('Escreva o número')
    await expect(numberInput).toBeVisible()
    const numberValue = await numberInput.inputValue()
    if (!numberValue) {
      await numberInput.fill('303')
    }

    // Preenche o complemento obrigatório
    await detailsDialog
      .getByPlaceholder('Escreva o complemento')
      .fill('Teste end to end')

    // Garante que o CEP é válido — ativa "Sem CEP" se o lookup ViaCEP não
    // retornou um CEP no formato XXXXX-XXX (pode falhar por indisponibilidade
    // ou porque o endereço não consta na base do ViaCEP).
    const cepInput = detailsDialog.getByPlaceholder('Escreva o CEP')
    const cepValue = await cepInput.inputValue().catch(() => '')
    if (!cepValue || !/^\d{5}-\d{3}$/.test(cepValue)) {
      await detailsDialog.locator('#no-cep').click()
    }

    // Salva
    await detailsDialog.getByRole('button', { name: 'Salvar' }).click()

    // --- Passo 5: sucesso ou "sem alteração" ---
    // A API pode retornar "No change" quando o endereço enviado é idêntico
    // ao já cadastrado (ex: o endereço foi excluído mas a API manteve o dado).
    const feedbackTitle = page
      .locator('[data-slot="drawer-title"]')
      .filter({ hasNotText: 'Detalhes do Endereço' })
    const noChangeToast = page.getByText(
      'No change: address matches current data'
    )

    const outcome = await Promise.race([
      feedbackTitle
        .waitFor({ state: 'visible', timeout: 20000 })
        .then(() => 'success'),
      noChangeToast
        .waitFor({ state: 'visible', timeout: 20000 })
        .then(() => 'no-change'),
    ])

    if (outcome === 'success') {
      await expect(feedbackTitle).toContainText('Endereço')
      await expect(feedbackTitle).toContainText('atualizado!')

      // Finalizar usa router.push('/meu-perfil/endereco') → volta para lista de endereços
      await page.getByRole('button', { name: 'Finalizar' }).click()
      await expect(page).toHaveURL('/meu-perfil/endereco', { timeout: 10000 })

      // Endereço recém-adicionado aparece na página
      await expect(
        page.locator('[class*="rounded-2xl"][class*="cursor-pointer"]').first()
      ).toBeVisible({ timeout: 10000 })
    } else {
      // Endereço já estava cadastrado com os mesmos dados — cenário válido
      await expect(noChangeToast).toBeVisible()
    }
  })
})
