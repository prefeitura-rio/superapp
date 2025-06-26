'use client'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { EyeIcon, InfoIcon } from 'lucide-react'
import Image, { type StaticImageData } from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { capitalizeFirstLetter } from './utils'

interface WalletHealthCardProps {
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

const statusBgClassMap: Record<string, string> = {
  verde: 'bg-card-3',
  amarelo: 'bg-card-5',
  laranja: 'bg-card-5',
  vermelho: 'bg-destructive',
}
const statusTextClassMap: Record<string, string> = {
  verde: 'text-card-3',
  amarelo: 'text-card-5',
  laranja: 'text-card-5',
  vermelho: 'text-destructive',
}

export function WalletHealthCard({
  href,
  title,
  name,
  statusLabel,
  statusValue,
  extraLabel,
  extraValue,
  bgClass,
  icon,
  showStatusIcon = false,
  showEyeButton = false,
  showInfoButton = false,
  color,
  gapClass = `${showEyeButton ? 'gap-0' : 'gap-8'}`,
}: WalletHealthCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <Link href={href}>
      <div className="card__flip__container">
        <div className={`card${showDetails ? ' flipped' : ''}`} id="card">
          <div className="card-front">
            <div className="block w-full bg-wallet-1 rounded-3xl shadow-md text-white">
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
                        {showInfoButton && (
                          <Drawer>
                            <DrawerTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Status Info"
                                className="hover:bg-transparent hover:cursor-pointer"
                              >
                                <InfoIcon className="h-4 w-4" />
                              </Button>
                            </DrawerTrigger>
                            <DrawerContent className="p-8 max-w-md mx-auto !rounded-t-3xl">
                              <div className="flex justify-center pt-0 pb-1">
                                <div className="w-8.5 h-1 -mt-2 rounded-full bg-popover-line" />
                              </div>
                              <DrawerHeader className="sr-only">
                                <DrawerTitle>título</DrawerTitle>
                              </DrawerHeader>
                              <div className="flex items-center gap-2 mb-2">
                                <span
                                  className={`inline-block w-4 h-4 rounded-full ${statusBgClassMap[color ?? ''] || ''} border-3 border-background/60`}
                                />
                                <span
                                  className={`${statusTextClassMap[color ?? ''] || ''} font-medium text-lg`}
                                >
                                  {color && capitalizeFirstLetter(color)}
                                </span>
                              </div>
                              <div className="text-base text-black mt-2">
                                {color === 'verde' &&
                                  'A Clínica está funcionando normalmente. Os atendimentos seguem como de costume, com todos os serviços.'}
                                {color === 'amarelo' &&
                                  'Essa área está com risco moderado. A equipe de saúde continuará trabalhando, mas não realizará visitas domiciliares.'}
                                {color === 'laranja' &&
                                  'Essa área estava em situação de risco alto, e passa por reavaliação de segurança. Os atendimentos seguem somente dentro da unidade.'}
                                {color === 'vermelho' &&
                                  'Essa área está em situação de risco grave. A unidade será fechada por segurança. Consulte a situação da unidade dentro de algumas horas.'}
                              </div>
                            </DrawerContent>
                          </Drawer>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {showStatusIcon && (
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${statusBgClassMap[color ?? ''] || ''} border-2 border-card`}
                          />
                        )}
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
                        className="rounded-full bg-wallet-1b size-10 hover:bg-wallet-1b hover:cursor-pointer"
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
            <div className="block w-full bg-wallet-1 rounded-3xl shadow-md text-white">
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
                      className="rounded-full bg-wallet-1b size-10 hover:bg-wallet-1b hover:cursor-pointer"
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
