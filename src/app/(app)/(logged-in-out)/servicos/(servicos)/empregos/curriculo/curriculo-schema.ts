import { z } from 'zod'
import {
  TEMPO_PROCURANDO_EMPREGO_CODES,
  UNEMPLOYED_STATUS_DESCRIPTIONS,
} from './constants'
import { curriculoExperienciaSchema } from './curriculo-experiencia-schema'
import { curriculoFormacaoSchema } from './curriculo-formacao-schema'
import { curriculoSituacaoBaseSchema } from './curriculo-situacao-schema'
import { curriculoTermosSchema } from './curriculo-termos-schema'

/**
 * Merged base schema without conditional refinements.
 */
const curriculoBaseSchema = curriculoFormacaoSchema
  .merge(curriculoExperienciaSchema)
  .merge(curriculoSituacaoBaseSchema)
  .merge(curriculoTermosSchema)

/**
 * Full curriculo schema with conditional validation for tempoProcurandoEmprego.
 * The job search duration field is required only when the user selects
 * an unemployed status (Desempregado(a) or Buscando primeiro emprego).
 */
export const curriculoSchema = curriculoBaseSchema.superRefine((data, ctx) => {
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
})

export type CurriculoFormValues = z.infer<typeof curriculoBaseSchema>
