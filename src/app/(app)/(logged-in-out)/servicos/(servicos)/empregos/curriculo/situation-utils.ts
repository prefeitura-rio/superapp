import type { SituacaoOptionItem } from './situacao-options-types'
import { UNEMPLOYED_STATUS_DESCRIPTIONS } from './constants'

/**
 * Checks if the selected employment status indicates unemployment
 * (either "Desempregado(a)" or "Buscando primeiro emprego")
 */
export function isUnemployedStatus(
  situationId: string | undefined,
  situations: SituacaoOptionItem[]
): boolean {
  if (!situationId) return false

  const selected = situations.find(s => s.id === situationId)
  if (!selected) return false

  return (UNEMPLOYED_STATUS_DESCRIPTIONS as readonly string[]).includes(
    selected.descricao
  )
}

/**
 * Determines if the "job search duration" field should be displayed.
 * Only shown when user selects an unemployed status.
 */
export function shouldShowJobSearchDuration(
  situationId: string | undefined,
  situations: SituacaoOptionItem[]
): boolean {
  return isUnemployedStatus(situationId, situations)
}
