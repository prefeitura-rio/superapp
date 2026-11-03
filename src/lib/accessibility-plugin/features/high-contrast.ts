const CLASS = 'a11y-high-contrast'

export const HighContrast = {
  apply(enabled: boolean): void {
    document.documentElement.classList.toggle(CLASS, enabled)
  },
  reset(): void {
    document.documentElement.classList.remove(CLASS)
  },
}
