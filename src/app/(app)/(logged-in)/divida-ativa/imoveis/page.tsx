import {
  ImoveisLista,
  ImoveisVazio,
} from '@/app/components/divida-ativa/imoveis-lista'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { getDalDividaAtivaImoveis } from '@/lib/dal'
import { getUserInfoFromToken } from '@/lib/user-info'

/**
 * "Meus imóveis" — os imóveis que o cidadão salvou para não precisar digitar a inscrição
 * imobiliária a cada consulta de débito.
 *
 * O CPF sai do token e serve só para mascarar o span: a API vincula a lista ao cidadão pelo
 * Bearer, e nenhum endpoint do módulo aceita CPF como parâmetro.
 */
export default async function MeusImoveisPage() {
  const { cpf } = await getUserInfoFromToken()
  const imoveis = await getDalDividaAtivaImoveis(cpf)

  return (
    <div className="mx-auto flex min-h-lvh max-w-4xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader title="" className="max-w-4xl" route="/divida-ativa" />

      {/* No vazio a mensagem assume o lugar do título (Figma) — o h1 "Meus imóveis"
          só existe quando há lista para intitular. */}
      {imoveis.length === 0 ? (
        <ImoveisVazio />
      ) : (
        <>
          <h1 className="px-4 pt-2 pb-6 text-3xl font-medium leading-9 text-foreground">
            Meus imóveis
          </h1>

          <div className="px-4">
            <ImoveisLista imoveis={imoveis} />
          </div>
        </>
      )}
    </div>
  )
}
