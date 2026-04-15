import { z } from 'zod'
import { SIM_NAO_OPCOES } from './constants'

const empregoItemSchema = z
  .object({
    cargo: z
      .string()
      .optional()
      .refine(val => !val || val.length >= 5, 'Mínimo de 5 caracteres')
      .refine(val => !val || val.length <= 50, 'Máximo de 50 caracteres'),
    meuEmpregoAtual: z.boolean().optional(),
    empresa: z
      .string()
      .optional()
      .refine(val => !val || val.length >= 5, 'Mínimo de 5 caracteres')
      .refine(val => !val || val.length <= 50, 'Máximo de 50 caracteres'),
    descricaoAtividades: z
      .string()
      .optional()
      .refine(val => !val || val.length >= 30, 'Mínimo de 30 caracteres')
      .refine(val => !val || val.length <= 300, 'Máximo de 300 caracteres'),
    tempoExperienciaAnos: z
      .number({ invalid_type_error: 'Informe os anos' })
      .min(0, 'Não pode ser negativo')
      .max(50, 'Máximo de 50 anos')
      .optional()
      .nullable(),
    tempoExperienciaMeses: z
      .number({ invalid_type_error: 'Informe os meses' })
      .min(0, 'Não pode ser negativo')
      .max(11, 'Máximo de 11 meses')
      .optional()
      .nullable(),
    experienciaComprovadaCarteira: z
      .string()
      .optional()
      .refine(
        val =>
          !val ||
          SIM_NAO_OPCOES.includes(val as (typeof SIM_NAO_OPCOES)[number]),
        { message: 'Selecione uma opção válida' }
      ),
  })
  .superRefine((data, ctx) => {
    const hasAny =
      (data.cargo?.trim()?.length ?? 0) > 0 ||
      (data.empresa?.trim()?.length ?? 0) > 0 ||
      (data.descricaoAtividades?.trim()?.length ?? 0) > 0 ||
      (data.tempoExperienciaAnos != null && data.tempoExperienciaAnos > 0) ||
      (data.tempoExperienciaMeses != null && data.tempoExperienciaMeses > 0) ||
      (data.experienciaComprovadaCarteira?.length ?? 0) > 0

    if (!hasAny) return

    const cargoLength = data.cargo?.trim()?.length ?? 0
    if (cargoLength === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cargo'],
        message: 'Preencha o cargo',
      })
    }

    const empresaLength = data.empresa?.trim()?.length ?? 0
    if (empresaLength === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['empresa'],
        message: 'Preencha a empresa',
      })
    }

    const descricaoAtividadesLength =
      data.descricaoAtividades?.trim()?.length ?? 0
    if (descricaoAtividadesLength === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['descricaoAtividades'],
        message: 'Preencha a descrição das atividades',
      })
    }

    const totalMonths =
      (data.tempoExperienciaAnos ?? 0) * 12 + (data.tempoExperienciaMeses ?? 0)

    if (totalMonths < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tempoExperienciaMeses'],
        message: 'Informe pelo menos 1 mês de experiência',
      })
    } else if (totalMonths > 600) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tempoExperienciaAnos'],
        message: 'Experiência não pode ultrapassar 50 anos (600 meses)',
      })
    }

    if (!data.experienciaComprovadaCarteira) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['experienciaComprovadaCarteira'],
        message: 'Selecione se a experiência está comprovada em carteira',
      })
    }
  })

const conquistaItemSchema = z
  .object({
    idTipoConquista: z.string().optional(),
    titulo: z
      .string()
      .optional()
      .refine(val => !val || val.length >= 5, 'Mínimo de 5 caracteres')
      .refine(val => !val || val.length <= 50, 'Máximo de 50 caracteres'),
    descricao: z
      .string()
      .optional()
      .refine(val => !val || val.length >= 30, 'Mínimo de 30 caracteres')
      .refine(val => !val || val.length <= 300, 'Máximo de 300 caracteres'),
  })
  .superRefine((data, ctx) => {
    const hasAny =
      (data.idTipoConquista?.trim()?.length ?? 0) > 0 ||
      (data.titulo?.trim()?.length ?? 0) > 0 ||
      (data.descricao?.trim()?.length ?? 0) > 0

    if (!hasAny) return

    if (!data.idTipoConquista?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['idTipoConquista'],
        message: 'Selecione o tipo de conquista ou certificado',
      })
    }

    const tituloLength = data.titulo?.trim()?.length ?? 0
    if (tituloLength === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['titulo'],
        message: 'Preencha o título',
      })
    }

    const descricaoLength = data.descricao?.trim()?.length ?? 0
    if (descricaoLength === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['descricao'],
        message: 'Preencha a descrição',
      })
    }
  })

export const curriculoExperienciaSchema = z.object({
  empregos: z.array(empregoItemSchema),
  conquistas: z.array(conquistaItemSchema),
})

export type CurriculoExperienciaFormValues = z.infer<
  typeof curriculoExperienciaSchema
>
export type EmpregoItem = z.infer<typeof empregoItemSchema>
export type ConquistaItem = z.infer<typeof conquistaItemSchema>
