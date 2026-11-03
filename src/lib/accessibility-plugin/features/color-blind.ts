const CLASS = 'a11y-color-blind'

export const ColorBlind = {
  apply(enabled: boolean): void {
    document.documentElement.classList.toggle(CLASS, enabled)
  },
  reset(): void {
    document.documentElement.classList.remove(CLASS)
  },
}
