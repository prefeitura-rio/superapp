'use client'

import { useCallback, useEffect, useRef } from 'react'

export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    isDragging.current = true
    startX.current = e.pageX - ref.current.offsetLeft
    scrollLeft.current = ref.current.scrollLeft
    ref.current.style.cursor = 'grabbing'
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !ref.current) return
    e.preventDefault()
    const x = e.pageX - ref.current.offsetLeft
    const walk = x - startX.current
    ref.current.scrollLeft = scrollLeft.current - walk
  }, [])

  const onMouseUp = useCallback(() => {
    isDragging.current = false
    if (ref.current) ref.current.style.cursor = ''
  }, [])

  // Imagens e links são arrastáveis por padrão: o drag nativo do navegador
  // engoliria o mouseup e deixaria o cursor preso em "grabbing".
  const onDragStart = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  // O botão pode ser solto sem que o mouseup chegue ao contêiner; a window
  // sempre o recebe, então o arraste termina ali também.
  useEffect(() => {
    window.addEventListener('mouseup', onMouseUp)
    return () => window.removeEventListener('mouseup', onMouseUp)
  }, [onMouseUp])

  return {
    ref,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave: onMouseUp,
    onDragStart,
  }
}
