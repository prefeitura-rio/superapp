export type RequestStatus =
  | 'Aberto'
  | 'Em andamento'
  | 'Concluído'
  | 'Cancelado'
export type RequestCategory = 'Serviços' | 'Ouvidoria' | 'Acesso à informação'

export interface RequestHistoryEntry {
  status: RequestStatus
  date: string
  time: string
  description: string
}

export interface Request {
  id: string
  title: string
  protocol: string
  category: RequestCategory
  subcategory: string
  organ: string
  origin: string
  date: string
  dateISO: string
  deadline: string
  deadlineISO: string
  address: string
  description: string
  status: RequestStatus
  history: RequestHistoryEntry[]
}
