import { BriefcaseIcon } from '@/assets/icons'
import Link from 'next/link'

interface MinhasCandidaturasCardProps {
  total: number
}

/**
 * Card "Minhas candidaturas". O número de candidaturas só aparece quando há
 * alguma. A contagem de atualizações nos processos seletivos ainda depende de
 * definição de produto; até lá o card mostra "Sem atualizações".
 */
export function MinhasCandidaturasCard({ total }: MinhasCandidaturasCardProps) {
  return (
    <Link
      href="/servicos/trabalho/minhas-candidaturas"
      className="relative flex min-h-28 flex-col justify-between gap-4 rounded-2xl bg-background p-4 transition-opacity hover:opacity-90 active:opacity-95"
    >
      <BriefcaseIcon aria-hidden className="size-7 text-primary" />
      {total > 0 && (
        <span
          role="img"
          aria-label={`${total} ${total === 1 ? 'candidatura' : 'candidaturas'}`}
          className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground"
        >
          {total}
        </span>
      )}
      <div>
        <p className="text-sm font-medium text-foreground">
          Minhas candidaturas
        </p>
        <p className="mt-0.5 text-xs leading-4 text-foreground-light">
          Sem atualizações
        </p>
      </div>
    </Link>
  )
}
