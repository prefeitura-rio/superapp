'use client'

import { Button } from '@/components/ui/button'
import { TransitionLink } from '@/components/ui/transition-link'
import { EyeIcon } from 'lucide-react'
import Image, { type StaticImageData } from 'next/image'
import { useState } from 'react'

interface WalletEducationCardProps {
  href: string
  title: string
  name?: string
  statusLabel: string
  statusValue: string
  extraLabel: string
  extraValue: string
  bgClass?: string
  icon?: { src: StaticImageData; alt: string }
  gapClass?: string
  showStatusIcon?: boolean
  showEyeButton?: boolean
  showInfoButton?: boolean
  color?: string
}

export function WalletEducationCard({
  href,
  title,
  name,
  statusLabel,
  statusValue,
  extraLabel,
  extraValue,
  bgClass,
  icon,
  showEyeButton = false,
  gapClass = `${showEyeButton ? 'gap-0' : 'gap-8'}`,
}: WalletEducationCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <TransitionLink href={href}>
      <div className="card__flip__container">
        <div className={`card${showDetails ? ' flipped' : ''}`} id="card">
          <div className="card-front">
            <div className="block w-full bg-wallet-4 rounded-3xl shadow-md text-white">
              <div className="p-6 justify-between flex flex-col">
                <div className="flex h-full min-h-[140px] flex-col justify-between">
                  <div className="flex h-[70px] justify-between items-start">
                    <div>
                      <h3 className="text-xs font-normal">{title}</h3>
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
                  <div
                    className={`mt-4 flex ${gapClass} items-start ${showEyeButton ? 'justify-between' : ''}`}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <span className="text-xs block">{statusLabel}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-sm font-normal">
                          {statusValue}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span
                        className={`text-xs${showEyeButton ? ' block max-[321px]:truncate max-[321px]:max-w-[100px]' : ''}`}
                        title={extraLabel}
                      >
                        {extraLabel}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-normal">
                          {extraValue}
                        </span>
                      </div>
                    </div>
                    {showEyeButton && (
                      <Button
                        className="rounded-full bg-wallet-4b size-10 hover:bg-wallet-4b hover:cursor-pointer"
                        onClick={() => setShowDetails(true)}
                      >
                        <EyeIcon className="h-6 w-6 [&_svg]:size-6" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card-back">
            <div className="block w-full bg-wallet-4 rounded-3xl shadow-md text-white">
              <div className="p-6 justify-between flex flex-col">
                <div className="flex h-full min-h-[140px] flex-col justify-between">
                  <div>
                    <span className="text-sm opacity-70 block">Endereço</span>
                    <span className="text-sm block">
                      Rua Silveira Martins 161
                    </span>
                  </div>
                  <div>
                    <span className="text-sm opacity-70 block">
                      Telefone da unidade
                    </span>
                    <span className="text-sm block">(21) 3613-8346</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm opacity-70 block">
                        Email da unidade
                      </span>
                      <span className="text-sm block">cmsmjf@gmail.com</span>
                    </div>
                    <Button
                      className="rounded-full bg-wallet-4b size-10 hover:bg-wallet-4b hover:cursor-pointer"
                      onClick={() => setShowDetails(false)}
                    >
                      <EyeIcon className="h-6 w-6 [&_svg]:size-6" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TransitionLink>
  )
}
