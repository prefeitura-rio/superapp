import type { AnimationType } from './animation-type'

export interface PageTransitionsConfiguration {
  wrapperClassName?: string
  animation: {
    type: AnimationType
    duration: number
  }
}
