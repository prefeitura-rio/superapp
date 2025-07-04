import type { ModelsMaintenanceRequest } from '@/http/models'

/**
 * Maps API status to display status with proper translation
 * @param status - Status from API
 * @returns Translated status for display
 */
export function getMaintenanceRequestDisplayStatus(status: string): string {
  switch (status) {
    case 'Aberto':
      return 'Aberto'
    case 'Concluido':
      return 'Concluído'
    case 'Não resolvido':
      return 'Não Resolvido'
    default:
      return status
  }
}

/**
 * Gets color class for status badge
 * @param status - Status from API
 * @returns CSS class for status color
 */
export function getMaintenanceRequestStatusColor(status: string): string {
  switch (status) {
    case 'Aberto':
      return 'bg-card-5'
    case 'Concluido':
      return 'bg-card-3'
    case 'Não resolvido':
      return 'bg-zinc-500'
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
  const aberto = requests.filter(req => req.status === 'Aberto').length
  const concluido = requests.filter(req => req.status === 'Concluido').length
  const naoResolvido = requests.filter(
    req => req.status === 'Não resolvido'
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
  if (status === 'Concluido') return 'Data fechamento'
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
  if (request.status === 'Não resolvido') return '-'
  if (request.status === 'Concluido' && request.data_fim) {
    return formatMaintenanceRequestDate(request.data_fim)
  }
  return formatMaintenanceRequestDate(request.data_alvo_finalizacao)
}
