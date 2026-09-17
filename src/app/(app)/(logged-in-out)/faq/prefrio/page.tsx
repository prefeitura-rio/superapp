'use client'

import { SecondaryHeader } from '@/app/components/secondary-header'
import { faqSections } from '@/constants/faqs/pref-rio'
import { useFaqHighlight } from '@/hooks/useFaqHighlight'
import { useSectionTracker } from '@/hooks/useSectionTracker'
import { FormattedContent, Highlighted } from '@/lib/faq-utils'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const SECTIONS_FOR_TRACKER = faqSections.map(s => ({
  id: s.id,
  title: s.title ?? '',
}))

const FADE_H = 32

export default function FaqPagePrefRio() {
  const [headerH, setHeaderH] = useState(80)
  const searchParams = useSearchParams()
  const fromHub = searchParams.get('from') === 'faq'

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

  const {
    currentTitle,
    showMini,
    miniH,
    miniRef,
    registerSection,
    firstAnchorRef,
  } = useSectionTracker(SECTIONS_FOR_TRACKER, headerH)

  const highlightQuery = useFaqHighlight(headerH)
  const miniLabel = fromHub ? `PrefRio · ${currentTitle}` : currentTitle
  const safeTopPadding = headerH

  return (
    <main
      className="max-w-4xl min-h-lvh mx-auto text-foreground pb-10"
      style={{ paddingTop: safeTopPadding }}
    >
      <SecondaryHeader title="FAQ" route="/faq" />

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
                <span key={miniLabel} className="mini-animate inline-block">
                  {miniLabel}
                </span>
              </div>
            </div>
          </div>

          <div
            className="fixed left-0 right-0 z-30 pointer-events-none bg-linear-to-b from-background to-background/0"
            style={{ top: headerH + miniH - 1, height: FADE_H + 1 }}
          />
        </>
      )}

      <div className="p-4 pt-10 max-w-4xl mx-auto">
        {faqSections.map((section, sIdx) => (
          <section
            key={section.id}
            id={section.id}
            ref={el => {
              registerSection(section.id)(el)
              if (sIdx === 0) {
                ;(
                  firstAnchorRef as React.MutableRefObject<HTMLElement | null>
                ).current = el
              }
            }}
            className={sIdx > 0 ? 'mt-14' : ''}
          >
            {section.title && (
              <h2 className="font-medium text-primary tracking-tight text-4xl leading-10 min-h-10">
                {section.title}
              </h2>
            )}

            <div className="space-y-8 mt-6">
              {section.items.map((item, index) => (
                <div key={index}>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium tracking-normal leading-5">
                      <Highlighted text={item.title} query={highlightQuery} />
                    </h3>

                    {Array.isArray(item.content) ? (
                      <ul className="list-disc pl-5 text-foreground-light text-sm leading-relaxed space-y-1">
                        {item.content.map((line, i) => (
                          <li key={i}>
                            <Highlighted text={line} query={highlightQuery} />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <FormattedContent
                        content={item.content}
                        query={highlightQuery}
                        className="text-foreground-light opacity-100"
                      />
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
