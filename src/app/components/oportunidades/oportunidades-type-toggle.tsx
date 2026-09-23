'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'

type OportunidadesType = 'cursos' | 'empregabilidade'

interface OportunidadesTypeToggleProps {
  activeType: OportunidadesType
}

const TABS = [
  { id: 'cursos', label: 'Cursos', href: '/servicos/cursos', enterFrom: 'left' },
  { id: 'empregabilidade', label: 'Trabalho', href: '/servicos/trabalho/', enterFrom: 'right' },
] as const

export function OportunidadesTypeToggle({
  activeType,
}: OportunidadesTypeToggleProps) {
  return (
    <>
      <style>{`
        @keyframes glowEnterLeft {
          from {
            opacity: 0;
            filter: blur(6px);
            transform: translateX(calc(-50% - 32px));
          }
          to {
            opacity: 1;
            filter: blur(0px);
            transform: translateX(calc(-50% - 16px));
          }
        }
        @keyframes glowEnterRight {
          from {
            opacity: 0;
            filter: blur(6px);
            transform: translateX(calc(-50% + 0px));
          }
          to {
            opacity: 1;
            filter: blur(0px);
            transform: translateX(calc(-50% - 16px));
          }
        }
        .glow-square {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .oportunidades-tab-active:hover .glow-square {
          transform: translateX(calc(-50% - 16px)) scale(1.08);
          box-shadow: 0.524px 0.524px 3.823px 0 rgba(255, 255, 255, 0.22) inset, 0 2.095px 17.28px 0 rgba(255, 255, 255, 0.42) !important;
        }
      `}</style>
      <div className="flex items-center gap-1 w-full">
        {TABS.map(tab => {
          const isActive = activeType === tab.id
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                'relative flex flex-1 items-center justify-center overflow-hidden rounded-full px-3 py-3',
                'text-sm font-medium leading-4 tracking-normal text-center transition-[filter] duration-300 ease-in-out',
                isActive
                  ? 'oportunidades-tab-active text-background hover:brightness-[1.08]'
                  : 'bg-background text-foreground-light hover:brightness-[0.97]'
              )}
              style={
                isActive
                  ? {
                      background: 'linear-gradient(180deg, #227BE7 0%, #2166BB 100%)',
                      boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.10)',
                    }
                  : {
                      boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.10)',
                    }
              }
            >
              {isActive && (
                <span
                  className="glow-square pointer-events-none absolute"
                  style={{
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(calc(-50% - 16px))',
                    width: '52.888px',
                    height: '51.841px',
                    borderRadius: '8.378px',
                    background: 'rgba(255, 255, 255, 0.10)',
                    boxShadow:
                      '0.524px 0.524px 3.823px 0 rgba(255, 255, 255, 0.13) inset, 0 2.095px 17.28px 0 rgba(255, 255, 255, 0.25)',
                    animation: `${tab.enterFrom === 'left' ? 'glowEnterLeft' : 'glowEnterRight'} 0.5s ease forwards`,
                  }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </>
  )
}
