import type {
  FormacaoAcademicaItem,
  IdiomaItem,
} from '../curriculo-formacao-schema'
import type {
  ConquistaItem,
  EmpregoItem,
} from '../curriculo-experiencia-schema'

/**
 * Helper to check if a string value has content (non-empty after trimming).
 */
const hasContent = (val: string | undefined | null): boolean =>
  (val?.trim()?.length ?? 0) > 0

// ============================================================================
// Idioma Validators
// ============================================================================

/**
 * Checks if an idioma item has all required fields filled.
 */
export const isIdiomaComplete = (item: IdiomaItem): boolean =>
  hasContent(item.idIdioma) && hasContent(item.idNivel)

/**
 * Checks if an idioma item is completely empty (no fields filled).
 */
export const isIdiomaEmpty = (item: IdiomaItem): boolean =>
  !hasContent(item.idIdioma) && !hasContent(item.idNivel)

// ============================================================================
// Formacao Academica Validators
// ============================================================================

/**
 * Checks if a formacao academica item has all required fields filled.
 * Required: tipoFormacaoId, nomeCurso, status, anoConclusao
 * Optional: nomeInstituicao
 */
export const isFormacaoAcademicaComplete = (
  item: FormacaoAcademicaItem
): boolean =>
  hasContent(item.tipoFormacaoId) &&
  hasContent(item.nomeCurso) &&
  hasContent(item.status) &&
  hasContent(item.anoConclusao)

/**
 * Checks if a formacao academica item is completely empty (no fields filled).
 */
export const isFormacaoAcademicaEmpty = (item: FormacaoAcademicaItem): boolean =>
  !hasContent(item.tipoFormacaoId) &&
  !hasContent(item.nomeInstituicao) &&
  !hasContent(item.nomeCurso) &&
  !hasContent(item.status) &&
  !hasContent(item.anoConclusao)

// ============================================================================
// Emprego Validators
// ============================================================================

/**
 * Checks if an emprego item has all required fields filled.
 */
export const isEmpregoComplete = (item: EmpregoItem): boolean =>
  hasContent(item.cargo) &&
  hasContent(item.empresa) &&
  hasContent(item.descricaoAtividades) &&
  item.tempoExperienciaMeses != null &&
  item.tempoExperienciaMeses >= 1 &&
  (item.experienciaComprovadaCarteira === 'Sim' ||
    item.experienciaComprovadaCarteira === 'Não')

/**
 * Checks if an emprego item is completely empty (no fields filled).
 */
export const isEmpregoEmpty = (item: EmpregoItem): boolean =>
  !hasContent(item.cargo) &&
  !hasContent(item.empresa) &&
  !hasContent(item.descricaoAtividades) &&
  (item.tempoExperienciaMeses == null || item.tempoExperienciaMeses === 0) &&
  !hasContent(item.experienciaComprovadaCarteira)

// ============================================================================
// Conquista Validators
// ============================================================================

/**
 * Checks if a conquista item has all required fields filled.
 */
export const isConquistaComplete = (item: ConquistaItem): boolean =>
  hasContent(item.idTipoConquista) &&
  hasContent(item.titulo) &&
  hasContent(item.descricao)

/**
 * Checks if a conquista item is completely empty (no fields filled).
 */
export const isConquistaEmpty = (item: ConquistaItem): boolean =>
  !hasContent(item.idTipoConquista) &&
  !hasContent(item.titulo) &&
  !hasContent(item.descricao)
