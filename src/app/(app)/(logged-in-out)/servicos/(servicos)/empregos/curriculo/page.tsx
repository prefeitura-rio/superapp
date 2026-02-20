import type { ModelsCitizen } from '@/http/models'
import { getDalCitizenCpf } from '@/lib/dal'
import { getUserInfoFromToken } from '@/lib/user-info'
import { CurriculoContent } from './curriculo-content'
import { getCurriculoFormacaoData } from './get-curriculo-formacao-data'
import { getFormacaoOptions } from './get-formacao-options'

export default async function CurriculoPage() {
  const [userAuthInfo, formacaoOptions] = await Promise.all([
    getUserInfoFromToken(),
    getFormacaoOptions(),
  ])

  let initialEscolaridade: string | undefined
  let initialFormacoes: Awaited<
    ReturnType<typeof getCurriculoFormacaoData>
  >['formacoes'] = []
  let initialIdiomas: Awaited<
    ReturnType<typeof getCurriculoFormacaoData>
  >['idiomas'] = []

  if (userAuthInfo.cpf) {
    try {
      const [citizenResponse, formacaoData] = await Promise.all([
        getDalCitizenCpf(userAuthInfo.cpf),
        getCurriculoFormacaoData(userAuthInfo.cpf),
      ])
      if (citizenResponse.status === 200 && citizenResponse.data) {
        const userInfo = citizenResponse.data as ModelsCitizen
        initialEscolaridade = userInfo.escolaridade?.trim() || undefined
      }
      initialFormacoes = formacaoData.formacoes
      initialIdiomas = formacaoData.idiomas
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
    />
  )
}
