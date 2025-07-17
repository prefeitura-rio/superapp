import type { ReactNode } from 'react'

interface CardBaseProps {
  children: ReactNode
  bgColor?: string
  isBack?: boolean
  showShine?: boolean
  className?: string
  shineDirection?: 'left-to-right' | 'right-to-left'
}

export function CardBase({
  children,
  bgColor = 'bg-[#3F6194]',
  isBack = false,
  showShine = false,
  className = '',
  shineDirection = 'left-to-right',
}: CardBaseProps) {
  return (
    <div
      className={`block w-full ${bgColor} rounded-3xl shadow-md text-white relative overflow-hidden ${className}`}
    >
      <div className="p-6 justify-between flex flex-col">
        <div className="flex h-full min-h-[140px] flex-col justify-between">
          {children}
        </div>
      </div>

      {/* Blur circle - posição diferente para frente e verso */}
      <div
        className={`absolute w-80 h-80 bg-white opacity-20 rounded-full blur-2xl pointer-events-none ${
          isBack ? '-top-45 -left-35' : '-bottom-48 -right-35'
        }`}
      />

      {/* Shine animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className={`shine-animation ${showShine ? 'shine-active' : ''} ${
            shineDirection === 'right-to-left' ? 'shine-reverse' : ''
          }`}
        />
      </div>
    </div>
  )
}
