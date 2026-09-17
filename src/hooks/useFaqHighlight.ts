'use client'

import { useEffect, useState } from 'react'

/**
 * Reads `highlight` from the URL hash (e.g. `#section-id&highlight=termo`),
 * scrolls the matching anchor to the center of the viewport, and returns
 * the highlight term so pages can apply inline text highlights.
 */
export function useFaqHighlight(headerH: number): string {
  const [highlightQuery, setHighlightQuery] = useState('')

  useEffect(() => {
    const hash = window.location.hash
    if (!hash) return

    // hash format: #section-id&highlight=termo
    const [anchor, ...rest] = hash.slice(1).split('&')
    const highlightParam = rest.find(p => p.startsWith('highlight='))
    const term = highlightParam
      ? decodeURIComponent(highlightParam.slice('highlight='.length))
      : ''

    if (term) setHighlightQuery(term)
    if (!anchor) return

    // defer to after paint so the element is in the DOM
    const id = requestAnimationFrame(() => {
      const el = document.getElementById(anchor)
      if (!el) return
      const elTop = el.getBoundingClientRect().top + window.scrollY
      const center = elTop - window.innerHeight / 2 + el.offsetHeight / 2
      window.scrollTo({
        top: Math.max(0, center - headerH / 2),
        behavior: 'smooth',
      })
    })

    return () => cancelAnimationFrame(id)
  }, [headerH])

  return highlightQuery
}
