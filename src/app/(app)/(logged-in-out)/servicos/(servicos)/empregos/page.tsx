import { EmpregosHeaderClient } from '@/app/components/empregos/empregos-header-client'
import { EmpregosPageClient } from '@/app/components/empregos/empregos-page-client'
import { processVagas } from '@/app/components/empregos/vagas-utils'
import { getApiPublicEmpregabilidadeVagas } from '@/http-courses/empregabilidade-vagas-public/empregabilidade-vagas-public'
import type { EmpregabilidadeVaga } from '@/http-courses/models'

export const dynamic = 'force-dynamic'

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

  // Processa e filtra vagas
  const vagasProcessadas = processVagas(vagas)

  return (
    <div className="min-h-lvh">
      <EmpregosHeaderClient />
      <main className="max-w-4xl mx-auto pb-36 text-foreground">
        <EmpregosPageClient vagas={vagasProcessadas} />
      </main>
    </div>
  )
}
