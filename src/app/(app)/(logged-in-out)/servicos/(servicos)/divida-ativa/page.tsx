import { DividaAtivaServiceList } from '@/app/components/divida-ativa/divida-ativa-service-list'
import { SecondaryHeader } from '@/app/components/secondary-header'

/**
 * Landing do módulo de Dívida Ativa Imobiliária.
 *
 * Pública e sem dado do cidadão: é só a porta de entrada dos serviços. As telas que leem
 * dado pessoal (débitos, requerimentos) checam auth por conta própria, porque `/servicos/*`
 * é rota pública no middleware. O módulo inteiro está atrás de
 * `NEXT_PUBLIC_FEATURE_DIVIDA_ATIVA` — ver `docs/divida-ativa.md`.
 */
export const dynamic = 'force-static'

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
