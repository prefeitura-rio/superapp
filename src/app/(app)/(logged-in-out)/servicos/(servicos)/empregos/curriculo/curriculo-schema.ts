import type { z } from 'zod'
import { curriculoExperienciaSchema } from './curriculo-experiencia-schema'
import { curriculoFormacaoSchema } from './curriculo-formacao-schema'
import { curriculoSituacaoSchema } from './curriculo-situacao-schema'
import { curriculoTermosSchema } from './curriculo-termos-schema'

export const curriculoSchema = curriculoFormacaoSchema
  .merge(curriculoExperienciaSchema)
  .merge(curriculoSituacaoSchema)
  .merge(curriculoTermosSchema)

export type CurriculoFormValues = z.infer<typeof curriculoSchema>
