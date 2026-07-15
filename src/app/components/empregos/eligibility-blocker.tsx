'use client'

import { ChevronLeftIcon } from '@/assets/icons'
import { Button } from '@/components/ui/button'
import {
  oportunidadesCariocasLogo,
  oportunidadesCariocasLogoDark,
} from '@/constants/bucket'
import Image from 'next/image'
import Link from 'next/link'
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
    <div className="min-h-lvh">
      <div className="max-w-4xl mx-auto text-foreground">
        {/* Header — mesmo padrão de /servicos/trabalho: bg-background, logo adaptada por modo */}
        <header className="bg-background px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center justify-center rounded-full w-11 h-11 bg-card text-foreground hover:bg-secondary hover:cursor-pointer transition-colors"
              aria-label="Voltar"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <div className="flex justify-center">
              <Link href="/servicos/trabalho">
                <Image
                  src={oportunidadesCariocasLogo}
                  alt="Oportunidades Cariocas"
                  width={170}
                  height={38}
                  className="dark:hidden"
                  priority
                />
                <Image
                  src={oportunidadesCariocasLogoDark}
                  alt="Oportunidades Cariocas"
                  width={170}
                  height={38}
                  className="hidden dark:block"
                  priority
                />
              </Link>
            </div>
            {/* Espaço espelho do botão de voltar para manter o logo centralizado */}
            <div className="w-11" />
          </div>
        </header>

        <div className="flex flex-col px-6 pt-8 pb-10 gap-6 min-h-[calc(100lvh-64px)]">
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
  )
}
