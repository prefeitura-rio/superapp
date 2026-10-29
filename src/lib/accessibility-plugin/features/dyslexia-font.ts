const FONT_FACE_ID = 'a11y-opendyslexic-face'
const CLASS = 'a11y-dyslexia'

// jsDelivr já está liberado na CSP do projeto (font-src, script-src)
const FONT_URL =
  'https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/fonts/OpenDyslexic-Regular.otf'

function injectFontFace(): void {
  if (document.getElementById(FONT_FACE_ID)) return

  const style = document.createElement('style')
  style.id = FONT_FACE_ID
  style.textContent = `
    @font-face {
      font-family: 'OpenDyslexic';
      src: url('${FONT_URL}') format('opentype');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
  `
  document.head.appendChild(style)
}

export const DyslexiaFont = {
  apply(enabled: boolean): void {
    if (enabled) {
      injectFontFace()
      document.documentElement.classList.add(CLASS)
    } else {
      document.documentElement.classList.remove(CLASS)
    }
  },
  reset(): void {
    document.documentElement.classList.remove(CLASS)
  },
}
