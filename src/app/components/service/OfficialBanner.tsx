'use client'

import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  brasaoPrefHeaderIcon,
  logoPrefHeaderIcon,
} from '@/constants/bucket/logos'
import { ChevronDown, Globe, Lock } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

const OFFICIAL_BANNER_HIDDEN_KEY = 'official-banner-hidden'

interface OfficialBannerProps {
  onHeightChange?: (height: number) => void
}

export function OfficialBanner({ onHeightChange }: OfficialBannerProps = {}) {
  const [expanded, setExpanded] = useState(false)
  const [hidden, setHidden] = useState(true)
  const [mounted, setMounted] = useState(false)
  const bannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkBannerVisibility = () => {
      try {
        const isHidden = localStorage.getItem(OFFICIAL_BANNER_HIDDEN_KEY)
        if (isHidden === 'true') {
          setHidden(true)
        } else {
          setHidden(false)
        }
      } catch (error) {
        console.error('Error checking banner visibility:', error)
        setHidden(false)
      }
      setMounted(true)
    }

    checkBannerVisibility()
  }, [])

  const handleClose = () => {
    try {
      localStorage.setItem(OFFICIAL_BANNER_HIDDEN_KEY, 'true')
      setHidden(true)
    } catch (error) {
      console.error('Error saving banner state:', error)
      setHidden(true)
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <unnecessary>
  useEffect(() => {
    if (!onHeightChange) return

    const updateHeight = () => {
      if (hidden) {
        onHeightChange(0)
      } else if (bannerRef.current) {
        onHeightChange(bannerRef.current.offsetHeight)
      }
    }

    updateHeight()

    // Observer to detect changes in height (expansion/collapse)
    const resizeObserver = new ResizeObserver(updateHeight)
    if (bannerRef.current) {
      resizeObserver.observe(bannerRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [hidden, expanded, onHeightChange, mounted])

  if (hidden) return null

  return (
    <div ref={bannerRef} className="w-full sticky top-0 z-[60] bg-background">
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <div className="bg-card h-[75px] md:h-[45px] py-3 flex items-center justify-center rounded-none">
          <div className="w-full max-w-[584px] px-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex-shrink-0">
                {/* Logo mobile/tablet */}
                <Image
                  src={logoPrefHeaderIcon}
                  alt="Logo Prefeitura do Rio de Janeiro"
                  width={45}
                  height={55}
                  className="md:hidden object-contain"
                  priority
                />
                {/* Logo desktop */}
                <Image
                  src={brasaoPrefHeaderIcon}
                  alt="Brasão Prefeitura do Rio de Janeiro"
                  width={40}
                  height={40}
                  className="hidden md:block object-contain"
                  priority
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-terciary-foreground text-sm md:text-xs">
                  Página oficial da Prefeitura do Rio de Janeiro.
                </p>

                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-primary text-sm underline cursor-pointer md:text-xs"
                  >
                    <span>Saiba mais</span>
                    <ChevronDown
                      className={`w-4 h-4 md:w-3 md:h-3 transition-transform duration-200 ${
                        expanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </CollapsibleTrigger>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="text-foreground hover:text-muted-foreground transition-colors flex-shrink-0 text-sm md:text-xs"
              aria-label="Fechar banner"
            >
              x
            </button>
          </div>
        </div>

        <CollapsibleContent>
          <div className="bg-card">
            <div className="w-full max-w-[584px] mx-auto px-4 py-4 space-y-4">
              {/* Item 1*/}
              <div className="flex gap-3">
                <Globe className="w-5 h-5 text-foreground flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-foreground font-medium leading-4 text-sm">
                    Endereços oficiais terminam com{' '}
                    <Badge className="bg-primary text-background">.rio</Badge>
                  </p>
                  <p className="text-terciary-foreground text-sm">
                    Os órgãos da Prefeitura utilizam sites com esse domínio.
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex gap-3">
                <Lock className="w-5 h-5 text-foreground flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-foreground font-medium leading-4 text-sm">
                    Sites seguros usam{' '}
                    <Badge className="bg-primary text-background">
                      https://
                    </Badge>
                  </p>
                  <p className="text-terciary-foreground text-sm">
                    Procure pelo ícone de cadeado ou pelo prefixo acima antes de
                    inserir dados pessoais.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
