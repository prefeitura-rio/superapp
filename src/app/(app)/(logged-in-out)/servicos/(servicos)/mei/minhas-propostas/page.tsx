import { getMyProposals } from './get-my-proposals'
import { MinhasPropostasClient } from './minhas-propostas-client'

export default async function MinhasPropostasPage() {
  // TODO: Buscar CNPJ do usuário de outra API (não implementada ainda)
  const cnpj = '12345678000195' // Mock temporário

  const proposals = await getMyProposals(cnpj)

  return <MinhasPropostasClient proposals={proposals} />
}
