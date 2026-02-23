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
    tempoExperienciaMeses: z
      .number({ invalid_type_error: 'Informe o tempo de experiência' })
      .min(1, 'Mínimo de 1 mês')
      .max(600, 'Máximo de 600 meses')
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

    if (
      data.tempoExperienciaMeses == null ||
      data.tempoExperienciaMeses < 1 ||
      data.tempoExperienciaMeses > 600
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tempoExperienciaMeses'],
        message: 'Informe o tempo de experiência (1 a 600 meses)',
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
