const LETTER_SPACING = ['0em', '0.05em', '0.12em'] as const
const LINE_HEIGHT = ['normal', '1.65', '2.0'] as const

const PROP_LS = '--a11y-letter-spacing'
const PROP_LH = '--a11y-line-height'

export const LetterSpacing = {
  applyLetterSpacing(level: 0 | 1 | 2): void {
    document.documentElement.style.setProperty(PROP_LS, LETTER_SPACING[level])
  },
  applyLineHeight(level: 0 | 1 | 2): void {
    document.documentElement.style.setProperty(PROP_LH, LINE_HEIGHT[level])
  },
  reset(): void {
    document.documentElement.style.removeProperty(PROP_LS)
    document.documentElement.style.removeProperty(PROP_LH)
  },
}
