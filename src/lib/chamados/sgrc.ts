import type {
  ModelsMaintenanceRequest,
  ModelsPaginatedMaintenanceRequests,
  ModelsPublicMaintenanceRequest,
  ModelsPublicMaintenanceRequestAndamento,
  ModelsPublicMaintenanceRequestResponse,
} from '@/http/models'

/**
 * Histórico do 1746 legado (SGRC), servido pelo app-rmi.
 *
 * O protocolo do SGRC tem o formato `RIO-12345678-9`; o do Salesforce,
 * `RIO-2026-00000001`. Os dois não colidem, então o formato decide para qual
 * backend a consulta vai. O RMI responde 400 para qualquer outro formato
 * (inclusive o do Salesforce).
 *
 * A regex estrita também é a barreira contra path traversal: o client gerado
 * interpola o protocolo direto na URL, junto com o Bearer do cidadão.
 */
const PROTOCOLO_SGRC = /^RIO-\d{8}-\d$/

/** Itens por página da lista SGRC (o RMI aceita até 100). */
export const POR_PAGINA_SGRC = 10

/** Protocolo SGRC normalizado (maiúsculas, sem espaços) ou `null`. */
export function normalizarProtocoloSgrc(valor: string): string | null {
  const protocolo = valor.trim().toUpperCase()
  return PROTOCOLO_SGRC.test(protocolo) ? protocolo : null
}

export function ehProtocoloSgrc(valor: string): boolean {
  return normalizarProtocoloSgrc(valor) !== null
}

function texto(valor: unknown): string | undefined {
  if (typeof valor !== 'string') return undefined
  const limpo = valor.trim()
  return limpo === '' ? undefined : limpo
}

/** Data que o navegador consegue interpretar; qualquer outra coisa some. */
function data(valor: unknown): string | undefined {
  const bruto = texto(valor)
  return bruto && !Number.isNaN(Date.parse(bruto)) ? bruto : undefined
}

function instante(valor: string | undefined): number {
  return valor ? Date.parse(valor) : 0
}

function lista<T>(valor: unknown): T[] {
  return Array.isArray(valor)
    ? valor.filter((item): item is T => typeof item === 'object' && !!item)
    : []
}

// ─── Lista (Minhas Solicitações) ─────────────────────────────────────────────

export interface OrdemListaSgrc {
  codigoOs: string
  servico: string
  categoria?: string
  status?: string
  dataAbertura?: string
  isAcessoInformacao: false
}

export interface ProtocoloListaSgrc {
  /** Vazio quando o chamado não tem protocolo consultável no RMI. */
  protocolo: string
  status?: string
  dataAbertura?: string
  ordens_de_servico: OrdemListaSgrc[]
}

export interface PaginacaoSgrc {
  page: number
  perPage: number
  total: number
  totalPages: number
}

export interface ListaSgrc {
  protocolos: ProtocoloListaSgrc[]
  pagination: PaginacaoSgrc
}

/**
 * Protocolo que abre o detalhe. Cada chamado expõe `protocolos[]`; o escalar
 * `protocolo` só vem quando há exatamente um código.
 */
function protocoloDoChamado(chamado: ModelsMaintenanceRequest): string {
  const candidatos = [
    chamado.protocolo,
    ...(Array.isArray(chamado.protocolos) ? chamado.protocolos : []),
  ]
  for (const candidato of candidatos) {
    const protocolo =
      typeof candidato === 'string' ? normalizarProtocoloSgrc(candidato) : null
    if (protocolo) return protocolo
  }
  return ''
}

function servicoDe(chamado: {
  subtipo?: string
  tipo?: string
  categoria?: string
}): string {
  return (
    texto(chamado.subtipo) ??
    texto(chamado.tipo) ??
    texto(chamado.categoria) ??
    '—'
  )
}

/**
 * Um card por chamado. Só sai o necessário para o card: o item do RMI traz
 * CPF, descrição e endereço, que nunca vão para o navegador na lista.
 */
export function mapearListaSgrc(
  resposta: ModelsPaginatedMaintenanceRequests | null | undefined,
  paginaPedida: number
): ListaSgrc {
  const chamados = lista<ModelsMaintenanceRequest>(resposta?.data)

  const protocolos = chamados.map(chamado => {
    const status = texto(chamado.status)
    const dataAbertura = data(chamado.data_inicio)
    return {
      protocolo: protocoloDoChamado(chamado),
      status,
      dataAbertura,
      ordens_de_servico: [
        {
          codigoOs: texto(chamado.id_chamado) ?? texto(chamado.id) ?? '',
          servico: servicoDe(chamado),
          categoria: texto(chamado.categoria),
          status,
          dataAbertura,
          isAcessoInformacao: false as const,
        },
      ],
    }
  })

  const paginacao = resposta?.pagination
  const perPage =
    typeof paginacao?.per_page === 'number' && paginacao.per_page > 0
      ? paginacao.per_page
      : POR_PAGINA_SGRC
  const total =
    typeof paginacao?.total === 'number' && paginacao.total >= 0
      ? paginacao.total
      : protocolos.length
  const totalPages =
    typeof paginacao?.total_pages === 'number' && paginacao.total_pages >= 0
      ? paginacao.total_pages
      : Math.ceil(total / perPage)
  const page =
    typeof paginacao?.page === 'number' && paginacao.page > 0
      ? paginacao.page
      : paginaPedida

  return {
    protocolos,
    pagination: { page, perPage, total, totalPages: Math.max(1, totalPages) },
  }
}

