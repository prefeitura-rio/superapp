'use client'

import { sendGAEvent } from '@/lib/analytics/send-ga-event'
import { cn } from '@/lib/utils'
import { useAuthStatus } from '@/providers/auth-status-provider'
import {
  type PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { HomeBannerSlide } from './home-banner-slide'
import {
  HOME_BANNER_AUTOPLAY_MS,
  type HomeBanner,
  homeBanners,
} from './home-banners'

const SWIPE_THRESHOLD_PX = 40
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia?.(REDUCED_MOTION_QUERY)
  query?.addEventListener('change', onChange)
  return () => query?.removeEventListener('change', onChange)
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia?.(REDUCED_MOTION_QUERY).matches ?? false,
    () => false
  )
}

type InputModality = 'keyboard' | 'pointer'

/**
 * Última forma de interação na página (teclado ou mouse/toque). O foco que um
 * clique ou toque deixa num indicador não deve pausar a troca automática; o
 * foco de teclado (Tab), sim. Antes de qualquer interação, conta como teclado.
 */
function useInputModality() {
  const modality = useRef<InputModality>('keyboard')
  useEffect(() => {
    const onKeyDown = () => {
      modality.current = 'keyboard'
    }
    const onPointerDown = () => {
      modality.current = 'pointer'
    }
    document.addEventListener('keydown', onKeyDown, true)
    document.addEventListener('pointerdown', onPointerDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.removeEventListener('pointerdown', onPointerDown, true)
    }
  }, [])
  return modality
}

/** Distância de um slide até o ativo, no intervalo (-n/2, n/2]. */
function offsetFrom(index: number, active: number, total: number) {
  const raw = (index - active + total) % total
  return raw > total / 2 ? raw - total : raw
}

type HomeBannerCarouselProps = {
  banners?: HomeBanner[]
}

export function HomeBannerCarousel({
  banners = homeBanners,
}: HomeBannerCarouselProps) {
  const total = banners.length
  const { isLoggedIn } = useAuthStatus()
  const reducedMotion = usePrefersReducedMotion()

  const [active, setActive] = useState(0)
  const [previous, setPrevious] = useState<number | null>(null)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const inputModality = useInputModality()

  const pointerStartX = useRef<number | null>(null)
  const swiped = useRef(false)

  const goTo = useCallback(
    (index: number) => {
      const next = (index + total) % total
      if (next === active) return
      setPrevious(active)
      setActive(next)
    },
    [active, total]
  )

  // Troca automática. O efeito roda de novo a cada troca de banner, então
  // tocar num indicador também reinicia a contagem.
  const autoplay = total > 1 && !reducedMotion && !hovered && !focused
  useEffect(() => {
    if (!autoplay) return
    const timer = window.setTimeout(
      () => goTo(active + 1),
      HOME_BANNER_AUTOPLAY_MS
    )
    return () => window.clearTimeout(timer)
  }, [autoplay, active, goTo])

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointerStartX.current = event.clientX
    swiped.current = false
  }

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerStartX.current === null) return
    const deltaX = event.clientX - pointerStartX.current
    pointerStartX.current = null
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return
    swiped.current = true
    goTo(deltaX < 0 ? active + 1 : active - 1)
  }

  const handleBannerClick = (banner: HomeBanner, position: number) => {
    sendGAEvent('event', 'banner_click', {
      isLoggedIn,
      event_timestamp: new Date().toISOString(),
      title: banner.title,
      subtitle: banner.subtitle,
      id: banner.id,
      link: banner.href,
      position,
      ehFixo: true,
    })
  }

  if (total === 0) return null

  return (
    <section
      aria-roledescription="carrossel"
      aria-label="Destaques"
      className="px-4 pt-2 pb-6"
      // Só o mouse tem "em cima": no toque, o navegador emula mouseenter e
      // nunca o mouseleave, o que travaria a troca depois de tocar.
      onPointerEnter={event => {
        if (event.pointerType === 'mouse') setHovered(true)
      }}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(inputModality.current === 'keyboard')}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setFocused(false)
        }
      }}
    >
      {/* overflow-clip (e não hidden): o container não pode ser rolado por
          scrollIntoView/foco, o que deslocaria os banners. */}
      <div className="relative h-30 w-full overflow-clip rounded-2xl md:h-40">
        <div
          aria-live={autoplay ? 'off' : 'polite'}
          className="relative size-full touch-pan-y"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => {
            pointerStartX.current = null
          }}
          onClickCapture={event => {
            // Arrastar para trocar de banner não deve abrir o link.
            if (swiped.current) {
              event.preventDefault()
              event.stopPropagation()
              swiped.current = false
            }
          }}
        >
          {banners.map((banner, index) => {
            const offset = offsetFrom(index, active, total)
            const isActive = offset === 0
            // Só o banner que entra e o que sai deslizam; os outros mudam de
            // lado fora da área visível, sem animação.
            const animates = isActive || index === previous

            return (
              <div
                key={banner.id}
                role="group"
                aria-roledescription="banner"
                aria-label={`${index + 1} de ${total}`}
                aria-hidden={!isActive}
                inert={!isActive}
                className={cn(
                  'absolute inset-0',
                  isActive
                    ? 'translate-x-0'
                    : offset > 0
                      ? 'translate-x-full'
                      : '-translate-x-full',
                  animates &&
                    'transition-transform duration-500 ease-out motion-reduce:transition-none'
                )}
              >
                <HomeBannerSlide
                  banner={banner}
                  eager={index === 0}
                  onClick={() => handleBannerClick(banner, index + 1)}
                />
              </div>
            )
          })}
        </div>

        {total > 1 && (
          <div className="absolute bottom-[5px] left-1/2 z-10 flex -translate-x-1/2">
            {banners.map((banner, index) => {
              const isActive = index === active
              return (
                <button
                  key={banner.id}
                  type="button"
                  aria-label={`Mostrar banner ${index + 1} de ${total}`}
                  aria-current={isActive ? 'true' : undefined}
                  onClick={() => goTo(index)}
                  className="group flex h-4 w-2.5 cursor-pointer items-center justify-center outline-none"
                >
                  <span
                    className={cn(
                      'size-1.5 rounded-full transition-colors group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-white',
                      isActive ? 'bg-white' : 'bg-white/60'
                    )}
                  />
                </button>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
