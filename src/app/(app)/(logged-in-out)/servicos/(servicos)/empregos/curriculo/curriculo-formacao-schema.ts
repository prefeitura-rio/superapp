import { z } from 'zod'
import {
  ANO_CONCLUSAO_FORMACAO_OPCOES,
  STATUS_FORMACAO_OPCOES,
} from './constants'
import { findDuplicateLanguageIds } from './utils/language-duplicate-detection'

const formacaoAcademicaItemSchema = z
  .object({
    tipoFormacaoId: z.string().optional(),
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
  idIdioma: z.string().optional(),
  idNivel: z.string().optional(),
})

export const curriculoFormacaoSchema = z.object({
  /** Escolaridade vem de Informações Pessoais (fonte única); obrigatória para prosseguir. */
  escolaridade: z.string().min(1, 'Escolaridade é obrigatória'),
  formacaoAcademica: z.array(formacaoAcademicaItemSchema),
  idiomas: z.array(idiomaItemSchema).superRefine((arr, ctx) => {
    // Check for duplicate languages FIRST
    const duplicateIds = findDuplicateLanguageIds(arr)

    // Track which duplicates we've already flagged to show error on first occurrence
    const flaggedDuplicates = new Set<string>()

    arr.forEach((item, index) => {
      const hasIdioma = (item.idIdioma?.trim()?.length ?? 0) > 0
      const hasNivel = (item.idNivel?.trim()?.length ?? 0) > 0
      const isComplete = hasIdioma && hasNivel

      // Check if this language is a duplicate
      if (hasIdioma && duplicateIds.has(item.idIdioma!.trim())) {
        if (!flaggedDuplicates.has(item.idIdioma!.trim())) {
          flaggedDuplicates.add(item.idIdioma!.trim())
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [index, 'idIdioma'],
            message:
              'Este idioma já foi adicionado. Por favor, remova ou selecione outro.',
          })
        }
      }

      // Existing validation for completeness
      if (!isComplete) {
        if (!hasIdioma) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [index, 'idIdioma'],
            message: 'Selecione o idioma',
          })
        }
        if (!hasNivel) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [index, 'idNivel'],
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
