import { ChevronRightIcon } from '@/assets/icons'
import Image from 'next/image'

interface MicroshippingStatusCardProps {
  href: string
}

export function MicroshippingStatusCard({ href }: MicroshippingStatusCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-4 py-4 px-6 rounded-lg items-center bg-card mx-4 cursor-pointer transition-opacity hover:opacity-90 no-underline text-inherit"
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-md">
        <Image
          src="https://storage.googleapis.com/rj-escritorio-dev-public/superapp/png/card%20icons/microchip.png"
          alt="Ícone de microchipagem pendente"
          width={40}
          height={40}
          className="min-w-10 min-h-10"
        />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-normal text-foreground leading-5">
          Microchipagem pendente
        </h3>
        <p className="text-xs text-muted-foreground leading-4">
          Seu pet identificado e protegido. Com o microchip, fica fácil
          encontrá-lo se ele se perder.
        </p>
      </div>

      <div className="shrink-0">
        <ChevronRightIcon className="w-5 h-5 text-foreground" />
      </div>
    </a>
  )
}
