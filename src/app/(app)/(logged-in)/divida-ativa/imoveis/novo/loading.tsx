import { SecondaryHeader } from '@/app/components/secondary-header'
import { Skeleton } from '@/components/ui/skeleton'

/** Skeleton fiel ao layout real: título em duas linhas, campo, texto de ajuda e botão. */
export default function NovoImovelLoading() {
  return (
    <div className="mx-auto flex min-h-lvh max-w-4xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader
        title=""
        className="max-w-4xl"
        route="/divida-ativa/imoveis"
      />

      <div className="px-4 pt-2 pb-6">
        <Skeleton className="mb-2 h-8 w-full" />
        <Skeleton className="h-8 w-56" />
      </div>

      <div className="flex flex-col gap-4 px-4">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="mt-4 h-13 w-full rounded-full" />
      </div>
    </div>
  )
}
