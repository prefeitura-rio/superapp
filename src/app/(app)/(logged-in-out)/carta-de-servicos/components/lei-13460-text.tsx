'use client'

import { LEI_13460_PARAGRAPHS } from '@/constants/carta-de-servicos'
import { cn } from '@/lib/utils'
import { useId, useState } from 'react'

/**
 * Texto da Lei 13.460. Recolhido mostra o 1º parágrafo inteiro e o começo do 2º
 * (Figma); "Ver mais" abre o resto e vira "Ver menos".
 */
export function Lei13460Text() {
  const [expanded, setExpanded] = useState(false)
  const contentId = useId()
  const [first, second, ...rest] = LEI_13460_PARAGRAPHS

  return (
    <div className="flex flex-col gap-1">
      <div
        id={contentId}
        className="flex flex-col gap-4 text-sm leading-5 text-foreground-light"
      >
        <p>{first}</p>
        <p className={cn(!expanded && 'line-clamp-4')}>{second}</p>
        {expanded && rest.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      </div>
      <button
        type="button"
        onClick={() => setExpanded(value => !value)}
        aria-expanded={expanded}
        aria-controls={contentId}
        className="self-start text-sm leading-5 text-foreground hover:underline"
      >
        {expanded ? 'Ver menos' : 'Ver mais'}
      </button>
    </div>
  )
}
