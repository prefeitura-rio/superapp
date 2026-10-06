'use client'

import HeaderWrapperClient from '@/app/components/header-wrapper-client'
import { type FAQSection, faqSections } from '@/constants/faqs/pref-rio'
import { useFaqHighlight } from '@/hooks/useFaqHighlight'
import { useSectionTracker } from '@/hooks/useSectionTracker'
import { FormattedContent, Highlighted } from '@/lib/faq-utils'
import { useSearchParams } from 'next/navigation'

const SECTIONS_FOR_TRACKER = faqSections.map(s => ({
  id: s.id,
  title: s.title ?? '',
}))

const FADE_H = 32

export function FaqPrefRioClient({ sections }: { sections: FAQSection[] }) {
  const searchParams = useSearchParams()
  const fromHub = searchParams.get('from') === 'faq'

  const {
    currentTitle,
    showMini,
    miniH,
    miniRef,
    registerSection,
    firstAnchorRef,
  } = useSectionTracker(SECTIONS_FOR_TRACKER, 0)

  const highlightQuery = useFaqHighlight(0)
  const miniLabel = fromHub ? `PrefRio · ${currentTitle}` : currentTitle

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

        <div className="p-4 pt-10 max-w-4xl mx-auto">
          {sections.map((section, sIdx) => (
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
    </div>
  )
}
