import { SelecaoDataVencimento } from '@/app/components/divida-ativa/selecao-data-vencimento'
import { SelecaoParcelas } from '@/app/components/divida-ativa/selecao-parcelas'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { redirect } from 'next/navigation'

// ---------------------------------------------------------------------------
// Dados mockados — substituir por chamadas ao DAL quando os endpoints subirem
//
// Etapa 1 (sem ?parcelas=): opções de parcelamento vêm de
//   POST /imoveis/{inscricao}/divida-ativa/parcelamentos/simular
//   corpo: { cdas: string[] }
//   resposta: SimulacaoParcelamentoResponse → opcoes: ParcelaOpcaoResponse[]
//
// Etapa 2 (com ?parcelas=N): datas de vencimento disponíveis para aquela
//   quantidade de parcelas virão de
//   GET /imoveis/{inscricao}/divida-ativa/datas-vencimento?cdas=...
//   resposta: DatasVencimentoResponse → datas: string[]
//
// As strings monetárias seguem o padrão do DAM ("1.357,89"); as datas seguem
// "dd/MM/yyyy". A forma é fiel aos tipos Orval — só os valores são fictícios.
// ---------------------------------------------------------------------------

const MOCK_OPCOES_PARCELAMENTO = [
  {
    qtdeParcelas: 1,
    valor1aParcela: '1.357,89',
    valorJuros: '0,00',
    valorDescontos: '100,00',
    valorTotalDescontoPrinc: '100,00',
    valorTotalDescontoHonor: '0,00',
  },
  {
    qtdeParcelas: 3,
    valor1aParcela: '465,30',
    valorJuros: '38,42',
    valorDescontos: '50,00',
    valorTotalDescontoPrinc: '50,00',
    valorTotalDescontoHonor: '0,00',
  },
  {
    qtdeParcelas: 6,
    valor1aParcela: '240,18',
    valorJuros: '83,19',
    valorDescontos: '0,00',
    valorTotalDescontoPrinc: '0,00',
    valorTotalDescontoHonor: '0,00',
  },
  {
    qtdeParcelas: 12,
    valor1aParcela: '127,53',
    valorJuros: '172,47',
    valorDescontos: '0,00',
    valorTotalDescontoPrinc: '0,00',
    valorTotalDescontoHonor: '0,00',
  },
  {
    qtdeParcelas: 24,
    valor1aParcela: '70,21',
    valorJuros: '331,14',
    valorDescontos: '0,00',
    valorTotalDescontoPrinc: '0,00',
    valorTotalDescontoHonor: '0,00',
  },
]

const MOCK_DATAS_VENCIMENTO = [
  '05/10/2026',
  '05/11/2026',
  '05/12/2026',
  '05/01/2027',
  '05/02/2027',
]

/**
 * Simulação de parcelamento — duas etapas na mesma rota.
 *
 * ### Etapa 1 — Seleção de parcelas (sem `?parcelas=`)
 *
 * O cidadão chega da tela de débitos com as CDAs selecionadas. A página mostra as opções
 * de quantidade de parcelas com o respectivo valor da primeira. Ao clicar "Continuar",
 * `?parcelas=N` é acrescentado à URL e a etapa 2 é exibida.
 *
 * ### Etapa 2 — Seleção da data de vencimento (com `?parcelas=N`)
 *
 * Com a quantidade de parcelas definida, o cidadão escolhe a data de vencimento da
 * primeira parcela. O "Continuar" leva ao requerimento multi-step (PR 4) com `?data=`.
 *
 * ### Ordem das etapas
 *
 * Parcelas antes de data porque a lista de opções de parcela não depende da data — a
 * API de simulação recebe só as CDAs e devolve todas as quantidades possíveis. A data
 * de vencimento, por outro lado, pode variar por quantidade (o DAM pode ter janelas
 * diferentes para 1x e 24x), então ela é coletada depois da escolha de parcelas.
 *
 * ### URL compartilhável
 *
 * Ambos os estados vivem na mesma rota com parâmetros distintos, o que mantém o Voltar
 * do navegador previsível: etapa 2 → etapa 1 → tela de débitos.
 */
export default async function SimulacaoPage({
  searchParams,
}: {
  searchParams: Promise<{
    inscricao?: string
    cda?: string
    execucaoFiscal?: string
    cdas?: string
    parcelas?: string
  }>
}) {
  const params = await searchParams
  const { parcelas, ...outrosParams } = params

  // Sem critério de busca: o cidadão chegou aqui sem passar pela entrada do parcelamento.
  const temCriterio = params.inscricao || params.cda || params.execucaoFiscal
  if (!temCriterio) {
    redirect('/divida-ativa/parcelamento')
  }

  // Filtra os undefined antes de montar o Record — searchParams tipado tem string | undefined.
  const searchParamsAtual = Object.fromEntries(
    Object.entries(outrosParams).filter(
      (entry): entry is [string, string] => entry[1] !== undefined
    )
  )

  // Rota de retorno:
  // - etapa 2 (com ?parcelas=) volta à etapa 1 (sem ?parcelas=)
  // - etapa 1 volta à tela de débitos
  const rotaVoltar = parcelas
    ? `/divida-ativa/parcelamento/simulacao?${new URLSearchParams(searchParamsAtual)}`
    : '/divida-ativa/parcelamento/debitos'

  return (
    <div className="mx-auto flex min-h-lvh max-w-4xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader
        title=""
        className="max-w-4xl"
        route={rotaVoltar}
        forceRoute
      />

      {parcelas ? (
        /* Etapa 2: data de vencimento da primeira parcela */
        <SelecaoDataVencimento
          datas={MOCK_DATAS_VENCIMENTO}
          searchParamsAtual={{ ...searchParamsAtual, parcelas }}
        />
      ) : (
        /* Etapa 1: quantidade de parcelas */
        <SelecaoParcelas
          opcoes={MOCK_OPCOES_PARCELAMENTO}
          searchParamsAtual={searchParamsAtual}
        />
      )}
    </div>
  )
}
