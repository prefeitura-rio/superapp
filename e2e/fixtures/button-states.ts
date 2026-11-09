import type { Locator } from '@playwright/test'

/**
 * Estados default → focused dos botões secundários (`bg-card` →
 * `bg-secondary`). O Tailwind põe `hover:` dentro de `@media (hover: hover)` e
 * `active:` sem condição: no desktop o focused vem do hover; no toque, só
 * enquanto pressionado.
 *
 * Diz quais regras `:hover`/`:active` com fundo `--secondary` valem para o
 * elemento NESTE aparelho (as @media em volta precisam casar).
 */
export function secondaryStateRules(locator: Locator) {
  return locator.evaluate(element => {
    const flatten = (rule: CSSRule): CSSRule[] => [
      rule,
      ...('cssRules' in rule
        ? [...(rule as CSSGroupingRule).cssRules].flatMap(flatten)
        : []),
    ]
    const applies = (rule: CSSRule) => {
      for (let parent = rule.parentRule; parent; parent = parent.parentRule) {
        if (
          parent instanceof CSSMediaRule &&
          !matchMedia(parent.conditionText).matches
        )
          return false
      }
      return true
    }
    const found = { hover: false, active: false }
    for (const sheet of [...document.styleSheets]) {
      let rules: CSSRule[]
      try {
        rules = [...sheet.cssRules].flatMap(flatten)
      } catch {
        continue
      }
      for (const rule of rules) {
        if (
          !(rule instanceof CSSStyleRule) ||
          !rule.style.backgroundColor.includes('--secondary')
        )
          continue
        for (const state of ['hover', 'active'] as const) {
          const suffix = `:${state}`
          if (
            rule.selectorText.endsWith(suffix) &&
            element.matches(rule.selectorText.slice(0, -suffix.length)) &&
            applies(rule)
          ) {
            found[state] = true
          }
        }
      }
    }
    return found
  })
}

export function backgroundOf(locator: Locator) {
  return locator.evaluate(el => getComputedStyle(el).backgroundColor)
}
