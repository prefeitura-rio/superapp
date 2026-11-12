import {
  isInscricaoImobiliariaValida,
  somenteDigitos,
} from '@/lib/divida-ativa-utils'
import { z } from 'zod'

/**
 * O front valida **apenas formato**. Existência da inscrição, vínculo com o cidadão e dígito
 * verificador são regra de negócio e ficam na API (regra de ouro 9 do plano do módulo).
 */
export const inscricaoImobiliariaSchema = z.object({
  inscricao: z
    .string()
    .refine(valor => somenteDigitos(valor).length > 0, {
      message: 'Digite a inscrição imobiliária.',
    })
    .refine(valor => isInscricaoImobiliariaValida(valor), {
      message: 'A inscrição imobiliária tem 7 ou 8 números.',
    }),
})

export type InscricaoImobiliariaSchema = z.infer<
  typeof inscricaoImobiliariaSchema
>
