import { DividaAtivaLanding } from '@/app/components/divida-ativa/divida-ativa-landing'
import { SecondaryHeader } from '@/app/components/secondary-header'

/**
 * Landing do módulo de Dívida Ativa Imobiliária.
 *
 * **Exige login.** O módulo vive em `/divida-ativa`, fora da allowlist de rotas públicas do
 * `src/middleware.ts` — o middleware redireciona anônimo para o id.rio. A proteção vem da
 * URL, não do nome do grupo de rotas `(logged-in)`. Por isso o módulo **não** pode voltar
 * para `/servicos/*`, que é público por allowlist.
 *
 * Nesta entrega (Marco 1) a landing é só a porta de entrada: cinco serviços, três ainda no
 * portal legado e dois internos em construção. Cadastro de imóveis entra no Marco 2.
 *
 * Sem `export const dynamic = 'force-static'` de propósito: o root layout lê `headers()` para
 * o nonce da CSP, o que torna toda página do app renderizada sob demanda.
 *
 * O módulo inteiro está atrás de `NEXT_PUBLIC_FEATURE_DIVIDA_ATIVA` — ver `docs/divida-ativa.md`.
 */

export default function DividaAtivaPage() {
  return (
    <div className="mx-auto flex min-h-lvh max-w-xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader title="" className="max-w-xl" />

      <DividaAtivaLanding />
    </div>
  )
}
