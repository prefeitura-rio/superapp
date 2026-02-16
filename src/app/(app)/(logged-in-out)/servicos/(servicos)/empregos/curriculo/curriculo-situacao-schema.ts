import { z } from 'zod'
import {
  DISPONIBILIDADE_OPCOES,
  SITUACAO_ATUAL_OPCOES,
  TEMPO_PROCURANDO_EMPREGO_OPCOES,
  TIPO_VINCULO_OPCOES,
} from './constants'

export const curriculoSituacaoSchema = z.object({
  situacaoAtual: z
    .string()
    .min(1, 'Campo obrigatório')
    .refine(
      val =>
        SITUACAO_ATUAL_OPCOES.includes(
          val as (typeof SITUACAO_ATUAL_OPCOES)[number]
        ),
      { message: 'Selecione uma opção válida' }
    ),
  tempoProcurandoEmprego: z
    .string()
    .min(1, 'Campo obrigatório')
    .refine(
      val =>
        TEMPO_PROCURANDO_EMPREGO_OPCOES.includes(
          val as (typeof TEMPO_PROCURANDO_EMPREGO_OPCOES)[number]
        ),
      { message: 'Selecione uma opção válida' }
    ),
  disponibilidade: z
    .string()
    .optional()
    .refine(
      val =>
        !val ||
        DISPONIBILIDADE_OPCOES.includes(
          val as (typeof DISPONIBILIDADE_OPCOES)[number]
        ),
      { message: 'Selecione uma opção válida' }
    ),
  tipoVinculo: z
    .array(z.string())
    .optional()
    .refine(
      val =>
        !val ||
        val.every(v =>
          TIPO_VINCULO_OPCOES.includes(
            v as (typeof TIPO_VINCULO_OPCOES)[number]
          )
        ),
      { message: 'Selecione opções válidas' }
    ),
})

export type CurriculoSituacaoFormValues = z.infer<
  typeof curriculoSituacaoSchema
>
