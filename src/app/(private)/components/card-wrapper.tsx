'use client'

import type { ReactNode } from 'react'
import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useState,
} from 'react'

const isTouchEvent = (e: React.PointerEvent) => e.pointerType === 'touch'
const frontAnimationDirection = 'left-to-right'
const backAnimationDirection = 'right-to-left'

interface CardWrapperProps {
  frontCard: ReactNode
  backCard: ReactNode
  enableFlip?: boolean
  className?: string
  showInitialShine?: boolean
}

export function CardWrapper({
  frontCard,
  backCard,
  enableFlip = true,
  showInitialShine = true,
  className = '',
}: CardWrapperProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [dragStartX, setDragStartX] = useState<number | null>(null)
  const [currentX, setCurrentX] = useState<number | null>(null)
  const [shineActive, setShineActive] = useState(false)

  const performFlip = () => {
    setShowDetails(prev => !prev)
    triggerShine()
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!isTouchEvent(e)) return

    e.preventDefault()
    setDragStartX(e.clientX)
    setCurrentX(e.clientX)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const triggerShine = useCallback(() => {
    setShineActive(true)
    setTimeout(() => setShineActive(false), 500)
  }, [])

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!enableFlip) return

    if (isTouchEvent(e) && dragStartX !== null) {
      setCurrentX(e.clientX)
    }
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const isValidDragEvent =
      isTouchEvent(e) && dragStartX !== null && currentX !== null

    if (!isValidDragEvent) {
      resetDragState()
      return
    }

    const deltaX = currentX - dragStartX
    const shouldFlip = Math.abs(deltaX) > 50
    if (shouldFlip) {
      performFlip()
    }

    resetDragState()
  }

  const resetDragState = () => {
    setDragStartX(null)
    setCurrentX(null)
  }

  function handleClick() {
    performFlip()
  }

  const enhanceCard = (card: ReactNode) => {
    if (isValidElement(card)) {
      const direction = showDetails
        ? backAnimationDirection
        : frontAnimationDirection
      return cloneElement(card, {
        ...(typeof card.props === 'object' ? card.props : {}),
        showShine: shineActive as boolean,
        shineDirection: direction as string,
      } as any) // Custom Props
    }
    return card
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <unnecessary>
  useEffect(() => {
    if (showInitialShine) {
      triggerShine()
    }
  }, [showInitialShine])

  if (!enableFlip) {
    return <div className={className}>{frontCard}</div>
  }

  return (
    <div
      className={`card__flip__container cursor-pointer inline-block touch-none ${className}`}
    >
      <div
        className={`card${showDetails ? ' flipped' : ''} cursor-pointer touch-none`}
        id="card"
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="card-front">{enhanceCard(frontCard)}</div>
        <div className="card-back">{enhanceCard(backCard)}</div>
      </div>

      {/* Indicadores */}
      <div className="flex gap-2 mt-3 justify-center">
        <button
          type="button"
          onClick={e => {
            e.stopPropagation()
            setShowDetails(false)
            triggerShine()
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
            triggerShine()
          }}
          className={`w-2.5 h-2.5 rounded-full transition-colors ${
            showDetails ? 'bg-blue-500' : 'bg-gray-300'
          }`}
        />
      </div>
    </div>
  )
}
