import { z } from 'zod'

/**
 * Limite adotado pelo front enquanto o contrato não define o campo (premissa P23 em
 * `docs/divida-ativa.md`): generoso para "Casa de praia da vovó" e curto o bastante para a
 * lista. Ajustar quando a API declarar o tamanho real da coluna.
 */
export const NOME_IMOVEL_TAMANHO_MAXIMO = 60

/**
 * O nome é opcional: ele só facilita a leitura da lista, então quem quiser pular o passo
 * segue com o campo vazio. A validação aqui é de formato — nenhuma regra de negócio.
 */
export const nomeImovelSchema = z.object({
  nome: z
    .string()
    .trim()
    .max(NOME_IMOVEL_TAMANHO_MAXIMO, {
      message: `O nome pode ter no máximo ${NOME_IMOVEL_TAMANHO_MAXIMO} caracteres.`,
    }),
})

export type NomeImovelSchema = z.infer<typeof nomeImovelSchema>
