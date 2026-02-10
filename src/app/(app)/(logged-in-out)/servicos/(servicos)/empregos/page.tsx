import { EmpregosHeaderClient } from '@/app/components/empregos/empregos-header-client'

export const dynamic = 'force-dynamic'

export default function EmpregosPage() {
  return (
    <div className="min-h-lvh">
      <EmpregosHeaderClient />
      <main className="max-w-4xl mx-auto pt-30 pb-20 text-foreground">
        <div className="px-4">
          {/* Estrutura mínima - conteúdo será adicionado posteriormente */}
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-lg text-muted-foreground text-center">
              Página de Empregos
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
