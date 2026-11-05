export const BUTTON_ID = 'a11y-btn'
const WRAPPER_ID = 'a11y-btn-wrapper'

const ICON_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <circle cx="12" cy="5" r="1.5"/>
  <path d="M8 8.5h8M12 10v5M10 15l-1.5 4M14 15l1.5 4"/>
</svg>`

export function createButton(onToggle: () => void): HTMLButtonElement {
  const wrapper = document.createElement('div')
  wrapper.id = WRAPPER_ID
  wrapper.setAttribute('aria-hidden', 'true')

  const popup = document.createElement('span')
  popup.id = 'a11y-btn-popup'
  popup.setAttribute('aria-hidden', 'true')
  // sliders-horizontal — indica "configurações/ajustes", diferente do ícone do botão
  popup.innerHTML =
    '<svg class="a11y-popup-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<line x1="21" y1="6" x2="3" y2="6"/>' +
    '<line x1="17" y1="12" x2="3" y2="12"/>' +
    '<line x1="13" y1="18" x2="3" y2="18"/>' +
    '<circle cx="21" cy="6" r="2"/>' +
    '<circle cx="17" cy="12" r="2"/>' +
    '<circle cx="13" cy="18" r="2"/>' +
    '</svg>' +
    '<span class="a11y-popup-text">' +
    '<span class="a11y-popup-sub">Painel de</span>' +
    '<span class="a11y-popup-main">Acessibilidade</span>' +
    '</span>'

  const btn = document.createElement('button')
  btn.id = BUTTON_ID
  btn.setAttribute('aria-label', 'Abrir painel de acessibilidade')
  btn.setAttribute('aria-expanded', 'false')
  btn.setAttribute('aria-controls', 'a11y-panel')
  btn.setAttribute('type', 'button')
  btn.innerHTML = ICON_SVG

  wrapper.appendChild(popup)
  wrapper.appendChild(btn)

  // remove aria-hidden do wrapper quando o botão recebe foco — permite leitura por SR
  btn.addEventListener('focus', () => wrapper.removeAttribute('aria-hidden'))
  btn.addEventListener('blur', () =>
    wrapper.setAttribute('aria-hidden', 'true')
  )

  function triggerPop() {
    btn.classList.remove('a11y-btn-pop')
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

  document.body.appendChild(wrapper)
  return btn
}

export function setButtonExpanded(expanded: boolean): void {
  document
    .getElementById(BUTTON_ID)
    ?.setAttribute('aria-expanded', String(expanded))
  document
    .getElementById(WRAPPER_ID)
    ?.classList.toggle('a11y-panel-open', expanded)
}
