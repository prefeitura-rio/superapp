/**
 * Hosts que o VLibras e o plugin de recursos assistivos anexam direto no
 * `body`, fora de qualquer diálogo. O menu global é modal: um pointerdown
 * nesses nós seria "fora" e fecharia o menu.
 */
export const ACCESSIBILITY_WIDGET_ROOT_IDS = [
  'a11y-btn-wrapper',
  'a11y-panel',
  'a11y-vlibras-wrapper',
  'vlibras-access-wrapper',
  'a11y-tts-widget',
  'a11y-mobile-overlay',
] as const

function hostOf(element: Element): Element {
  const root = element.getRootNode()
  return root instanceof ShadowRoot ? root.host : element
}

export function isAccessibilityWidgetTarget(
  target: EventTarget | null
): boolean {
  if (!(target instanceof Element)) return false
  const host = hostOf(target)
  return ACCESSIBILITY_WIDGET_ROOT_IDS.some(
    id => host.id === id || Boolean(host.closest(`#${id}`))
  )
}
