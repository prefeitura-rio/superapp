export const BUTTON_ID = 'a11y-btn'

// Ícone de pessoa com acessibilidade — mais limpo e reconhecível
const ICON_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <circle cx="12" cy="5" r="1.5"/>
  <path d="M8 8.5h8M12 10v5M10 15l-1.5 4M14 15l1.5 4"/>
</svg>`

export function createButton(onToggle: () => void): HTMLButtonElement {
  const btn = document.createElement('button')
  btn.id = BUTTON_ID
  btn.setAttribute('aria-label', 'Abrir painel de acessibilidade')
  btn.setAttribute('aria-expanded', 'false')
  btn.setAttribute('aria-controls', 'a11y-panel')
  btn.setAttribute('type', 'button')
  btn.innerHTML = ICON_SVG

  function triggerPop() {
    btn.classList.remove('a11y-btn-pop')
    // força reflow para reiniciar a animação se clicado rápido
    void btn.offsetWidth
    btn.classList.add('a11y-btn-pop')
    btn.addEventListener(
      'animationend',
      () => btn.classList.remove('a11y-btn-pop'),
      { once: true }
    )
  }

  btn.addEventListener('click', () => {
    triggerPop()
    onToggle()
  })
  btn.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      triggerPop()
      onToggle()
    }
  })

  document.body.appendChild(btn)
  return btn
}

export function setButtonExpanded(expanded: boolean): void {
  document
    .getElementById(BUTTON_ID)
    ?.setAttribute('aria-expanded', String(expanded))
}
