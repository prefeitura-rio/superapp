'use client'

import { useSyncExternalStore } from 'react'

/**
 * Se o menu global está aberto, para quem vive fora dele.
 *
 * O menu é um diálogo modal: enquanto está aberto, o resto da página não
 * recebe cliques. O banner de cookies fica por cima do menu e, sem isso,
 * pareceria clicável, mas o toque cairia no item do menu que está embaixo.
 */
let isOpen = false
const listeners = new Set<() => void>()

export function setGlobalMenuOpen(open: boolean) {
  if (isOpen === open) return
  isOpen = open
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const getSnapshot = () => isOpen
const getServerSnapshot = () => false

export function useIsGlobalMenuOpen() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
