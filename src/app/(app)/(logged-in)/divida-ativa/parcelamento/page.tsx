import { ConsultaInscricaoForm } from '@/app/components/divida-ativa/consulta-inscricao-form'
import { ConsultaParcelamentoForm } from '@/app/components/divida-ativa/consulta-parcelamento-form'
import { ModoConsultaList } from '@/app/components/divida-ativa/modo-consulta-list'
import { parseModoConsulta } from '@/app/components/divida-ativa/modos-consulta'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { getDalDividaAtivaImoveis } from '@/lib/dal'
import { getUserInfoFromToken } from '@/lib/user-info'

/**
 * Entrada do parcelamento — até três passos na mesma rota.
 *
 * **Sem `?modo=`:** lista dos três identificadores (`ModoConsultaList`).
 *
 * **Com `?modo=inscricao`:** `ConsultaInscricaoForm` — campo manual com máscara +
 * lista de "Meus Imóveis" filtrável. Os imóveis são buscados aqui, no Server Component,
 * para o Client Component não precisar de token nem de fetch: ele recebe apenas dados
 * serializáveis.
 *
 * **Com `?modo=cda` ou `?modo=execucao-fiscal`:** `ConsultaParcelamentoForm` genérico —
 * campo único sem lista de imóveis (esses identificadores não têm vínculo com o cadastro).
 *
 * Um `?modo=` desconhecido cai na lista: link velho ou editado à mão não vira erro.
 */
export default async function ParcelamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ modo?: string }>
}) {
  const { modo } = await searchParams
  const modoSelecionado = parseModoConsulta(modo)

  // Imóveis só são necessários no modo inscrição. A chamada é feita aqui, no RSC, porque:
  // 1. O token de acesso fica em cookie httpOnly — Client Component não o vê.
  // 2. A lista chega pronta como prop serializável, sem fetch no cliente.
  // 3. `getDalDividaAtivaImoveis` já tem `no-store` — dado financeiro nunca vai a cache.

  const imoveis =
    modoSelecionado?.id === 'inscricao'
      ? await getDalDividaAtivaImoveis((await getUserInfoFromToken()).cpf)
      : []

  return (
    <div className="mx-auto flex min-h-lvh max-w-4xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader
        title=""
        className="max-w-4xl"
        route={modoSelecionado ? '/divida-ativa/parcelamento' : '/divida-ativa'}
        forceRoute
      />

      <h1 className="px-4 pt-2 pb-6 text-3xl font-medium leading-9 text-foreground">
        Selecione uma das informações para consulta
      </h1>

      {modoSelecionado?.id === 'inscricao' ? (
        <ConsultaInscricaoForm imoveis={imoveis} />
      ) : modoSelecionado ? (
        // CDA e execução fiscal: campo simples, sem lista de imóveis.
        // Só o id atravessa a fronteira RSC — funções (formatar/validar) ficam no cliente.
        <ConsultaParcelamentoForm modo={modoSelecionado.id} />
      ) : (
        <ModoConsultaList />
      )}
    </div>
  )
}
