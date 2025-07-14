import type { HealthUnitInfo, HealthUnitRisk } from '@/lib/health-unit'

/**
 * Format the operating hours for the current day only
 */
export function formatOperatingHours(
  funcionamento_dia_util: { inicio: number; fim: number },
  funcionamento_sabado?: { inicio: number; fim: number } | null
): string {
  const formatHour = (hour: number): string => {
    return `${hour}h`
  }

  const now = new Date()
  const currentDay = now.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // Check if it's a weekday (Monday to Friday)
  if (currentDay >= 1 && currentDay <= 5) {
    return `${formatHour(funcionamento_dia_util.inicio)} às ${formatHour(funcionamento_dia_util.fim)}`
  }

  // Check if it's Saturday and Saturday hours are available
  if (currentDay === 6 && funcionamento_sabado) {
    return `${formatHour(funcionamento_sabado.inicio)} às ${formatHour(funcionamento_sabado.fim)}`
  }

  // Sunday or Saturday without hours
  return 'Fechado hoje'
}

/**
 * Format the address into a single string
 */
export function formatAddress(healthUnit: HealthUnitInfo): string {
  const parts = [
    healthUnit.logradouro,
    healthUnit.numero,
    healthUnit.complemento,
    healthUnit.cep ? `CEP: ${healthUnit.cep}` : null,
  ].filter(Boolean)

  return parts.length > 0 ? parts.join(', ') : 'Endereço não disponível'
}

/**
 * Get the current operating status based on the current time and operating hours
 */
export function getCurrentOperatingStatus(
  funcionamento_dia_util: { inicio: number; fim: number },
  funcionamento_sabado?: { inicio: number; fim: number } | null
): string {
  const now = new Date()
  const currentHour = now.getHours()
  const currentDay = now.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // Check if it's a weekday (Monday to Friday)
  if (currentDay >= 1 && currentDay <= 5) {
    if (
      currentHour >= funcionamento_dia_util.inicio &&
      currentHour < funcionamento_dia_util.fim
    ) {
      return 'Aberto'
    }
  }

  // Check if it's Saturday and Saturday hours are available
  if (currentDay === 6 && funcionamento_sabado) {
    if (
      currentHour >= funcionamento_sabado.inicio &&
      currentHour < funcionamento_sabado.fim
    ) {
      return 'Aberto'
    }
  }

  return 'Fechado'
}

/**
 * Get the risk status from the health unit risk data
 */
export function getHealthUnitRiskStatus(riskData: HealthUnitRisk): {
  risco: string
  status: string
} {
  // Prefer active notification over last notification
  const notification = riskData.notificacao_ativa || riskData.ultima_notificacao

  if (!notification) {
    return {
      risco: 'Verde',
      status: 'Não informado',
    }
  }

  return {
    risco: notification.risco,
    status: notification.status,
  }
}

/**
 * Get the primary phone number (prefer landline over mobile)
 */
export function getPrimaryPhone(healthUnit: HealthUnitInfo): string | null {
  return healthUnit.telefone || healthUnit.celular || null
}

/**
 * Get the WhatsApp number (prefer mobile over landline)
 */
export function getWhatsAppPhone(healthUnit: HealthUnitInfo): string | null {
  return healthUnit.celular || healthUnit.telefone || null
}

/**
 * Map risk level to color class
 */
export function mapRiskToColor(risco: string): string {
  const riskColorMap: Record<string, string> = {
    Verde: 'verde',
    Amarelo: 'amarelo',
    Laranja: 'laranja',
    Vermelho: 'vermelho',
  }

  return riskColorMap[risco] || 'verde'
}
