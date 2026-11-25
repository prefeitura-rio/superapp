export type RequestStatus =
  | 'Aberto'
  | 'Em andamento'
  | 'Concluído'
  | 'Cancelado'

export interface RequestItem {
  /** Vazio quando o chamado não tem protocolo consultável (card sem link). */
  protocolo: string
  codigoOs: string
  servico: string
  categoria: string
  status: RequestStatus
  dataAbertura: string
  isAcessoInformacao: boolean
}
