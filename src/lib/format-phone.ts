import type { UserInfoComplete } from '../app/(app)/(logged-in-out)/servicos/(servicos)/cursos/confirmar-informacoes/types'

export const formatPhone = (
  ddi: string | undefined,
  ddd: string | undefined,
  valor: string | undefined
) => {
  if (!valor) return ''
  return `(${ddd}) ${valor}`
}

export const formatUserPhone = (
  telefone: UserInfoComplete['telefone']
): string => {
  if (!telefone?.principal) return 'Informação indisponível'

  const { ddi, ddd, valor } = telefone.principal

  if (ddi && ddd && valor) {
    return formatPhone(ddi, ddd, valor)
  }

  return 'Faltando informação'
}
