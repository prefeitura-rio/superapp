const SCALES = ['100%', '115%', '130%'] as const

export const FontSize = {
  apply(level: 0 | 1 | 2): void {
    document.documentElement.style.setProperty(
      '--a11y-font-scale',
      SCALES[level]
    )
  },
  reset(): void {
    document.documentElement.style.removeProperty('--a11y-font-scale')
  },
}
