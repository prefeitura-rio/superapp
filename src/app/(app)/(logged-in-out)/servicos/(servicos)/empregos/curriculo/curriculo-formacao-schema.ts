import { z } from 'zod'
import {
  ANO_CONCLUSAO_FORMACAO_OPCOES,
  IDIOMAS_OPCOES,
  NIVEL_IDIOMA_OPCOES,
  STATUS_FORMACAO_OPCOES,
  TIPO_FORMACAO_OPCOES,
} from './constants'

const formacaoAcademicaItemSchema = z
  .object({
    tipoFormacao: z
      .string()
      .optional()
      .refine(
        val =>
          !val ||
          TIPO_FORMACAO_OPCOES.includes(
            val as (typeof TIPO_FORMACAO_OPCOES)[number]
          ),
        { message: 'Selecione uma opção válida' }
      ),
    nomeInstituicao: z.string().max(50, 'Máximo de 50 caracteres').optional(),
    nomeCurso: z.string().max(50, 'Máximo de 50 caracteres').optional(),
    status: z
      .string()
      .optional()
      .refine(
        val =>
          !val ||
          STATUS_FORMACAO_OPCOES.includes(
            val as (typeof STATUS_FORMACAO_OPCOES)[number]
          ),
        { message: 'Selecione uma opção válida' }
      ),
    anoConclusao: z
      .string()
      .optional()
      .refine(val => !val || ANO_CONCLUSAO_FORMACAO_OPCOES.includes(val), {
        message: 'Selecione um ano válido',
      }),
  })
  .superRefine((data, ctx) => {
    // Apenas validação de formato quando o usuário preenche (mín. 3 caracteres)
    const nomeInstituicaoLength = data.nomeInstituicao?.trim()?.length ?? 0
    if (nomeInstituicaoLength > 0 && nomeInstituicaoLength < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['nomeInstituicao'],
        message: 'Mínimo de 3 caracteres',
      })
    }

    const nomeCursoLength = data.nomeCurso?.trim()?.length ?? 0
    if (nomeCursoLength > 0 && nomeCursoLength < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['nomeCurso'],
        message: 'Mínimo de 3 caracteres',
      })
    }
  })

const idiomaItemSchema = z.object({
  idioma: z
    .string()
    .optional()
    .refine(
      val =>
        !val || IDIOMAS_OPCOES.includes(val as (typeof IDIOMAS_OPCOES)[number]),
      { message: 'Selecione um idioma válido' }
    ),
  nivel: z
    .string()
    .optional()
    .refine(
      val =>
        !val ||
        NIVEL_IDIOMA_OPCOES.includes(
          val as (typeof NIVEL_IDIOMA_OPCOES)[number]
        ),
      { message: 'Selecione um nível válido' }
    ),
})

export const curriculoFormacaoSchema = z.object({
  /** Escolaridade vem de Informações Pessoais (fonte única); obrigatória para prosseguir. */
  escolaridade: z.string().min(1, 'Escolaridade é obrigatória'),
  formacaoAcademica: z.array(formacaoAcademicaItemSchema),
  idiomas: z.array(idiomaItemSchema).superRefine((arr, ctx) => {
    arr.forEach((item, index) => {
      const hasIdioma = (item.idioma?.trim()?.length ?? 0) > 0
      const hasNivel = (item.nivel?.trim()?.length ?? 0) > 0
      const isComplete = hasIdioma && hasNivel

      if (!isComplete) {
        if (!hasIdioma) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [index, 'idioma'],
            message: 'Selecione o idioma',
          })
        }
        if (!hasNivel) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [index, 'nivel'],
            message: 'Selecione o nível',
          })
        }
      }
    })
  }),
})

export type CurriculoFormacaoFormValues = z.infer<
  typeof curriculoFormacaoSchema
>
export type FormacaoAcademicaItem = z.infer<typeof formacaoAcademicaItemSchema>
export type IdiomaItem = z.infer<typeof idiomaItemSchema>
