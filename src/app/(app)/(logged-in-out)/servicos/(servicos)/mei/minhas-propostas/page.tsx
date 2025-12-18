import { getMyProposals } from './get-my-proposals'
import { MinhasPropostasClient } from './minhas-propostas-client'

export default async function MinhasPropostasPage() {
  const proposals = await getMyProposals()

  return <MinhasPropostasClient proposals={proposals} />
}
