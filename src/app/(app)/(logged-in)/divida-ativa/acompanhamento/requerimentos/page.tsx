import { RequerimentosErro } from '@/app/components/divida-ativa/requerimentos-erro'
import { RequerimentosLista } from '@/app/components/divida-ativa/requerimentos-lista'
import { RequerimentosVazio } from '@/app/components/divida-ativa/requerimentos-vazio'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { getDalDividaAtivaRequerimentos } from '@/lib/dal'
import { getUserInfoFromToken } from '@/lib/user-info'

/**
 * "Meus requerimentos" — todos os requerimentos de parcelamento do CPF logado.
 *
 * `GET /divida-ativa/requerimentos` sem parâmetro: a API lista pelo CPF do token, mais
 * recente primeiro. Três saídas, e a distinção decide o que o cidadão faz a seguir:
 * - **com requerimentos** → a lista, com o contribuinte em destaque;
 * - **sem requerimentos** → 200 com a mensagem da API, que é resposta legítima;
 * - **falha** → `indisponivel`, tratado como estado para o cidadão não perder a tela.
 */
export default async function MeusRequerimentosPage() {
  const { cpf } = await getUserInfoFromToken()
  const consulta = await getDalDividaAtivaRequerimentos(cpf)

  return (
    <div className="mx-auto flex min-h-lvh max-w-4xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader
        title=""
        className="max-w-4xl"
        route="/divida-ativa/acompanhamento"
        forceRoute
      />

      {consulta.situacao === 'indisponivel' ? (
        <RequerimentosErro />
      ) : consulta.situacao === 'vazio' ? (
        <RequerimentosVazio
          titulo="Você ainda não tem requerimentos de parcelamento"
          mensagem={consulta.mensagem}
        />
      ) : (
        <RequerimentosLista
          requerimentos={consulta.requerimentos}
          destaque="contribuinte"
        />
      )}
    </div>
  )
}
