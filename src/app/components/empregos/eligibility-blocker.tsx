'use client'

import { OportunidadesSubHeader } from '@/app/components/oportunidades/oportunidades-sub-header'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

import type { FailedCriterio } from '@/lib/eligibility-utils'

interface EligibilityBlockerProps {
  failedCriterios: FailedCriterio[]
}

export function EligibilityBlocker({
  failedCriterios,
}: EligibilityBlockerProps) {
  const router = useRouter()

  return (
    <div>
      <OportunidadesSubHeader
        menuHref="/servicos/trabalho/menu"
        logoHref="/servicos/trabalho"
        showSearchIcon
        searchUrl="/busca?tipo=empregos"
      />
      <div>
        <div className="max-w-4xl mx-auto text-foreground">
          <div className="flex flex-col px-6 pt-8 pb-10 gap-6">
            <h1 className="text-3xl font-medium leading-9 tracking-tight text-foreground">
              Você não atende aos requisitos dessa vaga
            </h1>

            <div className="bg-card rounded-lg p-4 flex flex-col gap-1 self-stretch">
              <p className="text-sm text-foreground-light leading-[18px]">
                Para se candidatar a essa vaga é necessário:
              </p>
              <ul className="list-disc list-inside mt-1 flex flex-col gap-0.5 ml-2">
                {failedCriterios.map(criterio => (
                  <li
                    key={criterio.slug + criterio.label}
                    className="text-sm text-foreground leading-[18px]"
                  >
                    {criterio.label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto">
              <Button
                className="w-full rounded-full flex justify-center items-center gap-3 py-4 px-6 h-auto"
                onClick={() => router.push('/servicos/trabalho')}
              >
                Voltar para a tela inicial
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
