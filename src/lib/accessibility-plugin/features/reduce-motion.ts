const CLASS = 'a11y-reduce-motion'

export const ReduceMotion = {
  apply(enabled: boolean): void {
    document.documentElement.classList.toggle(CLASS, enabled)
  },
  reset(): void {
    document.documentElement.classList.remove(CLASS)
  },
}
