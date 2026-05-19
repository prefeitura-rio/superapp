import { z } from 'zod'
import {
  TEMPO_PROCURANDO_EMPREGO_CODES,
  UNEMPLOYED_STATUS_DESCRIPTIONS,
} from './constants'

/**
 * Base schema for the "Situação Atual" (current employment status) form section.
 * This schema is used for merging with other schemas in curriculo-schema.ts.
 */
export const curriculoSituacaoBaseSchema = z.object({
  /** UUID of the current employment status (from emp_situacoes_atual). */
  idSituacao: z.string().min(1, 'Campo obrigatório'),
  /**
   * Stable code sent to API: UP_TO_6, FROM_7_TO_12, FROM_13_TO_24, OVER_24.
   * Optional at schema level; conditionally required via superRefine.
   */
  tempoProcurandoEmprego: z.string().optional(),
  /** UUID of availability (optional). */
  idDisponibilidade: z.string().optional(),
  /** UUIDs of preferred contract types (optional, multiple choice). */
  idsTiposVinculo: z.array(z.string()).optional(),
  /**
   * Description of the selected situation (used for conditional validation).
   * This is set automatically when idSituacao changes.
   */
  situacaoDescricao: z.string().optional(),
})

/**
 * Schema with conditional validation for tempoProcurandoEmprego.
 * The field is required only when the user selects an unemployed status.
 *
 * Note: This schema uses superRefine and returns ZodEffects, so it cannot be
 * merged with other schemas. Use curriculoSituacaoBaseSchema for merging.
 */
export const curriculoSituacaoSchema = curriculoSituacaoBaseSchema.superRefine(
  (data, ctx) => {
    const isUnemployed = (
      UNEMPLOYED_STATUS_DESCRIPTIONS as readonly string[]
    ).includes(data.situacaoDescricao ?? '')

    if (isUnemployed) {
      const value = data.tempoProcurandoEmprego?.trim() ?? ''

      if (!value) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Campo obrigatório',
          path: ['tempoProcurandoEmprego'],
        })
        return
      }

      if (
        !(TEMPO_PROCURANDO_EMPREGO_CODES as readonly string[]).includes(value)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Selecione uma opção válida',
          path: ['tempoProcurandoEmprego'],
        })
      }
    }
  }
)

export type CurriculoSituacaoFormValues = z.infer<
  typeof curriculoSituacaoBaseSchema
>
