// 0 = off, 1 = deuteranopia, 2 = protanopia, 3 = tritanopia
// Matrizes de daltonização (correção) baseadas em Viénot 1999 e rgblind daltonize generator.
// Aplicadas com color-interpolation-filters="linearRGB" para precisão perceptual correta.
const FILTER_IDS: Record<1 | 2 | 3, string> = {
  1: 'a11y-cb-deuteranopia',
  2: 'a11y-cb-protanopia',
  3: 'a11y-cb-tritanopia',
}

const CLASS = 'a11y-color-blind'

export const ColorBlind = {
  apply(type: 0 | 1 | 2 | 3): void {
    const html = document.documentElement
    // remove todas as classes de tipo anteriores
    html.classList.remove(CLASS, 'a11y-cb-1', 'a11y-cb-2', 'a11y-cb-3')
    if (type === 0) return
    html.classList.add(CLASS, `a11y-cb-${type}`)
  },
  reset(): void {
    document.documentElement.classList.remove(
      CLASS,
      'a11y-cb-1',
      'a11y-cb-2',
      'a11y-cb-3'
    )
  },
  filterIds: FILTER_IDS,
}
