import { ConsultaParcelamentoForm } from '@/app/components/divida-ativa/consulta-parcelamento-form'
import { ModoConsultaList } from '@/app/components/divida-ativa/modo-consulta-list'
import { parseModoConsulta } from '@/app/components/divida-ativa/modos-consulta'
import { SecondaryHeader } from '@/app/components/secondary-header'

/**
 * Entrada do parcelamento, em dois passos na mesma rota.
 *
 * Sem `?modo=`, mostra a lista dos três identificadores. Com `?modo=`, mostra o campo
 * correspondente. O título é o mesmo nos dois passos, como no Figma — o que muda é o corpo.
 *
 * Um `?modo=` desconhecido cai na lista em vez de estourar: o endereço é compartilhável, e um
 * link velho ou editado à mão não deve virar erro para o cidadão.
 *
 * O "Continuar" leva para `/divida-ativa/parcelamento/debitos`, com o critério na query. Os
 * três modos convergem para a mesma tela porque a API aceita **critério único** por consulta
 * (RN-001/RN-002) e devolve a mesma resposta para os quatro critérios que aceita.
 */
export default async function ParcelamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ modo?: string }>
}) {
  const { modo } = await searchParams
  const modoSelecionado = parseModoConsulta(modo)

  return (
    <div className="mx-auto flex min-h-lvh max-w-4xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader
        title=""
        className="max-w-4xl"
        route={modoSelecionado ? '/divida-ativa/parcelamento' : '/divida-ativa'}
      />

      <h1 className="px-4 pt-2 pb-6 text-3xl font-medium leading-9 text-foreground">
        Selecione uma das informações para consulta
      </h1>

      {modoSelecionado ? (
        // Só o id: a configuração carrega funções, que não atravessam a fronteira RSC.
        <ConsultaParcelamentoForm modo={modoSelecionado.id} />
      ) : (
        <ModoConsultaList />
      )}
    </div>
  )
}
