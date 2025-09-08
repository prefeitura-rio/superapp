'use client'

import { SecondaryHeader } from '@/app/components/secondary-header'
import { faqSections } from '@/constants/faqs/pref-rio'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export default function FaqPagePrefRio() {
  const [headerH, setHeaderH] = useState<number>(80)
  const [currentId, setCurrentId] = useState<string>(faqSections[0]?.id)
  const [showMini, setShowMini] = useState<boolean>(false)

  const [miniH, setMiniH] = useState<number>(0)
  const miniRef = useRef<HTMLDivElement | null>(null)

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const registerSection = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      sectionRefs.current[id] = el
    },
    []
  )

  const firstH2Ref = useRef<HTMLHeadingElement | null>(null)

  useEffect(() => {
    const headerEl =
      (document.querySelector('[data-app-header]') as HTMLElement) ||
      (document.querySelector('header.fixed') as HTMLElement)

    const update = () => setHeaderH(headerEl?.offsetHeight ?? 80)
    update()

    const ro = headerEl ? new ResizeObserver(update) : null
    if (headerEl && ro) ro.observe(headerEl)
    window.addEventListener('resize', update)

    return () => {
      if (ro && headerEl) ro.unobserve(headerEl)
      window.removeEventListener('resize', update)
    }
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: <unnecessary>
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

  // Detect actual section in view
  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const y = headerH + 8
        let bestId = faqSections[0]?.id
        let bestDelta = Number.POSITIVE_INFINITY

        for (const sec of faqSections) {
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
          const firstVisible = faqSections.find(sec => {
            const el = sectionRefs.current[sec.id]
            if (!el) return false
            const r = el.getBoundingClientRect()
            return r.top >= y && r.top < window.innerHeight
          })
          if (firstVisible) bestId = firstVisible.id
        }

        setCurrentId(bestId)

        // determine if we should show the mini title - after scrolling past first h2
        const h2Rect = firstH2Ref.current?.getBoundingClientRect()
        const crossedHeader = h2Rect ? h2Rect.bottom <= headerH + 0.5 : true
        setShowMini(crossedHeader)

        ticking = false
      })
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [headerH])

  const currentTitle = useMemo(
    () => faqSections.find(s => s.id === currentId)?.title ?? '',
    [currentId]
  )

  const fadeH = 32
  const safeTopPadding = headerH

  return (
    <main
      className="max-w-4xl min-h-lvh mx-auto text-foreground pb-10"
      style={{ paddingTop: safeTopPadding }}
    >
      <SecondaryHeader title="FAQ" />

      {showMini && (
        <>
          <div
            className="fixed left-0 right-0 z-40 bg-background"
            style={{ top: headerH }}
            aria-live="polite"
          >
            <div className="mx-auto max-w-4xl px-4">
              <div
                ref={miniRef}
                className="h-9 flex items-center text-xs font-medium tracking-wide uppercase text-primary overflow-hidden"
              >
                <span key={currentId} className="mini-animate inline-block">
                  {currentTitle}
                </span>
              </div>
            </div>
          </div>

          {/* fade */}
          <div
            className="fixed left-0 right-0 z-30 pointer-events-none bg-gradient-to-b from-background to-background/0"
            style={{ top: headerH + miniH - 1, height: fadeH + 1 }}
          />
        </>
      )}

      <div className="p-4 pt-10 max-w-4xl mx-auto">
        {faqSections.map((section, sIdx) => (
          <section
            key={section.id}
            id={section.id}
            ref={registerSection(section.id)}
            className={sIdx > 0 ? 'mt-14' : ''}
          >
            <h2
              className="font-medium text-primary tracking-tight text-4xl leading-10 min-h-10"
              ref={sIdx === 0 ? firstH2Ref : undefined}
            >
              {section.title}
            </h2>

            <div className="space-y-8 mt-6">
              {section.items.map((item, index) => (
                <div key={index}>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium tracking-normal leading-5">
                      {item.title}
                    </h3>

                    {Array.isArray(item.content) ? (
                      <ul className="list-disc pl-5 text-foreground-light text-sm leading-relaxed opacity-50 space-y-1">
                        {item.content.map((line, i) => (
                          <li key={i}>{line}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-foreground-light text-sm leading-relaxed whitespace-pre-line opacity-50">
                        {item.content}
                      </p>
                    )}
                  </div>

                  {index < section.items.length - 1 && (
                    <div className="mt-8 border-t border-border" />
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* mini-title animation */}
      <style jsx>{`
        @keyframes miniSlideIn {
          from {
            opacity: 0;
            transform: translateX(-6px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .mini-animate {
          animation: miniSlideIn 180ms ease-out;
          will-change: transform, opacity;
        }

        @media (prefers-reduced-motion: reduce) {
          .mini-animate {
            animation: none;
          }
        }
      `}</style>
    </main>
  )
}
