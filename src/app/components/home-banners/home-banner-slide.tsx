import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import type { HomeBanner, HomeBannerShape } from './home-banners'

/** Rotação das três formas decorativas, por tipo de banner. */
const shapeClassName: Record<HomeBannerShape, string> = {
  circle: 'rounded-full',
  diamond: 'rotate-45',
  'tilted-square': 'rotate-20',
}

/** Do maior para o menor: tamanho, raio (quando não é círculo) e opacidade. */
const shapeLayers = [
  { size: 'size-60 md:size-105', radius: 'rounded-4xl', fill: 'bg-white/7' },
  { size: 'size-42.5 md:size-75', radius: 'rounded-3xl', fill: 'bg-white/10' },
  { size: 'size-25 md:size-45', radius: 'rounded-2xl', fill: 'bg-white/12' },
]

type HomeBannerSlideProps = {
  banner: HomeBanner
  eager?: boolean
  onClick?: () => void
}

export function HomeBannerSlide({
  banner,
  eager = false,
  onClick,
}: HomeBannerSlideProps) {
  const { illustration } = banner

  return (
    <Link
      href={banner.href}
      onClick={onClick}
      draggable={false}
      className={cn(
        'relative block size-full overflow-clip rounded-2xl text-white outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-white',
        banner.backgroundClassName
      )}
    >
      {/* Formas decorativas, concêntricas, atrás da ilustração */}
      {shapeLayers.map(layer => (
        <span
          key={layer.size}
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute top-1/2 left-[79%] -translate-x-1/2 -translate-y-1/2 md:left-[75%]',
            layer.size,
            layer.fill,
            banner.shape === 'circle' ? undefined : layer.radius,
            shapeClassName[banner.shape]
          )}
        />
      ))}

      <Image
        src={illustration.src}
        width={illustration.width}
        height={illustration.height}
        alt={illustration.alt}
        sizes={illustration.sizes}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : undefined}
        draggable={false}
        className={cn(
          'pointer-events-none absolute h-auto max-w-none -translate-x-1/2 select-none',
          illustration.className
        )}
      />

      <span className="absolute top-4 right-[42%] left-6 flex flex-col md:top-6 md:right-6">
        <span className="text-base leading-5 font-medium md:text-2xl md:leading-8">
          {banner.title}
        </span>
        <span
          className={cn(
            'text-xs leading-4 md:text-base md:leading-6 md:font-light',
            banner.subtitleClassName
          )}
        >
          <span className="md:hidden">{banner.subtitle}</span>
          <span className="hidden md:inline">{banner.subtitleWide}</span>
        </span>
      </span>

      <span
        className={cn(
          'absolute bottom-4 left-6 inline-flex h-5 items-center rounded-full bg-white px-3 text-xs leading-4 md:bottom-6 md:h-9 md:px-5 md:text-sm md:leading-5',
          banner.ctaClassName
        )}
      >
        {banner.cta}
      </span>
    </Link>
  )
}
