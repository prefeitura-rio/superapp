'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface Section {
  id: string
  title: string
}

interface UseSectionTrackerReturn {
  currentId: string
  currentTitle: string
  showMini: boolean
  miniH: number
  miniRef: React.RefObject<HTMLDivElement | null>
  registerSection: (id: string) => (el: HTMLElement | null) => void
  firstAnchorRef: React.RefObject<HTMLElement | null>
}

export function useSectionTracker(
  sections: Section[],
  headerH: number
): UseSectionTrackerReturn {
  const [currentId, setCurrentId] = useState<string>(sections[0]?.id ?? '')
  const [showMini, setShowMini] = useState(false)
  const [miniH, setMiniH] = useState(0)

  const miniRef = useRef<HTMLDivElement>(null)
  const firstAnchorRef = useRef<HTMLElement>(null)
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  const registerSection = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      sectionRefs.current[id] = el
    },
    []
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: miniH intentional
  useEffect(() => {
    const update = () => {
      const h = miniRef.current?.offsetHeight
      if (h && h !== miniH) setMiniH(h)
    }
    update()
    const ro = miniRef.current ? new ResizeObserver(update) : null
    if (miniRef.current && ro) ro.observe(miniRef.current)
    window.addEventListener('resize', update)
    return () => {
      ro?.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [showMini, miniH])

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const y = headerH + 8
        let bestId = sections[0]?.id ?? ''
        let bestDelta = Number.POSITIVE_INFINITY

        for (const sec of sections) {
          const el = sectionRefs.current[sec.id]
          if (!el) continue
          const rect = el.getBoundingClientRect()
          const delta = Math.abs(rect.top - y)
          if (rect.top - y <= 0 && delta < bestDelta) {
            bestDelta = delta
            bestId = sec.id
          }
        }

        if (!bestId) {
          const firstVisible = sections.find(sec => {
            const el = sectionRefs.current[sec.id]
            if (!el) return false
            const r = el.getBoundingClientRect()
            return r.top >= y && r.top < window.innerHeight
          })
          if (firstVisible) bestId = firstVisible.id
        }

        setCurrentId(bestId)

        const anchorRect = firstAnchorRef.current?.getBoundingClientRect()
        const crossedHeader = anchorRect
          ? anchorRect.bottom <= headerH + 0.5
          : true
        setShowMini(crossedHeader)

        ticking = false
      })
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [headerH, sections])

  const currentTitle = useMemo(
    () => sections.find(s => s.id === currentId)?.title ?? '',
    [currentId, sections]
  )

  return {
    currentId,
    currentTitle,
    showMini,
    miniH,
    miniRef,
    registerSection,
    firstAnchorRef,
  }
}
