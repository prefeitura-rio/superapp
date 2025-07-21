'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EyeIcon } from 'lucide-react'
import Image, { type StaticImageData } from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface WalletSocialAssistanceCardProps {
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
  // Additional props for CRAS data
  crasName?: string
  address?: string
  phone?: string
}

export function WalletSocialAssistanceCard({
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
  crasName,
  address,
  phone,
  gapClass = `${showEyeButton ? 'gap-0' : 'gap-8'}`,
}: WalletSocialAssistanceCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <Link href={href}>
      <div className="card__flip__container">
        <div className={`card${showDetails ? ' flipped' : ''}`} id="card">
          <div className="card-front">
            <div className="block w-full bg-wallet-2 rounded-3xl shadow-md text-white">
              <div className="p-6 justify-between flex flex-col">
                <div className="flex h-full min-h-[140px] flex-col justify-between">
                  <div className="flex -mt-1 h-[70px] justify-between items-start">
                    <div className="w-full">
                      <div className="flex justify-between items-center  w-full">
                        <h3 className="text-xs font-normal">{title}</h3>
                        {statusValue === 'Atualizar' && (
                          <Badge className="bg-destructive">Atualizar</Badge>
                        )}
                        {statusValue === 'Atualizado' && (
                          <Badge className="bg-success">Atualizado</Badge>
                        )}
                        {statusValue === 'Em andamento' && (
                          <Badge className="bg-card-5">Em atualização</Badge>
                        )}
                      </div>
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
                      <span className="text-xs" title={extraLabel}>
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
                        className="rounded-full bg-wallet-2b size-10 hover:bg-wallet-2b hover:cursor-pointer"
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
            <div className="block w-full bg-wallet-2 rounded-3xl shadow-md text-white">
              <div className="p-6 justify-between flex flex-col">
                <div className="flex h-full min-h-[140px] flex-col justify-between">
                  <div>
                    <span className="text-sm block">
                      {crasName || 'CRAS não disponível'}
                    </span>
                    <span className="text-sm block">
                      {/* Rua Silveira Martins 161 */}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm opacity-60 block">Endereço</span>
                    <span className="text-sm block">
                      {address || 'Endereço não disponível'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm opacity-60 block">
                        Telefone da unidade
                      </span>
                      <span className="text-sm block">
                        {phone || 'Telefone não disponível'}
                      </span>
                    </div>
                    <Button
                      className="rounded-full bg-wallet-2b size-10 hover:bg-wallet-2b hover:cursor-pointer"
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
    </Link>
  )
}
