import { DividaAtivaServiceList } from '@/app/components/divida-ativa/divida-ativa-service-list'

/**
 * Conteúdo da landing do módulo. Separado da rota para ser testável sem Server Component.
 */
export function DividaAtivaLanding() {
  return (
    <>
      <h1 className="px-4 pt-2 pb-6 text-3xl font-medium leading-9 text-foreground">
        Dívida ativa
      </h1>

      <h2 className="px-4 pb-2 text-sm font-medium leading-5 text-foreground">
        Serviços
      </h2>

      <div className="px-4">
        <DividaAtivaServiceList />
      </div>
    </>
  )
}
