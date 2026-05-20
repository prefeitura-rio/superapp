import type {
  ConquistaItem,
  EmpregoItem,
} from '../curriculo-experiencia-schema'
import type {
  FormacaoAcademicaItem,
  IdiomaItem,
} from '../curriculo-formacao-schema'

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
 * Checks if a formacao academica item has the minimum required field filled.
 * Only tipoFormacaoId is required; the remaining fields are optional.
 */
export const isFormacaoAcademicaComplete = (
  item: FormacaoAcademicaItem
): boolean => hasContent(item.tipoFormacaoId)

/**
 * Checks if a formacao academica item is completely empty (no fields filled).
 */
export const isFormacaoAcademicaEmpty = (
  item: FormacaoAcademicaItem
): boolean =>
  !hasContent(item.tipoFormacaoId) &&
  !hasContent(item.nomeInstituicao) &&
  !hasContent(item.nomeCurso) &&
  !hasContent(item.status) &&
  !hasContent(item.anoConclusao)

// ============================================================================
// Trabalho Validators
// ============================================================================

/**
 * Checks if an emprego item has all required fields filled.
 */
export const isEmpregoComplete = (item: EmpregoItem): boolean =>
  hasContent(item.cargo) &&
  hasContent(item.empresa) &&
  hasContent(item.descricaoAtividades) &&
  (item.tempoExperienciaAnos ?? 0) * 12 + (item.tempoExperienciaMeses ?? 0) >=
    1 &&
  (item.experienciaComprovadaCarteira === 'Sim' ||
    item.experienciaComprovadaCarteira === 'Não')

/**
 * Checks if an emprego item is completely empty (no fields filled).
 */
export const isEmpregoEmpty = (item: EmpregoItem): boolean =>
  !hasContent(item.cargo) &&
  !hasContent(item.empresa) &&
  !hasContent(item.descricaoAtividades) &&
  (item.tempoExperienciaAnos == null || item.tempoExperienciaAnos === 0) &&
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