// ─── Detalhe (titular) e consulta pública ────────────────────────────────────

export type ModoDetalheSgrc = 'dono' | 'publico'

export interface AndamentoSgrc {
  evento: string
  dataInsercao: string
  descricao: string
}

export interface OrdemDetalheSgrc {
  codigoOs: string
  servico: string
  subtema?: string
  categoria?: string
  status?: string
  dataAbertura?: string
  previsaoSLA?: string
  orgaoResponsavel?: { nome: string }
  descricao?: string
  endereco?: { logradouro?: string; bairro?: string }
  andamentos?: AndamentoSgrc[]
  ultimoAndamento?: AndamentoSgrc
  isAcessoInformacao: false
}

export interface DetalheSgrc {
  protocolo: string
  status?: string
  dataAbertura?: string
  dataUltimaAtualizacao?: string
  loaded_at?: string
  ordens_de_servico: OrdemDetalheSgrc[]
}

function andamentosEmOrdem(
  chamado: ModelsPublicMaintenanceRequest
): AndamentoSgrc[] {
  return lista<ModelsPublicMaintenanceRequestAndamento>(chamado.andamentos)
    .map(andamento => ({
      evento: texto(andamento.tipo) ?? '—',
      dataInsercao: data(andamento.data) ?? '',
      descricao: texto(andamento.descricao) ?? '',
    }))
    .sort((a, b) => instante(a.dataInsercao) - instante(b.dataInsercao))
}

function ordemDe(
  chamado: ModelsPublicMaintenanceRequest,
  modo: ModoDetalheSgrc
): OrdemDetalheSgrc {
  const ordem: OrdemDetalheSgrc = {
    codigoOs: texto(chamado.id_chamado) ?? '',
    servico: servicoDe(chamado),
    subtema: texto(chamado.tipo),
    categoria: texto(chamado.categoria),
    status: texto(chamado.status),
    dataAbertura: data(chamado.data_inicio),
    previsaoSLA: data(chamado.data_alvo_finalizacao),
    isAcessoInformacao: false,
  }

  const orgao = texto(chamado.nome_unidade_organizacional)
  if (orgao) ordem.orgaoResponsavel = { nome: orgao }

  const andamentos = andamentosEmOrdem(chamado)
  const bairro = texto(chamado.bairro)

  if (modo === 'dono') {
    // Logradouro e descrição só existem quando o RMI reconhece o titular.
    const logradouro = texto(chamado.logradouro)
    ordem.descricao = texto(chamado.descricao)
    if (logradouro || bairro) ordem.endereco = { logradouro, bairro }
    if (andamentos.length > 0) ordem.andamentos = andamentos
    return ordem
  }

  // Consulta pública: o Bearer do cidadão pode ter ido junto e liberado
  // logradouro e descrição. Eles nunca saem daqui, seja quem for o titular.
  if (bairro) ordem.endereco = { bairro }
  const ultimo = andamentos.at(-1)
  if (ultimo) ordem.ultimoAndamento = ultimo
  return ordem
}

/**
 * Monta o detalhe no formato que `/solicitacoes/[id]` e `/consulta-protocolo`
 * já consomem. No modo `dono` ficam só os chamados de que o cidadão é titular;
 * sem nenhum, devolve `null` (a página cai na consulta pública).
 */
export function mapearDetalheSgrc(
  protocolo: string,
  resposta: ModelsPublicMaintenanceRequestResponse | null | undefined,
  modo: ModoDetalheSgrc
): DetalheSgrc | null {
  const chamados = lista<ModelsPublicMaintenanceRequest>(resposta?.chamados)
    .filter(chamado => modo === 'publico' || chamado.titular === true)
    .sort(
      (a, b) => instante(data(b.data_inicio)) - instante(data(a.data_inicio))
    )

  if (chamados.length === 0) return null

  const aberturas = chamados
    .map(chamado => data(chamado.data_inicio))
    .filter((valor): valor is string => !!valor)
  const atualizacoes = chamados.flatMap(chamado => [
    ...andamentosEmOrdem(chamado).map(andamento => andamento.dataInsercao),
    data(chamado.data_inicio) ?? '',
  ])
  const cargas = chamados
    .map(chamado => data(chamado.loaded_at))
    .filter((valor): valor is string => !!valor)

  const maisAntiga = (valores: string[]) =>
    valores.reduce<string | undefined>(
      (atual, valor) =>
        !atual || instante(valor) < instante(atual) ? valor : atual,
      undefined
    )
  const maisRecente = (valores: string[]) =>
    valores
      .filter(valor => valor !== '')
      .reduce<string | undefined>(
        (atual, valor) =>
          !atual || instante(valor) > instante(atual) ? valor : atual,
        undefined
      )

  return {
    protocolo,
    status: texto(chamados[0]?.status),
    dataAbertura: maisAntiga(aberturas),
    dataUltimaAtualizacao: maisRecente(atualizacoes),
    // A data de carga mais antiga: é a garantia de atualização de todos.
    loaded_at: maisAntiga(cargas),
    ordens_de_servico: chamados.map(chamado => ordemDe(chamado, modo)),
  }
}
