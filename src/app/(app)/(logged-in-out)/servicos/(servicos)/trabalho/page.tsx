import { EmpregosHeaderClient } from '@/app/components/empregos/empregos-header-client'
import { EmpregosPageClient } from '@/app/components/empregos/empregos-page-client'
import type { VagaCardData } from '@/app/components/empregos/vaga-card'
import { transformVagaToCardData } from '@/app/components/empregos/vagas-utils'
import { getApiPublicEmpregabilidadeVagas } from '@/http-courses/empregabilidade-vagas-public/empregabilidade-vagas-public'
import type { EmpregabilidadeVaga } from '@/http-courses/models'

export const dynamic = 'force-dynamic'

export default async function EmpregosPage() {
  let recentVagas: VagaCardData[] = []

  try {
    // Busca apenas as 4 vagas mais recentes para o SSR (seção "Recém adicionadas")
    // A seção "Encontre sua vaga" busca client-side com filtros via useVagas
    const response = await getApiPublicEmpregabilidadeVagas({
      status: 'publicado_ativo',
      page: 1,
      pageSize: 4,
    })
    if (response.status === 200 && response.data) {
      const apiData = response.data as { data?: EmpregabilidadeVaga[] }
      recentVagas = (apiData.data || []).map(transformVagaToCardData)
    }
  } catch (error) {
    console.error('Erro ao buscar vagas recentes:', error)
  }

  return (
    <div className="min-h-lvh">
      <EmpregosHeaderClient />
      <main className="max-w-4xl mx-auto pb-36 text-foreground">
        <EmpregosPageClient recentVagas={recentVagas} />
      </main>
    </div>
  )
}
