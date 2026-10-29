// 0 = normal | 1 = baixa saturação | 2 = escala de cinza
const VALUES = ['1', '0.3', '0'] as const
const PROP = '--a11y-saturation'
// Classe adicionada apenas quando nível > 0 para evitar criar stacking context desnecessário
const ACTIVE_CLASS = 'a11y-saturation-active'

export const Saturation = {
  apply(level: 0 | 1 | 2): void {
    document.documentElement.style.setProperty(PROP, VALUES[level])
    document.documentElement.classList.toggle(ACTIVE_CLASS, level > 0)
  },
  reset(): void {
    document.documentElement.style.removeProperty(PROP)
    document.documentElement.classList.remove(ACTIVE_CLASS)
  },
}
