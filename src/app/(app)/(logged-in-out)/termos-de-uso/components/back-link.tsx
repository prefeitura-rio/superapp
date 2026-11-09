import { ChevronLeftIcon } from '@/assets/icons'
import Link from 'next/link'

/**
 * Visual do voltar das telas de Termos de uso (secondary: default `bg-card`,
 * focused `bg-secondary` no hover do desktop e enquanto pressionado no mobile).
 */
export const BACK_CONTROL_CLASSNAME =
  'flex h-11 w-11 items-center justify-center rounded-full bg-card text-foreground transition-colors hover:bg-secondary active:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

interface BackLinkProps {
  href: string
  /** Nome acessível: diz para onde volta, ex.: "Voltar para Termos de uso". */
  label: string
}

/** Voltar com destino fixo (o detalhe sempre volta para a lista). */
export function BackLink({ href, label }: BackLinkProps) {
  return (
    <Link href={href} aria-label={label} className={BACK_CONTROL_CLASSNAME}>
      <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
    </Link>
  )
}
