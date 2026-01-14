import { getUserLegalEntity } from '@/lib/mei-utils.server'
import { getUserInfoFromToken } from '@/lib/user-info'
import { getMyProposals } from './get-my-proposals'
import { MinhasPropostasClient } from './minhas-propostas-client'

export default async function MinhasPropostasPage() {
  const userInfo = await getUserInfoFromToken()

  if (!userInfo.cpf) {
    return <MinhasPropostasClient proposals={[]} hasMei={false} />
  }

  const result = await getUserLegalEntity(userInfo.cpf)
  if (!result) {
    return <MinhasPropostasClient proposals={[]} hasMei={false} />
  }

  const proposals = await getMyProposals(result.cnpj)

  return <MinhasPropostasClient proposals={proposals} hasMei={true} />
}
