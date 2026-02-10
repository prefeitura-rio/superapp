import { EmpregosHeaderClient } from '@/app/components/empregos/empregos-header-client'
import { EmpregosPageClient } from '@/app/components/empregos/empregos-page-client'
import { getApiV1Empregos } from '@/http-courses/empregos/empregos'
import type { ModelsEmprego } from '@/http-courses/models'
import { mapModelsEmpregoToVagaCardData } from '@/lib/emprego-utils'
import { MOCK_VAGAS } from '@/mocks/mock-vagas'

export const dynamic = 'force-dynamic'

export default async function EmpregosPage() {
  let vagas = MOCK_VAGAS

  try {
    const response = await getApiV1Empregos({ page: 1, pageSize: 100 })
    if (response.status === 200) {
      const data = response.data as Record<string, unknown>
      const empregos = (data?.empregos ?? data?.data ?? []) as ModelsEmprego[]
      const list = Array.isArray(empregos) ? empregos : []
      const mappedVagas = list.map(mapModelsEmpregoToVagaCardData)
      // Só usa dados da API se as vagas tiverem badges completas (bairro, PcD, etc.)
      // Caso contrário mantém o mock para desenvolvimento
      const hasCompleteBadges = mappedVagas.some(v =>
        v.badges.some(
          b =>
            b.type === 'bairro' ||
            b.type === 'acessivel_pcd' ||
            b.type === 'preferencial_pcd'
        )
      )
      if (list.length > 0 && hasCompleteBadges) {
        vagas = mappedVagas
      }
    }
  } catch {
    // Usa mock em caso de erro
  }

  return (
    <div className="min-h-lvh">
      <EmpregosHeaderClient />
      <main className="max-w-4xl mx-auto pb-36 text-foreground">
        <EmpregosPageClient vagas={vagas} />
      </main>
    </div>
  )
}
