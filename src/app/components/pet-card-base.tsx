import { DogPawIcon } from '@/assets/icons/dog-paw-icon'
import {
  PetCardBlobBottomLeft,
  PetCardBlobBottomMiddle,
  PetCardBlobTopLeft,
  PetCardBlobTopMiddle,
} from '@/assets/icons/pet-card-blob'
import type { ReactNode } from 'react'

interface PetCardBaseProps {
  children: ReactNode
  isBack?: boolean
  showShine?: boolean
  className?: string
  shineDirection?: 'left-to-right' | 'right-to-left'
}

export function PetCardBase({
  children,
  isBack = false,
  showShine = false,
  className = '',
  shineDirection = 'left-to-right',
}: PetCardBaseProps) {
  const generatePawPattern = () => {
    const paws = []
    const rows = 20
    const cols = 20

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const offsetY = col * -12
        const offsetX = row * 36
        const x = col * 50 + offsetX - 200
        const y = row * 40 + offsetY - 100

        paws.push(
          <div
            key={`paw-${row}-${col}`}
            className="absolute opacity-10"
            style={{
              left: `${x}px`,
              top: `${y}px`,
            }}
          >
            <DogPawIcon className="w-6 h-6" />
          </div>
        )
      }
    }

    return paws
  }

  return (
    <div
      className={`block w-full rounded-3xl shadow-md text-orange-900 relative overflow-hidden ${className}`}
      style={{ backgroundColor: '#FFF0DF' }}
    >
      <div className="absolute inset-0 pointer-events-none">
        {generatePawPattern()}
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <PetCardBlobTopLeft className="absolute top-0 left-0" />
        <PetCardBlobBottomLeft className="absolute -bottom-1 -left-2" />
        <PetCardBlobTopMiddle className="absolute top-0 right-0" />
        <PetCardBlobBottomMiddle className="absolute bottom-0 right-0" />
      </div>

      <div className="p-6 justify-between flex flex-col relative z-10">
        <div className="flex h-full min-h-[140px] min-w-[262px] flex-col justify-between">
          {children}
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        <div
          className={`shine-animation ${showShine ? 'shine-active' : ''} ${
            shineDirection === 'right-to-left' ? 'shine-reverse' : ''
          }`}
        />
      </div>
    </div>
  )
}
