import { AnexarDocumentos } from '@/app/components/divida-ativa/anexar-documentos'
import {
  DadosCorrespondenciaForm,
  type EnderecoPerfil,
} from '@/app/components/divida-ativa/dados-correspondencia-form'
import { DadosRequerenteForm } from '@/app/components/divida-ativa/dados-requerente-form'
import { EscolhaTipoSolicitante } from '@/app/components/divida-ativa/escolha-tipo-solicitante'
import { RevisarRequerimentoShell } from '@/app/components/divida-ativa/revisar-requerimento-shell'
import { SimulacaoAviso } from '@/app/components/divida-ativa/simulacao-aviso'
import {
  type TipoSolicitante,
  isTipoSolicitante,
} from '@/app/components/divida-ativa/tipos-solicitante'
import { SecondaryHeader } from '@/app/components/secondary-header'
import {
  getDalCitizenCpf,
  getDalDividaAtivaConsultaAvulsa,
  getDalDividaAtivaSimulacao,
} from '@/lib/dal'
import { criterioDaUrl, somenteDigitos } from '@/lib/divida-ativa-utils'
import {
  getProvedorLogin,
  urlContaIdentidadeCarioca,
} from '@/lib/provedor-login'
import { getUserInfoFromToken } from '@/lib/user-info'
import { redirect } from 'next/navigation'

const ETAPAS = [
  'tipo',
  'requerente',
  'correspondencia',
  'documentos',
  'revisao',
] as const

type EtapaRequerimento = (typeof ETAPAS)[number]

/**
 * Requerimento de parcelamento — fluxo de cinco etapas na mesma rota.
 *
 * ### Etapa 1 — Tipo de vínculo (`?etapa=tipo` ou ausente)
 *
 * O cidadão escolhe o vínculo com o débito (próprio contribuinte, sócio responsável,
 * procurador ou atual proprietário/possuidor). A escolha define quais documentos serão
 * exigidos na etapa seguinte. O valor de `?tipo=` é validado aqui: lixo da URL não chega
 * ao componente.
 *
 * ### Etapas 2 e 3 — Dados do requerente e de correspondência
 *
 * `?etapa=requerente` (telefone e e-mail) e `?etapa=correspondencia` (nome, CPF/CNPJ,
 * endereço, telefone e e-mail para as comunicações). Não estão no Figma: espelham o portal
 * legado e a validação da API, e esperam a aprovação do design. Chegam preenchidas com o
 * perfil id.rio; o que o cidadão edita fica no `sessionStorage` — dado pessoal não vai na URL.
 *
 * ### Etapa 4 — Documentos (`?etapa=documentos&tipo=CONTRIBUINTE`)
 *
 * Lista de slots de upload dependente do tipo. O cidadão anexa os documentos obrigatórios
 * (e opcionalmente os extras). Os arquivos ficam no `sessionStorage` da aba — não há server
 * action aqui.
 *
 * ### Etapa 5 — Revisão e envio (`?etapa=revisao&tipo=...&documentos=...`)
 *
 * Exibe um resumo (valor total, nº de parcelas, dados da CDA, carrossel de parcelas) e o
 * botão "Requerer parcelamento", que dispara a server action.
 *
 * ### Navegação
 *
 * - Voltar da etapa 1 → seleção de parcelas (`/parcelamento/simulacao` com `?data=` e
 *   `?parcelas=`), com a quantidade escolhida marcada
 * - Cada etapa seguinte volta à imediatamente anterior: requerente → tipo (marcado),
 *   correspondência → requerente, documentos → correspondência, revisão → documentos. Os
 *   dados preenchidos e os arquivos anexados reaparecem (sessionStorage).
 *
 * ### Contexto da URL
 *
 * Os parâmetros do parcelamento (`cdas`, `data`, `parcelas`, critério da consulta) chegam
 * da etapa de seleção de parcelas e seguem na URL em todas as etapas para:
 * - Reconstruir a tela de revisão de pagamento ao voltar
 * - Chamar o DAL na etapa de revisão para buscar os dados das CDAs
 * - Montar o corpo da server action
 */
