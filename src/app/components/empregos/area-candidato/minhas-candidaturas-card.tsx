import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import minhasCandidaturasIcone from '../../../../../public/empregos/minhas-candidaturas-3d.png'
import { subtituloMinhasCandidaturas } from './area-candidato-utils'

interface MinhasCandidaturasCardProps {
  total: number
  /** Candidaturas com mudança de status ou de etapa ainda não vista. */
  atualizacoes: number
}

/**
 * Card "Minhas candidaturas". O número de candidaturas só aparece quando há
 * alguma; as atualizações não vistas aparecem em destaque no subtítulo.
 */
export function MinhasCandidaturasCard({
  total,
  atualizacoes,
}: MinhasCandidaturasCardProps) {
  return (
    <Link
      href="/servicos/trabalho/minhas-candidaturas"
      className="flex min-h-27 flex-col justify-between gap-4 rounded-2xl border border-border bg-card px-4 py-3 transition-opacity hover:opacity-90 active:opacity-95"
    >
      <div className="flex items-start justify-between gap-2">
        <Image
          src={minhasCandidaturasIcone}
          alt=""
          width={38}
          height={34}
          className="h-8.5 w-9.5"
        />
        {total > 0 && (
          <span
            role="img"
            aria-label={`${total} ${total === 1 ? 'candidatura' : 'candidaturas'}`}
            className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#3E5782] px-1.5 text-xs leading-4 text-background dark:text-white"
          >
            {total}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium leading-4 text-foreground">
          Minhas candidaturas
        </p>
        <p
          className={cn(
            'mt-0.5 text-xs leading-4',
            atualizacoes > 0 ? 'text-card-2' : 'text-foreground-light'
          )}
        >
          {subtituloMinhasCandidaturas(atualizacoes)}
        </p>
      </div>
    </Link>
  )
}
