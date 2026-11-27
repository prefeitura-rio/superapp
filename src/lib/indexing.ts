/**
 * Só o domínio de produção pode ser indexado por buscadores. Staging
 * (`staging.app.dados.rio`), localhost e qualquer ambiente sem
 * `NEXT_PUBLIC_HOME_URL` saem com `noindex`.
 *
 * A decisão usa o hostname de `NEXT_PUBLIC_HOME_URL`, que já é passado no build
 * de cada ambiente (`deploy-staging.yaml` e `release-production.yaml`). Se essa
 * variável faltar no build de produção, produção sai com `noindex`.
 *
 * Sem imports: este módulo é carregado pelo `next.config.ts`.
 */
export const PRODUCTION_INDEXABLE_HOSTNAME = 'pref.rio'

export function isIndexingAllowed(
  homeUrl: string | undefined = process.env.NEXT_PUBLIC_HOME_URL
): boolean {
  const value = homeUrl?.trim()
  if (!value) return false
  try {
    return new URL(value).hostname === PRODUCTION_INDEXABLE_HOSTNAME
  } catch {
    return false
  }
}
