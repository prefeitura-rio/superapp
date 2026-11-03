const CLASS = 'a11y-hide-images'

export const HideImages = {
  apply(enabled: boolean): void {
    document.documentElement.classList.toggle(CLASS, enabled)
  },
  reset(): void {
    document.documentElement.classList.remove(CLASS)
  },
}
