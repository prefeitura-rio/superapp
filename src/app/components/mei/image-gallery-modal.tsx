'use client'

import { ChevronLeftIcon, ChevronRightIcon, XIcon } from '@/assets/icons'
import { cn } from '@/lib/utils'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import Image from 'next/image'
import { useCallback, useEffect } from 'react'

import type { MeiAttachment } from './attachment-gallery'

interface ImageGalleryModalProps {
  attachments: MeiAttachment[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onNavigate: (index: number) => void
}

export function ImageGalleryModal({
  attachments,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}: ImageGalleryModalProps) {
  const hasMultipleImages = attachments.length > 1
  const canGoPrevious = currentIndex > 0
  const canGoNext = currentIndex < attachments.length - 1

  const handlePrevious = useCallback(() => {
    if (canGoPrevious) {
      onNavigate(currentIndex - 1)
    }
  }, [canGoPrevious, currentIndex, onNavigate])

  const handleNext = useCallback(() => {
    if (canGoNext) {
      onNavigate(currentIndex + 1)
    }
  }, [canGoNext, currentIndex, onNavigate])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handlePrevious, handleNext])

  if (attachments.length === 0) return null

  const currentAttachment = attachments[currentIndex]

  return (
    <DialogPrimitive.Root
      open={isOpen}
      onOpenChange={open => !open && onClose()}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          onClick={onClose}
        />
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onPointerDownOutside={onClose}
        >
          <DialogPrimitive.Title className="sr-only">
            Galeria de imagens
          </DialogPrimitive.Title>
          <div className="relative w-full max-w-3xl max-md:max-w-[calc(100vw-2rem)]">
            <button
              type="button"
              onClick={onClose}
              className="absolute -top-10 right-0 md:-right-10 z-10 p-2 text-foreground transition-opacity hover:opacity-70"
              aria-label="Fechar galeria"
            >
              <XIcon className="h-6 w-6 text-white" />
            </button>

            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-black max-md:aspect-square">
              {currentAttachment && (
                <Image
                  src={currentAttachment.url}
                  alt={currentAttachment.name}
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 768px) 100vw, 768px"
                />
              )}

              {hasMultipleImages && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={!canGoPrevious}
                    className={cn(
                      'absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition-all',
                      canGoPrevious
                        ? 'opacity-100 hover:bg-white'
                        : 'pointer-events-none opacity-0'
                    )}
                    aria-label="Imagem anterior"
                  >
                    <ChevronLeftIcon className="h-6 w-6 text-black" />
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canGoNext}
                    className={cn(
                      'absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition-all',
                      canGoNext
                        ? 'opacity-100 hover:bg-white'
                        : 'pointer-events-none opacity-0'
                    )}
                    aria-label="Próxima imagem"
                  >
                    <ChevronRightIcon className="h-6 w-6 text-black" />
                  </button>
                </>
              )}
            </div>

            {hasMultipleImages && (
              <div className="mt-4 flex justify-center gap-2">
                {attachments.map((_, index) => (
                  <button
                    type="button"
                    key={attachments[index].id}
                    onClick={() => onNavigate(index)}
                    className={cn(
                      'h-2 w-2 rounded-full transition-all',
                      index === currentIndex
                        ? 'bg-white w-4'
                        : 'bg-white/40 hover:bg-white/60'
                    )}
                    aria-label={`Ir para imagem ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