export default async function RequerimentoPage({
  searchParams,
}: {
  searchParams: Promise<{
    inscricao?: string
    cda?: string
    execucaoFiscal?: string
    cdas?: string
    data?: string
    parcelas?: string
    etapa?: string
    tipo?: string
    pj?: string
  }>
}) {
  const params = await searchParams

  // Sem critério de busca: o cidadão chegou aqui sem passar pela entrada do parcelamento.
  const criterio = criterioDaUrl(params)
  if (!criterio) {
    redirect('/divida-ativa/parcelamento')
  }

  const cdas = (params.cdas ?? '').split(',').filter(Boolean)
  const data = params.data ?? ''
  const parcelas = Number(params.parcelas) || 0

  // Sem CDAs selecionadas nem data/parcelas: volta para a simulação.
  if (cdas.length === 0 || !data || parcelas === 0) {
    const searchParamsSimulacao = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(
          (e): e is [string, string] =>
            typeof e[1] === 'string' &&
            !['etapa', 'tipo', 'documentos'].includes(e[0])
        )
      )
    )
    redirect(`/divida-ativa/parcelamento/simulacao?${searchParamsSimulacao}`)
  }

  // Parâmetros correntes da URL — passados para os componentes filhos navegarem sem perder contexto.
  const searchParamsAtual: Record<string, string> = Object.fromEntries(
    Object.entries(params).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string'
    )
  )

  const etapa: EtapaRequerimento =
    ETAPAS.find(e => e === params.etapa) ?? 'tipo'

  // Da etapa 2 em diante o vínculo é obrigatório: inválido, ausente ou de um link antigo volta
  // para a escolha. Validado uma vez aqui, para nenhuma etapa receber lixo da URL.
  const tipo = params.tipo
  if (etapa !== 'tipo' && !isTipoSolicitante(tipo)) {
    redirect(
      `/divida-ativa/parcelamento/requerimento?${new URLSearchParams({
        ...searchParamsAtual,
        etapa: 'tipo',
      })}`
    )
  }

  // Rota de retorno para cada etapa.
  const semEtapaEtipo = new URLSearchParams(
    Object.fromEntries(
      Object.entries(searchParamsAtual).filter(
        ([k]) => !['etapa', 'tipo'].includes(k)
      )
    )
  )
  const rotaRevisaoPagamento = `/divida-ativa/parcelamento/revisao?${semEtapaEtipo}`
  // O `?tipo=` segue nas rotas de volta: a escolha do solicitante reaparece marcada.
  const comTipo = params.tipo
    ? { ...Object.fromEntries(semEtapaEtipo), tipo: params.tipo }
    : Object.fromEntries(semEtapaEtipo)
  // Etapa anterior ao requerimento: as parcelas, com `?data=` e `?parcelas=` já marcados.
  const rotaParcelas = `/divida-ativa/parcelamento/simulacao?${new URLSearchParams(comTipo)}`
  const rotaEtapa = (destino: EtapaRequerimento) =>
    `/divida-ativa/parcelamento/requerimento?${new URLSearchParams({ ...comTipo, etapa: destino })}`

  // Cada etapa volta à imediatamente anterior; a primeira, às parcelas.
  const indice = ETAPAS.indexOf(etapa)
  const rotaVoltar = indice === 0 ? rotaParcelas : rotaEtapa(ETAPAS[indice - 1])

  return (
    <div className="mx-auto flex min-h-lvh max-w-4xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader
        title=""
        className="max-w-4xl"
        route={rotaVoltar}
        forceRoute
      />

      {etapa === 'tipo' && (
        <EscolhaTipoSolicitante searchParamsAtual={searchParamsAtual} />
      )}

      {(etapa === 'requerente' || etapa === 'correspondencia') && (
        <EtapaDados etapa={etapa} searchParamsAtual={searchParamsAtual} />
      )}

      {etapa === 'documentos' && isTipoSolicitante(tipo) && (
        <AnexarDocumentos
          tipo={tipo}
          devedorPessoaJuridica={params.pj === '1'}
          searchParamsAtual={searchParamsAtual}
        />
      )}

      {etapa === 'revisao' && isTipoSolicitante(tipo) && (
        <EtapaRevisao
          cdas={cdas}
          data={data}
          parcelas={parcelas}
          tipo={tipo}
          searchParamsAtual={searchParamsAtual}
          rotaVoltar={rotaEtapa('documentos')}
          rotaRequerente={rotaEtapa('requerente')}
          rotaCorrespondencia={rotaEtapa('correspondencia')}
          rotaRevisaoPagamento={rotaRevisaoPagamento}
        />
      )}
    </div>
  )
}

/** Só aceita o que o formulário espera: o perfil chega com `'null'`, `'Não informado'` etc. */
function textoDoPerfil(valor: string | undefined | null): string {
  const texto = valor?.trim() ?? ''
  return texto === 'null' || texto === 'Não informado' ? '' : texto
}

/**
 * Etapas 2 e 3 — dados do requerente e de correspondência, pré-preenchidos com o perfil id.rio.
 *
 * O perfil é só ponto de partida: se a consulta falhar ou o cadastro estiver incompleto, os
 * campos chegam vazios e o cidadão preenche. Nome e CPF vêm do token, nunca do perfil nem da URL.
 */
