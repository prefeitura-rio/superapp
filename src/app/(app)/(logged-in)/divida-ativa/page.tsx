import { DividaAtivaServiceList } from '@/app/components/divida-ativa/divida-ativa-service-list'
import { SecondaryHeader } from '@/app/components/secondary-header'

/**
 * Landing do módulo de Dívida Ativa Imobiliária.
 *
 * **Exige login.** O módulo vive em `/divida-ativa`, fora da allowlist de rotas públicas do
 * `src/middleware.ts` — o middleware redireciona anônimo para o id.rio. A proteção vem da
 * URL, não do nome do grupo de rotas `(logged-in)`. Por isso o módulo **não** pode voltar
 * para `/servicos/*`, que é público por allowlist.
 *
 * A página não lê dado do cidadão — é só a porta de entrada. Quem lê dado pessoal são as
 * telas internas (débitos, requerimentos), que pegam o CPF do token.
 *
 * Sem `export const dynamic = 'force-static'` de propósito: o root layout lê `headers()` para
 * o nonce da CSP, o que torna toda página do app renderizada sob demanda. A diretiva não teria
 * efeito nenhum aqui e só passaria a impressão errada.
 *
 * O módulo inteiro está atrás de `NEXT_PUBLIC_FEATURE_DIVIDA_ATIVA` — ver `docs/divida-ativa.md`.
 */

export default function DividaAtivaPage() {
  return (
    <div className="mx-auto flex min-h-lvh max-w-xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader title="" className="max-w-xl" />

      <h1 className="px-4 pt-2 pb-6 text-3xl font-medium leading-9 text-foreground">
        Serviços relacionados à dívida ativa
      </h1>

      <div className="px-4">
        <DividaAtivaServiceList />
      </div>
    </div>
  )
}
