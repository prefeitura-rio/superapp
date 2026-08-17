import { DividaAtivaServiceList } from '@/app/components/divida-ativa/divida-ativa-service-list'
import { MeusImoveisCard } from '@/app/components/divida-ativa/meus-imoveis-card'

interface DividaAtivaLandingProps {
  quantidadeImoveis: number | null
}

/**
 * Conteúdo da landing do módulo. Separado da rota para ser testável sem Server Component:
 * a página só resolve a contagem e entrega aqui.
 */
export function DividaAtivaLanding({
  quantidadeImoveis,
}: DividaAtivaLandingProps) {
  return (
    <>
      <h1 className="px-4 pt-2 pb-6 text-3xl font-medium leading-9 text-foreground">
        Dívida ativa
      </h1>

      <div className="px-4">
        <MeusImoveisCard quantidade={quantidadeImoveis} />
      </div>

      <h2 className="px-4 pt-6 pb-2 text-sm font-medium leading-5 text-foreground">
        Serviços
      </h2>

      <div className="px-4">
        <DividaAtivaServiceList />
      </div>
    </>
  )
}
