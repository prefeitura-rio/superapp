'use client'

import { SecondaryHeader } from '@/app/components/secondary-header'
import {
  oportunidadesCariocasLogo,
  oportunidadesCariocasLogoDark,
} from '@/constants/bucket'
import { useFaqHighlight } from '@/hooks/useFaqHighlight'
import { useSectionTracker } from '@/hooks/useSectionTracker'
import type { FaqSection } from '@/lib/faq-utils'
import { FormattedContent, Highlighted } from '@/lib/faq-utils'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const FADE_H = 32

export function FaqCursosClient({ sections }: { sections: FaqSection[] }) {
  const sectionsForTracker = sections.map(s => ({ id: s.id, title: s.title }))
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
  } = useSectionTracker(sectionsForTracker, headerH)

  const highlightQuery = useFaqHighlight(headerH)
  const miniLabel = fromHub ? `Cursos · ${currentTitle}` : currentTitle

  return (
    <main
      className="max-w-4xl min-h-lvh mx-auto text-foreground pb-10"
      style={{ paddingTop: headerH }}
    >
      <SecondaryHeader
        route="/servicos/cursos"
        logo={
          <Link href="/servicos/cursos">
            <Image
              src={oportunidadesCariocasLogoDark}
              alt="Oportunidades Cariocas"
              width={170}
              height={38}
              priority
              className="dark:block hidden"
            />
            <Image
              src={oportunidadesCariocasLogo}
              alt="Oportunidades Cariocas"
              width={170}
              height={38}
              priority
              className="dark:hidden block"
            />
          </Link>
        }
      />

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

      <div className="p-5 pt-0 max-w-4xl mx-auto">
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
  )
}
