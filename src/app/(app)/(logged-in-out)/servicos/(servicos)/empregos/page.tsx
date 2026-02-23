import { EmpregosHeaderClient } from '@/app/components/empregos/empregos-header-client'
import { EmpregosPageClient } from '@/app/components/empregos/empregos-page-client'
import { processVagas } from '@/app/components/empregos/vagas-utils'
import { getApiV1EmpregabilidadeCandidaturas } from '@/http-courses/empregabilidade-candidaturas/empregabilidade-candidaturas'
import { getApiPublicEmpregabilidadeVagas } from '@/http-courses/empregabilidade-vagas-public/empregabilidade-vagas-public'
import type { EmpregabilidadeVaga } from '@/http-courses/models'

export const dynamic = 'force-dynamic'

function getCandidaturasCount(data: Record<string, unknown>): number {
  const list = data.data
  if (Array.isArray(list)) return list.length
  const items = data.items
  if (Array.isArray(items)) return items.length
  return 0
}

export default async function EmpregosPage() {
  // Busca vagas da API
  let vagas: EmpregabilidadeVaga[] = []

  try {
    const response = await getApiPublicEmpregabilidadeVagas()

    if (response.status === 200 && response.data) {
      // A API retorna { data: EmpregabilidadeVaga[] }
      const apiData = response.data as { data?: EmpregabilidadeVaga[] }
      vagas = apiData.data || []
    }
  } catch (error) {
    console.error('Erro ao buscar vagas:', error)
  }

  // Verifica se o usuário tem ao menos uma candidatura (para exibir o CTA)
  let hasCandidaturas = false
  try {
    const candidaturasResponse = await getApiV1EmpregabilidadeCandidaturas({
      page: 1,
      pageSize: 1,
    })
    if (
      candidaturasResponse.status === 200 &&
      candidaturasResponse.data &&
      typeof candidaturasResponse.data === 'object'
    ) {
      const count = getCandidaturasCount(
        candidaturasResponse.data as Record<string, unknown>
      )
      hasCandidaturas = count >= 1
    }
  } catch (error) {
    console.error('Erro ao buscar candidaturas:', error)
  }

  // Processa e filtra vagas
  const vagasProcessadas = processVagas(vagas)

  return (
    <div className="min-h-lvh">
      <EmpregosHeaderClient />
      <main className="max-w-4xl mx-auto pb-36 text-foreground">
        <EmpregosPageClient
          vagas={vagasProcessadas}
          hasCandidaturas={hasCandidaturas}
        />
      </main>
    </div>
  )
}
