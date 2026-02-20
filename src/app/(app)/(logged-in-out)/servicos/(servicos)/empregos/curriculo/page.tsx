import type { ModelsCitizen } from '@/http/models'
import { getDalCitizenCpf } from '@/lib/dal'
import { getUserInfoFromToken } from '@/lib/user-info'
import { CurriculoContent } from './curriculo-content'
import { getCurriculoFormacaoData } from './get-curriculo-formacao-data'
import { getCurriculoSituacaoData } from './get-curriculo-situacao-data'
import { getFormacaoOptions } from './get-formacao-options'
import { getSituacaoOptions } from './get-situacao-options'

export default async function CurriculoPage() {
  const [userAuthInfo, formacaoOptions, situacaoOptions] = await Promise.all([
    getUserInfoFromToken(),
    getFormacaoOptions(),
    getSituacaoOptions(),
  ])

  let initialEscolaridade: string | undefined
  let initialFormacoes: Awaited<
    ReturnType<typeof getCurriculoFormacaoData>
  >['formacoes'] = []
  let initialIdiomas: Awaited<
    ReturnType<typeof getCurriculoFormacaoData>
  >['idiomas'] = []
  let initialSituacao: Awaited<ReturnType<typeof getCurriculoSituacaoData>> | null =
    null

  if (userAuthInfo.cpf) {
    try {
      const [citizenResponse, formacaoData, situacaoData] = await Promise.all([
        getDalCitizenCpf(userAuthInfo.cpf),
        getCurriculoFormacaoData(userAuthInfo.cpf),
        getCurriculoSituacaoData(userAuthInfo.cpf),
      ])
      if (citizenResponse.status === 200 && citizenResponse.data) {
        const userInfo = citizenResponse.data as ModelsCitizen
        initialEscolaridade = userInfo.escolaridade?.trim() || undefined
      }
      initialFormacoes = formacaoData.formacoes
      initialIdiomas = formacaoData.idiomas
      initialSituacao = situacaoData
    } catch {
      // mantém vazio em caso de erro
    }
  }

  return (
    <CurriculoContent
      cpf={userAuthInfo.cpf || undefined}
      formacaoOptions={formacaoOptions}
      initialEscolaridade={initialEscolaridade}
      initialFormacoes={initialFormacoes}
      initialIdiomas={initialIdiomas}
      situacaoOptions={situacaoOptions}
      initialSituacao={initialSituacao ?? undefined}
    />
  )
}
