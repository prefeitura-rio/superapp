const CLASS = 'a11y-highlight-links'

export const HighlightLinks = {
  apply(enabled: boolean): void {
    document.documentElement.classList.toggle(CLASS, enabled)
  },
  reset(): void {
    document.documentElement.classList.remove(CLASS)
  },
}
