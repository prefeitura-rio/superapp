import Image, { type StaticImageData } from 'next/image'
import Link from 'next/link'

interface WalletCardProps {
  href: string
  title: string
  name?: string
  statusLabel: string
  statusValue: string
  extraLabel: string
  extraValue: string
  bgClass: string
  icon?: { src: StaticImageData; alt: string }
  gapClass?: string
}

export function WalletCard({
  href,
  title,
  name,
  statusLabel,
  statusValue,
  extraLabel,
  extraValue,
  bgClass,
  icon,
  gapClass = 'gap-8',
}: WalletCardProps) {
  return (
    <Link
      href={href}
      className={`block w-full ${bgClass} rounded-3xl shadow-md text-black`}
    >
      <div className="p-6 h-full flex flex-col">
        <div className="flex h-[70px] justify-between items-start">
          <div>
            <h3 className="text-sm font-medium">{title}</h3>
            {name && <h2 className="text-lg font-medium">{name}</h2>}
          </div>
          {icon && (
            <div className="h-10 w-20 relative">
              <Image
                src={icon.src}
                alt={icon.alt}
                width={80}
                height={40}
                className="object-contain"
              />
            </div>
          )}
        </div>
        <div className={`mt-4 flex ${gapClass}`}>
          <div>
            <span className="text-xs block">{statusLabel}</span>
            <span className="text-sm font-medium">{statusValue}</span>
          </div>
          <div>
            <span className="text-xs block">{extraLabel}</span>
            <span className="text-sm font-medium">{extraValue}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
