'use client'

import { Button } from '@/components/ui/button'
import { mapRiskToColor } from '@/lib/health-unit-utils'
import { EyeIcon, InfoIcon } from 'lucide-react'
import Image, { type StaticImageData } from 'next/image'
import { useEffect, useState } from 'react'
import { WalletHealthStatusDrawerContent } from './drawer-contents/wallet-health-status-drawer-content'

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
  risco?: string
  address?: string
  phone?: string
  email?: string
}

const statusBgClassMap: Record<string, string> = {
  verde: 'bg-card-3',
  amarelo: 'bg-card-5',
  laranja: 'bg-card-5',
  vermelho: 'bg-destructive',
}

export function WalletHealthCard({
  href,
  title,
  name,
  statusLabel,
  statusValue,
  extraLabel,
  extraValue,
  icon,
  showStatusIcon = false,
  showEyeButton = false,
  showInfoButton = false,
  risco,
  address,
  phone,
  email,
  gapClass = `${showEyeButton ? 'gap-0' : 'gap-8'}`,
}: WalletHealthCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [showStatusSheet, setShowStatusSheet] = useState(false)
  const [dragStartX, setDragStartX] = useState<number | null>(null)
  const [currentX, setCurrentX] = useState<number | null>(null)
  const [shineActive, setShineActive] = useState(false)

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'touch') {
      e.preventDefault()
      setDragStartX(e.clientX)
      setCurrentX(e.clientX)
      e.currentTarget.setPointerCapture(e.pointerId)
    }
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'touch' && dragStartX !== null) {
      setCurrentX(e.clientX)
    }
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'touch' && dragStartX !== null && currentX !== null) {
      const deltaX = currentX - dragStartX

      if (Math.abs(deltaX) > 50) {
        setShowDetails(prev => !prev)
      }
    }

    setDragStartX(null)
    setCurrentX(null)

    if (e.pointerType === 'touch') {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }

  useEffect(() => {
    setShineActive(true)

    const timeout = setTimeout(() => {
      setShineActive(false)
    }, 1000) // duração total da animação (ajuste se quiser)

    return () => clearTimeout(timeout)
  }, [showDetails])

  return (
    <div className="card__flip__container cursor-pointer inline-block touch-none">
      <div
        className={`card${showDetails ? ' flipped' : ''} cursor-pointer touch-none`}
        id="card"
        onClick={() => setShowDetails(!showDetails)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="card-front">
          <div className="block w-full bg-[#3F6194] rounded-3xl shadow-md text-white relative overflow-hidden">
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
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Status Info"
                            className="hover:bg-transparent hover:cursor-pointer"
                            onClick={e => {
                              e.stopPropagation()
                              setShowStatusSheet(true)
                            }}
                          >
                            <InfoIcon className="h-4 w-4" />
                          </Button>

                          <WalletHealthStatusDrawerContent
                            open={showStatusSheet}
                            onOpenChange={setShowStatusSheet}
                            statusValue={statusValue}
                            risco={risco}
                          />
                        </>
                      )}
                    </div>
                    <div className="flex items-center mt-1">
                      {showStatusIcon && statusValue !== 'Fechado' && (
                        <span
                          className={`w-2.5 h-2.5 mr-1 rounded-full ${statusBgClassMap[mapRiskToColor(risco ?? '')] || ''} border-2 border-card`}
                        />
                      )}
                      <span className="text-sm font-normal">{statusValue}</span>
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
                      <span className="text-sm font-normal">{extraValue}</span>
                    </div>
                  </div>
                  {showEyeButton && (
                    <Button
                      className="rounded-full bg-wallet-1b size-10 hover:bg-wallet-1b hover:cursor-pointer"
                      onClick={e => {
                        e.stopPropagation()
                        setShowDetails(true)
                      }}
                    >
                      <EyeIcon className="h-6 w-6 [&_svg]:size-6" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="absolute -bottom-35 -right-35 w-80 h-80 bg-white opacity-20 rounded-full blur-2xl pointer-events-none" />

            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div
                className={`shine-animation ${shineActive ? 'shine-active' : ''}`}
              />
            </div>
          </div>
        </div>
        <div className="card-back">
          <div className="block w-full bg-[#3F6194] rounded-3xl shadow-md text-white relative overflow-hidden">
            <div className="p-6 justify-between flex flex-col">
              <div className="flex h-full min-h-[140px] flex-col justify-between">
                <div>
                  <span className="text-sm opacity-70 block">Endereço</span>
                  <span className="text-sm block">
                    {address || 'Endereço não disponível'}
                  </span>
                </div>
                <div>
                  <span className="text-sm opacity-70 block">
                    Telefone da unidade
                  </span>
                  <span className="text-sm block">
                    {phone || 'Telefone não disponível'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm opacity-70 block">
                      Email da unidade
                    </span>
                    <span className="text-sm block">
                      {email || 'Email não disponível'}
                    </span>
                  </div>
                  <Button
                    className="rounded-full bg-wallet-1b size-10 hover:bg-wallet-1b hover:cursor-pointer"
                    onClick={e => {
                      e.stopPropagation()
                      setShowDetails(false)
                    }}
                  >
                    <EyeIcon className="h-6 w-6 [&_svg]:size-6" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="absolute -top-45 -left-35 w-80 h-80 bg-white opacity-20 rounded-full blur-2xl pointer-events-none" />

            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div
                className={`shine-animation ${shineActive ? 'shine-active' : ''}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Indicadores */}
      <div className="flex gap-2 mt-3 justify-center">
        <button
          type="button"
          onClick={e => {
            e.stopPropagation()
            setShowDetails(false)
          }}
          className={`w-2.5 h-2.5 rounded-full transition-colors ${
            !showDetails ? 'bg-blue-500' : 'bg-gray-300'
          }`}
        />
        <button
          type="button"
          onClick={e => {
            e.stopPropagation()
            setShowDetails(true)
          }}
          className={`w-2.5 h-2.5 rounded-full transition-colors ${
            showDetails ? 'bg-blue-500' : 'bg-gray-300'
          }`}
        />
      </div>
    </div>
  )
}
