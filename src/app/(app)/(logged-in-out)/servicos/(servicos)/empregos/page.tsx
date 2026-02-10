import { EmpregosHeaderClient } from '@/app/components/empregos/empregos-header-client'
import { EmpregosPageClient } from '@/app/components/empregos/empregos-page-client'
import { MOCK_VAGAS } from '@/mocks/mock-vagas'

export const dynamic = 'force-dynamic'

export default async function EmpregosPage() {
  return (
    <div className="min-h-lvh">
      <EmpregosHeaderClient />
      <main className="max-w-4xl mx-auto pb-36 text-foreground">
        <EmpregosPageClient vagas={MOCK_VAGAS} />
      </main>
    </div>
  )
}
