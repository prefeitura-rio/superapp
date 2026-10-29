const OVERLAY_ID = 'a11y-reading-overlay'
const WINDOW_ID = 'a11y-reading-window'

// Meia-altura da janela em px por nível
const HALF_HEIGHT = [24, 40, 64] as const
// Meia-largura em px; 9999 = tela toda (sem tracking horizontal)
const HALF_WIDTH = [160, 280, 9999] as const

// Por nível de intensidade: [blur em px, brightness (0–1)]
const INTENSITY = [
  { blur: 3, brightness: 0.75 }, // suave
  { blur: 6, brightness: 0.55 }, // média
  { blur: 10, brightness: 0.3 }, // total
] as const

let currentHeight: 0 | 1 | 2 = 1
let currentWidth: 0 | 1 | 2 = 1
let currentIntensity: 0 | 1 | 2 = 1

function applyIntensity(overlay: HTMLElement, level: 0 | 1 | 2): void {
  const { blur, brightness } = INTENSITY[level]
  const filter = `blur(${blur}px) brightness(${brightness})`
  overlay.style.backdropFilter = filter
  ;(overlay.style as unknown as Record<string, string>)[
    '-webkit-backdrop-filter'
  ] = filter
}

function updateMask(x: number, y: number): void {
  const overlay = document.getElementById(OVERLAY_ID)
  const win = document.getElementById(WINDOW_ID)
  if (!overlay || !win) return

  const vw = window.innerWidth
  const vh = window.innerHeight
  const hh = HALF_HEIGHT[currentHeight]
  const cx = currentWidth === 2 ? vw / 2 : x
  const hw = Math.min(HALF_WIDTH[currentWidth], vw / 2)

  const top = Math.max(0, y - hh)
  const bottom = Math.min(vh, y + hh)
  const left = Math.max(0, cx - hw)
  const right = Math.min(vw, cx + hw)

  // Posiciona a janela visível
  win.style.top = `${top}px`
  win.style.left = `${left}px`
  win.style.width = `${right - left}px`
  win.style.height = `${bottom - top}px`

  // Buraco no overlay via polygon: borda externa (sentido horário) + buraco interno (anti-horário)
  // Isso cria um "donut" — o overlay cobre tudo exceto o retângulo da janela
  overlay.style.clipPath = [
    'polygon(',
    // borda externa (toda a tela, sentido horário)
    `0px 0px, ${vw}px 0px, ${vw}px ${vh}px, 0px ${vh}px, 0px 0px,`,
    // buraco interno (janela, anti-horário)
    `${left}px ${top}px, ${left}px ${bottom}px, ${right}px ${bottom}px, ${right}px ${top}px, ${left}px ${top}px`,
    ')',
  ].join(' ')
}

function onPointerMove(e: PointerEvent): void {
  updateMask(e.clientX, e.clientY)
}

function createElements(): void {
  if (!document.getElementById(OVERLAY_ID)) {
    const overlay = document.createElement('div')
    overlay.id = OVERLAY_ID
    overlay.setAttribute('aria-hidden', 'true')
    document.body.appendChild(overlay)
  }
  if (!document.getElementById(WINDOW_ID)) {
    const win = document.createElement('div')
    win.id = WINDOW_ID
    win.setAttribute('aria-hidden', 'true')
    document.body.appendChild(win)
  }
}

export const ReadingMask = {
  apply(
    enabled: boolean,
    height: 0 | 1 | 2 = 1,
    width: 0 | 1 | 2 = 1,
    intensity: 0 | 1 | 2 = 1
  ): void {
    if (enabled) {
      currentHeight = height
      currentWidth = width
      currentIntensity = intensity
      createElements()
      const overlay = document.getElementById(OVERLAY_ID)!
      applyIntensity(overlay, intensity)
      updateMask(window.innerWidth / 2, window.innerHeight / 2)
      document.addEventListener('pointermove', onPointerMove, { passive: true })
    } else {
      this.reset()
    }
  },
  reset(): void {
    document.getElementById(OVERLAY_ID)?.remove()
    document.getElementById(WINDOW_ID)?.remove()
    document.removeEventListener('pointermove', onPointerMove)
  },
}
