'use client'

import HeaderWrapperClient from '@/app/components/header-wrapper-client'
import { useFaqHighlight } from '@/hooks/useFaqHighlight'
import { useSectionTracker } from '@/hooks/useSectionTracker'
import type { FaqSection } from '@/lib/faq-utils'
import { FormattedContent, Highlighted } from '@/lib/faq-utils'
import { useSearchParams } from 'next/navigation'

const FADE_H = 32

export function FaqTrabalhoClient({ sections }: { sections: FaqSection[] }) {
  const sectionsForTracker = sections.map(s => ({ id: s.id, title: s.title }))
  const searchParams = useSearchParams()
  const fromHub = searchParams.get('from') === 'faq'

  const {
    currentTitle,
    showMini,
    miniH,
    miniRef,
    registerSection,
    firstAnchorRef,
  } = useSectionTracker(sectionsForTracker, 0)

  const highlightQuery = useFaqHighlight(0)
  const miniLabel = fromHub ? `Trabalho · ${currentTitle}` : currentTitle

  return (
    <div className="text-foreground">
      <HeaderWrapperClient />
      <main className="max-w-4xl min-h-lvh mx-auto pb-10">
        {showMini && (
          <>
            <div
              className="fixed left-0 right-0 top-0 z-40 bg-background"
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
              style={{ top: miniH - 1, height: FADE_H + 1 }}
            />
          </>
        )}

        <div className="p-5 pt-4 max-w-4xl mx-auto">
          <h1 className="text-3xl font-medium text-foreground pb-4">FAQ</h1>
          <div className="space-y-8">
            {sections.map((section, index) => (
              <div
                key={section.id}
                id={section.id}
                ref={el => {
                  registerSection(section.id)(el)
                  if (index === 0) {
                    ;(
                      firstAnchorRef as React.MutableRefObject<HTMLElement | null>
                    ).current = el
                  }
                }}
              >
                <div className="space-y-2">
                  <h2 className="text-lg font-medium tracking-normal leading-5">
                    <Highlighted text={section.title} query={highlightQuery} />
                  </h2>
                  <FormattedContent
                    content={section.content}
                    className="text-foreground"
                    query={highlightQuery}
                  />
                </div>
                {index < sections.length - 1 && (
                  <div className="mt-8 border-t border-border" />
                )}
              </div>
            ))}
          </div>
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
    </div>
  )
}
