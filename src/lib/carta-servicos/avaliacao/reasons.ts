import { RejectionReason } from '@/http-pref-rio-carta-votacao/models/rejectionReason'

export const DESCRIPTION_MAX_LENGTH = 500

/** Chips do formulário de dislike, na ordem do design. */
export const REJECTION_REASON_OPTIONS = [
  {
    value: RejectionReason.Informacao_desatualizada,
    label: 'Informação desatualizada',
  },
  {
    value: RejectionReason.Informacao_incompleta,
    label: 'Informação incompleta',
  },
  { value: RejectionReason.Dificil_de_entender, label: 'Difícil de entender' },
  {
    value: RejectionReason.Nao_encontrei_o_que_precisava,
    label: 'Não encontrei o que precisava',
  },
  {
    value: RejectionReason.Informacao_incorreta,
    label: 'Informação incorreta',
  },
  { value: RejectionReason.Outro_motivo, label: 'Outro motivo' },
] as const satisfies ReadonlyArray<{ value: RejectionReason; label: string }>

export const OTHER_REASON = RejectionReason.Outro_motivo

export { RejectionReason }
