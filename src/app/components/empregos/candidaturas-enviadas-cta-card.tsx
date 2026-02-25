'use client'

import { ChevronRightIcon } from '@/assets/icons'
import Link from 'next/link'

export function CandidaturasEnviadasCtaCard() {
  return (
    <Link
      href="/servicos/empregos/minhas-candidaturas"
      className="flex items-center justify-between gap-3 rounded-2xl bg-card px-4 py-4 w-full text-left transition-opacity hover:opacity-90 active:opacity-95"
    >
      <div className="min-w-0 flex-1">
        <p className="text-base font-medium text-foreground">
          Candidaturas enviadas
        </p>
        <p className="mt-0.5 text-xs font-normal leading-4 text-foreground-light">
          Acompanhe aqui o andamento de suas candidaturas
        </p>
      </div>
      <ChevronRightIcon className="size-5 shrink-0 text-primary stroke-[1.5]" />
    </Link>
  )
}
