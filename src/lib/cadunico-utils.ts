import type { ModelsCadUnico } from '@/http/models'

/**
 * Determines CadUnico status based on the status_cadastral field
 * @param cadunico - CadUnico data from API
 * @returns Status string for display
 */
export function getCadUnicoStatus(cadunico?: ModelsCadUnico): string {
  if (!cadunico) return 'Atualizar'

  switch (cadunico.status_cadastral) {
    case 'Cadastrado':
      return 'Atualizado'
    case 'Em andamento':
      return 'Em andamento'
    default:
      return 'Atualizar'
  }
}

/**
 * Formats a date string to Brazilian format (DD/MM/YYYY)
 * @param dateString - ISO date string from API
 * @returns Formatted date string or fallback message
 */
export function formatRecadastramentoDate(dateString?: string): string {
  if (!dateString) return 'Não informado'

  try {
    return new Date(dateString).toLocaleDateString('pt-BR')
  } catch {
    return 'Data inválida'
  }
}
