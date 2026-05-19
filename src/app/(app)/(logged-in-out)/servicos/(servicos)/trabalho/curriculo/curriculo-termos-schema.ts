import { z } from 'zod'

export const curriculoTermosSchema = z.object({
  termosAceitos: z.boolean().refine(val => val === true, {
    message: 'Você deve aceitar os termos para continuar',
  }),
})

export type CurriculoTermosFormValues = z.infer<typeof curriculoTermosSchema>
