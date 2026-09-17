import { z } from 'zod'

/**
 * O contrato declara `maxLength: 60` em `ImovelRequest.nome`, e a coluna do banco é
 * `NVARCHAR(60)` — este número **espelha o da API**, não é escolha nossa. Se ele mudar lá,
 * mude aqui: validar mais que a API aceita devolve 400 no lugar de uma mensagem de campo.
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
