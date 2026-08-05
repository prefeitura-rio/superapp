import { expect, test } from '@playwright/test'
import { hasE2EAuth } from './fixtures/auth'

/**
 * Canário de CREDENCIAL — NUNCA pula silenciosamente num run que EXIGE auth.
 *
 * O workflow define `E2E_REQUIRE_AUTH`:
 *  - `true`  em runs do próprio repo (push / PR same-repo), onde os secrets
 *    estão disponíveis e a suíte autenticada DEVE rodar.
 *  - `false`/ausente em PRs de fork (o GitHub não passa secrets a forks — rodar
 *    só o público é o esperado).
 *
 * Comportamento:
 *  - require-auth + token AUSENTE  → FALHA ALTO (secret sumiu / expirou-para-vazio
 *    / mint falhou). Sem isso, os ~84 testes autenticados sumiriam como skip mudo
 *    e o CI ficaria "verde" testando quase nada.
 *  - require-auth + token presente → passa.
 *  - fork / sem require-auth        → skip explícito (público-only é intencional).
 */
test('canário: E2E_ACCESS_TOKEN presente quando o run exige auth', () => {
  if (process.env.E2E_REQUIRE_AUTH !== 'true') {
    test.skip(
      true,
      'Run público (fork/sem secrets) — auth não exigida (E2E_REQUIRE_AUTH != "true").'
    )
    return
  }

  expect(
    hasE2EAuth(),
    'E2E_ACCESS_TOKEN AUSENTE num run que EXIGE auth. Os testes autenticados ' +
      'pulariam em massa. Configure/rotacione o secret no CI ' +
      '(preferir E2E_REFRESH_TOKEN + IDENTIDADE_CARIOCA_CLIENT_SECRET para mint ' +
      'automático; ou E2E_ACCESS_TOKEN estático).'
  ).toBeTruthy()
})
