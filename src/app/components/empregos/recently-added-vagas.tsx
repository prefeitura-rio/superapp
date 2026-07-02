'use client'

import { ChevronLeftIcon, ChevronRightIcon } from '@/assets/icons'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { VagaCardData } from './vaga-card'
import { VagaCard } from './vaga-card'

interface RecentlyAddedVagasProps {
  vagas: VagaCardData[]
}

const CARD_WIDTH = 262
const CARD_GAP = 8
const SCROLL_STEP = CARD_WIDTH + CARD_GAP

export function RecentlyAddedVagas({ vagas }: RecentlyAddedVagasProps) {
  const limitedVagas = vagas.slice(0, 4)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateScrollState()
    el.addEventListener('scroll', updateScrollState, { passive: true })
    const ro = new ResizeObserver(updateScrollState)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      ro.disconnect()
    }
  }, [updateScrollState])

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -SCROLL_STEP, behavior: 'smooth' })
  }

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: SCROLL_STEP, behavior: 'smooth' })
  }

  if (limitedVagas.length === 0) return null

  const showControls = limitedVagas.length > 1

  return (
    <>
      <div className="flex items-center justify-between pb-2 px-4">
        <h3 className="text-base font-medium text-foreground leading-5">
          Mais recentes
        </h3>
        {showControls && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              aria-label="Anterior"
              className="flex items-center justify-center"
            >
              <ChevronLeftIcon
                width={20}
                height={20}
                className={canScrollLeft ? 'text-foreground' : 'text-[#A1A1A1]'}
              />
            </button>
            <button
              type="button"
              onClick={scrollRight}
              disabled={!canScrollRight}
              aria-label="Próximo"
              className="flex items-center justify-center"
            >
              <ChevronRightIcon
                width={20}
                height={20}
                className={
                  canScrollRight ? 'text-foreground' : 'text-[#A1A1A1]'
                }
              />
            </button>
          </div>
        )}
      </div>
      <div
        ref={scrollRef}
        className="max-[576px]:w-full max-[576px]:pl-4 min-[577px]:mx-4 overflow-x-auto pb-6 no-scrollbar"
      >
        <div className="flex gap-2 min-w-max">
          {limitedVagas.map(vaga => (
            <VagaCard
              key={vaga.id}
              vaga={vaga}
              variant="recent"
              className="w-[262px] h-[188px]"
            />
          ))}
        </div>
      </div>
    </>
  )
}
