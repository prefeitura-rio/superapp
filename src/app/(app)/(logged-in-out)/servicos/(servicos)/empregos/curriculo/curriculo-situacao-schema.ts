import { z } from 'zod'
import { TEMPO_PROCURANDO_EMPREGO_CODES } from './constants'

export const curriculoSituacaoSchema = z.object({
  /** UUID da situação atual (Encontra-se). */
  idSituacao: z.string().min(1, 'Campo obrigatório'),
  /** Código estável enviado à API: UP_TO_6, FROM_7_TO_12, FROM_13_TO_24, OVER_24. */
  tempoProcurandoEmprego: z
    .string()
    .min(1, 'Campo obrigatório')
    .refine(
      (val) =>
        (TEMPO_PROCURANDO_EMPREGO_CODES as readonly string[]).includes(val),
      { message: 'Selecione uma opção válida' }
    ),
  /** UUID da disponibilidade (opcional). */
  idDisponibilidade: z.string().optional(),
  /** UUIDs dos tipos de vínculo desejados (opcional, múltipla escolha). */
  idsTiposVinculo: z.array(z.string()).optional(),
})

export type CurriculoSituacaoFormValues = z.infer<
  typeof curriculoSituacaoSchema
>