async function EtapaDados({
  etapa,
  searchParamsAtual,
}: {
  etapa: 'requerente' | 'correspondencia'
  searchParamsAtual: Record<string, string>
}) {
  const { cpf, name } = await getUserInfoFromToken()

  let perfil: Awaited<ReturnType<typeof getDalCitizenCpf>>['data'] | null = null
  try {
    const resposta = await getDalCitizenCpf(cpf)
    perfil = resposta.status === 200 ? resposta.data : null
  } catch {
    perfil = null
  }

  if (etapa === 'requerente') {
    const telefone = perfil?.telefone?.principal
    return (
      <DadosRequerenteForm
        nome={name}
        cpf={cpf}
        perfil={{
          telefone: `${textoDoPerfil(telefone?.ddd)}${textoDoPerfil(telefone?.valor)}`,
          email: textoDoPerfil(perfil?.email?.principal?.valor),
        }}
        searchParamsAtual={searchParamsAtual}
      />
    )
  }

  const principal = perfil?.endereco?.principal
  const estado = textoDoPerfil(principal?.estado)
  const cep = somenteDigitos(textoDoPerfil(principal?.cep))
  const endereco: EnderecoPerfil = {
    cep: cep.length === 8 ? cep : '',
    logradouro: [principal?.tipo_logradouro, principal?.logradouro]
      .map(textoDoPerfil)
      .filter(Boolean)
      .join(' '),
    numero: textoDoPerfil(principal?.numero),
    complemento: textoDoPerfil(principal?.complemento),
    bairro: textoDoPerfil(principal?.bairro),
    municipio: textoDoPerfil(principal?.municipio),
    // A UF vai como sigla; o perfil pode trazer o nome do estado.
    uf: /^[A-Za-z]{2}$/.test(estado) ? estado.toUpperCase() : '',
  }

  return (
    <DadosCorrespondenciaForm
      nome={name}
      cpf={cpf}
      endereco={endereco}
      searchParamsAtual={searchParamsAtual}
    />
  )
}

/**
 * Etapa 5 — Revisão: busca dados das CDAs e simulação no servidor, depois entrega ao
 * `RevisarRequerimentoShell`, que lê dados e documentos do `sessionStorage` no cliente.
 *
 * Os documentos não trafegam na URL (evita HTTP 431 por base64 nos headers).
 */
async function EtapaRevisao({
  cdas,
  data,
  parcelas,
  tipo,
  searchParamsAtual,
  rotaVoltar,
  rotaRequerente,
  rotaCorrespondencia,
  rotaRevisaoPagamento,
}: {
  cdas: string[]
  data: string
  parcelas: number
  tipo: TipoSolicitante
  searchParamsAtual: Record<string, string>
  rotaVoltar: string
  rotaRequerente: string
  rotaCorrespondencia: string
  rotaRevisaoPagamento: string
}) {
  const { cpf, name } = await getUserInfoFromToken()
  const provedorLogin = await getProvedorLogin()

  // Busca a simulação de parcelamento para obter valor total e valor da 1ª parcela.
  const simulacao = await getDalDividaAtivaSimulacao(cdas, data, cpf)

  if (simulacao.situacao !== 'ok') {
    const descricao =
      simulacao.situacao === 'recusada'
        ? simulacao.mensagem
        : 'O serviço de dívida ativa está indisponível no momento. Tente novamente em alguns minutos.'

    return (
      <SimulacaoAviso
        titulo="Não foi possível carregar o resumo do parcelamento"
        descricao={descricao}
        acao={{ rotulo: 'Voltar', href: rotaRevisaoPagamento }}
      />
    )
  }

  const opcaoEscolhida =
    simulacao.opcoes.find(o => o.qtdeParcelas === parcelas) ?? null

  // Calcula o valor total (mesmo cálculo de `SelecaoParcelas`).
  const valorTotal =
    simulacao.valorTotalAvista !== null
      ? (simulacao.valorTotalAvista ?? 0) + (opcaoEscolhida?.valorJuros ?? 0)
      : null

  // Busca os dados das CDAs para o card de informações fiscais.
  const criterio = criterioDaUrl(searchParamsAtual)
  let debitosCdas: import('@/types/divida-ativa').DebitoDividaAtiva[] = []

  if (criterio) {
    const consulta = await getDalDividaAtivaConsultaAvulsa(criterio, cpf)
    if (consulta.situacao === 'ok') {
      debitosCdas = consulta.debitos.cdas.filter(c =>
        cdas.includes(c.numeroCda)
      )
    }
  }

  return (
    <RevisarRequerimentoShell
      nome={name}
      cpf={cpf}
      provedorLogin={provedorLogin}
      urlContaIdentidade={urlContaIdentidadeCarioca()}
      cdas={cdas}
      qtdeParcelas={parcelas}
      dtVencimento={data}
      valor1aParcela={opcaoEscolhida?.valor1aParcela ?? null}
      valorTotal={valorTotal}
      debitosCdas={debitosCdas}
      tipo={tipo}
      rotaDocumentos={rotaVoltar}
      rotaRequerente={rotaRequerente}
      rotaCorrespondencia={rotaCorrespondencia}
    />
  )
}
