'use client'

import { CurriculoContent } from '@/app/(app)/(logged-in-out)/servicos/(servicos)/trabalho/curriculo/curriculo-content'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuery } from '@tanstack/react-query'

async function fetchCurriculoData() {
  const res = await fetch('/api/user/empregos/curriculo', { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch curriculo data')
  return res.json()
}

function AccordionItemSkeleton({ titleWidth }: { titleWidth: string }) {
  return (
    <div className="border-b border-border py-5 last:border-b-0">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className={titleWidth} />
        <Skeleton className="size-5 shrink-0 rounded-full" />
      </div>
      <div className="pt-5 pb-4 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  )
}

function CurriculoSkeleton() {
  return (
    <>
      <div className="max-w-4xl mx-auto">
        <SecondaryHeader
          fixed={false}
          className="max-w-4xl mx-auto"
          route="/servicos/trabalho"
        />
      </div>
      <div className="px-4 max-w-4xl mx-auto flex flex-col min-h-[calc(100vh-120px)] overflow-x-hidden">
        <Skeleton className="h-9 w-48 mt-2 mb-6" />
        <div className="w-full">
          <AccordionItemSkeleton titleWidth="h-5 w-24" />
          <AccordionItemSkeleton titleWidth="h-5 w-44" />
          <AccordionItemSkeleton titleWidth="h-5 w-28" />
          <AccordionItemSkeleton titleWidth="h-5 w-28" />
        </div>
      </div>
    </>
  )
}

interface CurriculoPageClientProps {
  cpf: string
}

export function CurriculoPageClient({ cpf }: CurriculoPageClientProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['curriculo'],
    queryFn: fetchCurriculoData,
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) return <CurriculoSkeleton />

  return (
    <CurriculoContent
      cpf={cpf}
      formacaoOptions={data?.formacaoOptions}
      initialEscolaridade={data?.escolaridade}
      initialFormacoes={data?.formacoes ?? []}
      initialIdiomas={data?.idiomas ?? []}
      situacaoOptions={data?.situacaoOptions}
      initialSituacao={data?.situacao ?? undefined}
      experienciaOptions={data?.experienciaOptions}
      initialExperiencia={data?.experiencia ?? undefined}
      initialTermosAceitos={data?.termos ?? false}
    />
  )
}
