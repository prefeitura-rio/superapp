import type { ModelsCitizen } from '@/http/models'
import { getDalCitizenCpf } from '@/lib/dal'
import { getUserInfoFromToken } from '@/lib/user-info'
import { CurriculoContent } from './curriculo-content'
import { getCurriculoExperienciaData } from './get-curriculo-experiencia-data'
import { getCurriculoFormacaoData } from './get-curriculo-formacao-data'
import { getCurriculoSituacaoData } from './get-curriculo-situacao-data'
import { getCurriculoTermosAceitos } from './get-curriculo-termos-data'
import { getExperienciaOptions } from './get-experiencia-options'
import { getFormacaoOptions } from './get-formacao-options'
import { getSituacaoOptions } from './get-situacao-options'

export default async function CurriculoPage() {
  const [userAuthInfo, formacaoOptions, situacaoOptions, experienciaOptions] =
    await Promise.all([
      getUserInfoFromToken(),
      getFormacaoOptions(),
      getSituacaoOptions(),
      getExperienciaOptions(),
    ])

  let initialEscolaridade: string | undefined
  let initialFormacoes: Awaited<
    ReturnType<typeof getCurriculoFormacaoData>
  >['formacoes'] = []
  let initialIdiomas: Awaited<
    ReturnType<typeof getCurriculoFormacaoData>
  >['idiomas'] = []
  let initialSituacao: Awaited<
    ReturnType<typeof getCurriculoSituacaoData>
  > | null = null
  let initialExperiencia: Awaited<
    ReturnType<typeof getCurriculoExperienciaData>
  > | null = null
  let initialTermosAceitos = false

  if (userAuthInfo.cpf) {
    try {
      const [
        citizenResponse,
        formacaoData,
        situacaoData,
        experienciaData,
        termosAceitos,
      ] = await Promise.all([
        getDalCitizenCpf(userAuthInfo.cpf),
        getCurriculoFormacaoData(userAuthInfo.cpf),
        getCurriculoSituacaoData(userAuthInfo.cpf),
        getCurriculoExperienciaData(userAuthInfo.cpf),
        getCurriculoTermosAceitos(userAuthInfo.cpf),
      ])
      if (citizenResponse.status === 200 && citizenResponse.data) {
        const userInfo = citizenResponse.data as ModelsCitizen
        initialEscolaridade = userInfo.escolaridade?.trim() || undefined
      }
      initialFormacoes = formacaoData.formacoes
      initialIdiomas = formacaoData.idiomas
      initialSituacao = situacaoData
      initialExperiencia = experienciaData
      initialTermosAceitos = termosAceitos
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
      experienciaOptions={experienciaOptions}
      initialExperiencia={initialExperiencia ?? undefined}
      initialTermosAceitos={initialTermosAceitos}
    />
  )
}
