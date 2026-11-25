'use client'

import { minhasSolicitacoesHref } from '@/app/(app)/(logged-in)/minhas-solicitacoes/origem'
import { ChevronRightIcon } from '@/assets/icons'
import { useChamadosParaAcompanhar } from '@/hooks/chamados/use-chamados'
import { useAuthStatus } from '@/providers/auth-status-provider'
import Link from 'next/link'

const CARD_CLASS = 'mx-4 mt-2 h-14.5 shrink-0 rounded-2xl'

export function RequestsInProgressBannerSkeleton() {
  return <div className={`${CARD_CLASS} bg-card animate-pulse`} />
}

export default function RequestsInProgressBanner() {
  const { isLoggedIn, isLoading: authLoading } = useAuthStatus()
  // Mesma query da lista de Minhas Solicitações: o cache é um só.
  const { data: count, isPending } = useChamadosParaAcompanhar({
    enabled: isLoggedIn === true,
  })

  if (authLoading || (isLoggedIn === true && isPending)) {
    return <RequestsInProgressBannerSkeleton />
  }
  // Banner opcional: deslogado, sem nada para acompanhar ou com erro, some.
  if (!isLoggedIn || !count) return null

  const label =
    count === 1
      ? 'Você possui **1 solicitação** para acompanhar.'
      : `Você possui **${count} solicitações** para acompanhar.`

  const [before, bold, after] = label.split('**')

  return (
    // A contagem é só do novo 1746 (Salesforce): abre nessa origem.
    <Link href={minhasSolicitacoesHref('salesforce')}>
      <div
        className={`${CARD_CLASS} flex items-center justify-between gap-3 bg-card px-4 cursor-pointer hover:bg-secondary transition-colors`}
      >
        <p className="text-sm text-foreground-light leading-5">
          {before}
          <span className="text-foreground font-normal">{bold}</span>
          {after}
        </p>
        <ChevronRightIcon className="h-4 w-4 text-foreground-light shrink-0" />
      </div>
    </Link>
  )
}
