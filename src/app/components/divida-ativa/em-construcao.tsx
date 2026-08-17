import { SecondaryHeader } from '@/app/components/secondary-header'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

interface EmConstrucaoProps {
  titulo: string
  descricao: string
}

/**
 * Estado provisório dos serviços que a landing já anuncia mas que só chegam na Fase 3
 * (Marco 3 — 23/10/2026). Existe para que o link da landing leve a uma explicação em vez de
 * um 404, e some quando o serviço for implementado.
 */
export function EmConstrucao({ titulo, descricao }: EmConstrucaoProps) {
  return (
    <div className="mx-auto flex min-h-lvh max-w-xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader title="" className="max-w-xl" route="/divida-ativa" />

      <div className="flex flex-1 flex-col px-4">
        <h1 className="pt-2 pb-6 text-3xl font-medium leading-9 text-foreground">
          {titulo}
        </h1>

        <p className="text-sm font-normal leading-5 text-foreground-light">
          {descricao}
        </p>

        <CustomButton
          asChild
          variant="primary"
          size="lg"
          fullWidth
          className="mt-auto"
        >
          <Link href="/divida-ativa">Voltar a página de Dívida ativa</Link>
        </CustomButton>
      </div>
    </div>
  )
}

/** Skeleton fiel ao layout do estado provisório: título, parágrafo e botão. */
export function EmConstrucaoLoading() {
  return (
    <div className="mx-auto flex min-h-lvh max-w-xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader title="" className="max-w-xl" route="/divida-ativa" />

      <div className="flex flex-1 flex-col px-4">
        <div className="pt-2 pb-6">
          <Skeleton className="h-8 w-64" />
        </div>

        <Skeleton className="h-16 w-full" />

        <Skeleton className="mt-auto h-13 w-full rounded-full" />
      </div>
    </div>
  )
}
