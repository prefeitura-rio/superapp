import type { ModelsMaintenanceRequest } from '@/http/models'

/**
 * Maps API status to display status with proper translation
 * @param status - Status from API
 * @returns Translated status for display
 */
export function getMaintenanceRequestDisplayStatus(status: string): string {
  // Return the status as is since we now have the complete list
  return status || '-'
}

/**
 * Checks if the status is one of the defined valid statuses
 * @param status - Status from API
 * @returns Boolean indicating if status should show a badge
 */
export function isValidMaintenanceRequestStatus(status: string): boolean {
  const validStatuses = [
    'cancelado',
    'em andamento privado',
    'aberto',
    'fechado de ofício - integração',
    'encaminhado à comlurb - resíduo',
    'fechado de ofício',
    'fechado com providências - público',
    'não constatado',
    'fechado com informação',
    'em andamento',
    'recusado',
    'fechado com solução',
    'sem possibilidade de atendimento',
    'fechado',
    'pendente',
    'fechado sem solução',
    'fechado com providências',
  ]

  return validStatuses.includes(status.toLowerCase())
}

/**
 * Gets text color class for status badge
 * @param status - Status from API
 * @returns CSS class for text color
 */
export function getMaintenanceRequestStatusTextColor(status: string): string {
  const foregroundTextStatuses = [
    'cancelado',
    'não constatado',
    'recusado',
    'sem possibilidade de atendimento',
    'fechado sem solução',
  ]

  return foregroundTextStatuses.includes(status.toLowerCase())
    ? 'text-foreground'
    : 'text-background'
}

/**
 * Gets color class for status badge
 * @param status - Status from API
 * @returns CSS class for status color
 */
export function getMaintenanceRequestStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'cancelado':
      return 'bg-secondary'
    case 'em andamento privado':
      return 'bg-card-5'
    case 'em andamento':
      return 'bg-card-5'
    case 'aberto':
      return 'bg-card-5'
    case 'fechado de ofício - integração':
      return 'bg-card-3'
    case 'encaminhado à comlurb - resíduo':
      return 'bg-card-5'
    case 'fechado de ofício':
      return 'bg-card-3'
    case 'fechado com providências - público':
      return 'bg-card-3'
    case 'não constatado':
      return 'bg-secondary'
    case 'fechado com informação':
      return 'bg-card-3'
    case 'recusado':
      return 'bg-secondary'
    case 'fechado com solução':
      return 'bg-card-3'
    case 'sem possibilidade de atendimento':
      return 'bg-secondary'
    case 'fechado':
      return 'bg-card-3'
    case 'pendente':
      return 'bg-card-5'
    case 'fechado sem solução':
      return 'bg-secondary'
    case 'fechado com providências':
      return 'bg-card-3'
    default:
      return 'bg-card'
  }
}

/**
 * Counts maintenance requests by status
 * @param requests - Array of maintenance requests
 * @returns Object with counts by status
 */
export function countMaintenanceRequestsByStatus(
  requests: ModelsMaintenanceRequest[]
) {
  const total = requests.length

  // Open statuses (using bg-card-5)
  const openStatuses = [
    'em andamento privado',
    'em andamento',
    'aberto',
    'encaminhado à comlurb - resíduo',
    'pendente',
  ]
  const aberto = requests.filter(req =>
    openStatuses.includes((req.status || '').toLowerCase())
  ).length

  // Closed/Resolved statuses (using bg-card-3)
  const closedStatuses = [
    'fechado de ofício - integração',
    'fechado de ofício',
    'fechado com providências - público',
    'fechado com informação',
    'fechado com solução',
    'fechado',
    'fechado com providências',
  ]
  const concluido = requests.filter(req =>
    closedStatuses.includes((req.status || '').toLowerCase())
  ).length

  // Rejected/Cancelled statuses (using bg-secondary)
  const rejectedStatuses = [
    'cancelado',
    'não constatado',
    'recusado',
    'sem possibilidade de atendimento',
    'fechado sem solução',
  ]
  const naoResolvido = requests.filter(req =>
    rejectedStatuses.includes((req.status || '').toLowerCase())
  ).length

  return {
    total,
    aberto,
    concluido,
    naoResolvido,
    fechados: concluido + naoResolvido,
  }
}

/**
 * Gets maintenance request statistics with safe fallback
 * @param maintenanceRequests - Array of maintenance requests or undefined
 * @returns Statistics object with counts
 */
export function getMaintenanceRequestStats(
  maintenanceRequests?: ModelsMaintenanceRequest[]
) {
  return maintenanceRequests
    ? countMaintenanceRequestsByStatus(maintenanceRequests)
    : { total: 0, aberto: 0, concluido: 0, naoResolvido: 0, fechados: 0 }
}

/**
 * Formats API date to Brazilian format
 * @param dateString - ISO date string from API
 * @returns Formatted date string
 */
export function formatMaintenanceRequestDate(dateString?: string): string {
  if (!dateString) return '-'

  try {
    return new Date(dateString).toLocaleDateString('pt-BR')
  } catch {
    return 'Data inválida'
  }
}

/**
 * Gets the appropriate date label based on status
 * @param status - Status from API
 * @returns Label for the date field
 */
export function getMaintenanceRequestDateLabel(status: string): string {
  // Closed/Resolved statuses (using bg-card-3)
  const closedStatuses = [
    'fechado de ofício - integração',
    'fechado de ofício',
    'fechado com providências - público',
    'fechado com informação',
    'fechado com solução',
    'fechado',
    'fechado com providências',
  ]

  if (closedStatuses.includes(status.toLowerCase())) return 'Data fechamento'
  return 'Prazo de fechamento'
}

/**
 * Gets the appropriate date value based on status
 * @param request - Maintenance request object
 * @returns Formatted date or fallback
 */
export function getMaintenanceRequestDateValue(
  request: ModelsMaintenanceRequest
): string {
  // Rejected/Cancelled statuses (using bg-secondary) - no date shown
  const rejectedStatuses = [
    'cancelado',
    'não constatado',
    'recusado',
    'sem possibilidade de atendimento',
    'fechado sem solução',
  ]

  if (rejectedStatuses.includes((request.status || '').toLowerCase()))
    return '-'

  // Closed/Resolved statuses (using bg-card-3) - show completion date
  const closedStatuses = [
    'fechado de ofício - integração',
    'fechado de ofício',
    'fechado com providências - público',
    'fechado com informação',
    'fechado com solução',
    'fechado',
    'fechado com providências',
  ]

  if (
    closedStatuses.includes((request.status || '').toLowerCase()) &&
    request.data_fim
  ) {
    return formatMaintenanceRequestDate(request.data_fim)
  }

  // Open statuses - show target completion date
  return formatMaintenanceRequestDate(request.data_alvo_finalizacao)
}

/**
 * Formats the maintenance requests count with proper singular/plural handling
 * @param count - Number of open maintenance requests
 * @returns Formatted string with proper singular/plural
 */
export function formatMaintenanceRequestsCount(count: number): string {
  if (count === 0) return 'Nenhum chamado em aberto'
  if (count === 1) return '1 chamado em aberto'
  return `${count} chamados em aberto`
}
