export const BUTTON_ID = 'a11y-btn'
const WRAPPER_ID = 'a11y-btn-wrapper'

const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
  <path d="M12 5.25C11.4808 5.25 10.9733 5.09605 10.5416 4.80761C10.11 4.51917 9.7735 4.1092 9.57482 3.62955C9.37614 3.14989 9.32415 2.62209 9.42544 2.11289C9.52673 1.60369 9.77673 1.13596 10.1438 0.768846C10.511 0.401733 10.9787 0.151726 11.4879 0.0504398C11.9971 -0.0508464 12.5249 0.00113739 13.0045 0.199817C13.4842 0.398497 13.8942 0.73495 14.1826 1.16663C14.471 1.59831 14.625 2.10583 14.625 2.625C14.6243 3.32097 14.3475 3.98821 13.8553 4.48033C13.3632 4.97246 12.696 5.24926 12 5.25Z" fill="white"/>
  <path d="M20.2495 5.28743L20.2284 5.29306L20.2087 5.29915C20.1619 5.31228 20.115 5.32634 20.0681 5.34087C19.1958 5.59681 14.962 6.79025 11.9794 6.79025C9.20766 6.79025 5.35688 5.759 4.125 5.40884C4.00239 5.36145 3.87719 5.32108 3.75 5.2879C2.85938 5.05353 2.25 5.95821 2.25 6.78509C2.25 7.604 2.98594 7.994 3.72891 8.27384V8.28697L8.19234 9.68103C8.64844 9.85587 8.77031 10.0345 8.82984 10.1892C9.02344 10.6856 8.86875 11.6685 8.81391 12.0117L8.54203 14.121L7.03313 22.3799C7.02844 22.4024 7.02422 22.4254 7.02047 22.4488L7.00969 22.5084C6.90094 23.2654 7.45688 23.9999 8.50969 23.9999C9.42844 23.9999 9.83391 23.3657 10.0097 22.5027C10.1855 21.6398 11.3222 15.1167 11.9784 15.1167C12.6347 15.1167 13.9866 22.5027 13.9866 22.5027C14.1623 23.3657 14.5678 23.9999 15.4866 23.9999C16.5422 23.9999 17.0981 23.2621 16.9866 22.5027C16.977 22.4389 16.9651 22.3754 16.9509 22.3124L15.4214 14.122L15.15 12.0126C14.9536 10.784 15.1116 10.3781 15.165 10.2829C15.1664 10.2807 15.1677 10.2783 15.1687 10.2759C15.2194 10.1821 15.45 9.97212 15.9881 9.77009L20.1731 8.30712C20.1988 8.30027 20.2242 8.29213 20.2491 8.28275C20.9991 8.0015 21.7491 7.61243 21.7491 6.78603C21.7491 5.95962 21.1402 5.05353 20.2495 5.28743Z" fill="white"/>
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
    '<span class="a11y-popup-main">Recursos Assistivos</span>' +
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

export function setButtonActive(active: boolean): void {
  document
    .getElementById(WRAPPER_ID)
    ?.classList.toggle('a11y-btn-has-active', active)
}
