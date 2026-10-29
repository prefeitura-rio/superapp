export const STYLES_ID = 'a11y-plugin-styles'

// Tokens espelhados do globals.css do superapp
// light: --primary #13335a | dark: --primary #8ec5ff | --background #f9fafb | dark #09090b
const LIGHT_PRIMARY = '#13335a'
const DARK_PRIMARY = '#8ec5ff'

export const CSS = `
/* ════════════════════════════════════
   FEATURE STYLES
   ════════════════════════════════════ */

/* ── Font scale ── */
html {
  font-size: var(--a11y-font-scale, 100%);
}

/* ── Letter spacing + line height ──
   Usa * para atingir elementos com line-height explícito no CSS do app
   (Tailwind leading-*, componentes com valor fixo, etc.)
   inherit garante que elementos filhos sigam a var sem cascata extra. */
html body {
  letter-spacing: var(--a11y-letter-spacing, normal);
}
html body *:not(#a11y-btn):not(#a11y-panel):not(#a11y-panel *) {
  line-height: var(--a11y-line-height, inherit) !important;
}

/* ── Dyslexia font ── */
html.a11y-dyslexia,
html.a11y-dyslexia body,
html.a11y-dyslexia p,
html.a11y-dyslexia span,
html.a11y-dyslexia li,
html.a11y-dyslexia a,
html.a11y-dyslexia button,
html.a11y-dyslexia input,
html.a11y-dyslexia textarea,
html.a11y-dyslexia label,
html.a11y-dyslexia h1,
html.a11y-dyslexia h2,
html.a11y-dyslexia h3,
html.a11y-dyslexia h4,
html.a11y-dyslexia h5,
html.a11y-dyslexia h6 {
  font-family: 'OpenDyslexic', sans-serif !important;
  letter-spacing: var(--a11y-letter-spacing, 0.05em);
  word-spacing: 0.1em;
  line-height: var(--a11y-line-height, 1.7);
}

/* ── Color blind — definição do SVG filter inline ──
   O filter real é aplicado abaixo junto com saturação para evitar conflito. */
#a11y-cb-filter-def { display: none; }

/* ── Highlight links ── */
html.a11y-highlight-links a:not(:has(> img:only-child)) {
  text-decoration: underline !important;
  text-underline-offset: 3px !important;
  text-decoration-thickness: 2px !important;
  text-decoration-color: currentColor !important;
}
html.a11y-highlight-links a:focus-visible {
  outline: 2px solid currentColor !important;
  outline-offset: 2px !important;
  border-radius: 2px;
}

/* ── Reduce motion ── */
html.a11y-reduce-motion *:not(#a11y-btn):not(#a11y-panel):not(#a11y-panel *) {
  animation-duration: 0.001ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.001ms !important;
  scroll-behavior: auto !important;
}

/* ── Filter unificado: saturation + color-blind + high-contrast ──
   IMPORTANTE: filter em html cria stacking context e quebra position:fixed
   de toda a página. Por isso só aplicamos quando uma feature está de fato ativa
   (saturação < 1, ou color-blind, ou high-contrast). O caso "nenhuma ativa"
   não recebe regra — sem filter, sem stacking context, sem side-effects. */
html.a11y-saturation-active:not(.a11y-high-contrast):not(.a11y-color-blind) {
  filter: saturate(var(--a11y-saturation, 1));
}
html.a11y-color-blind:not(.a11y-high-contrast) {
  filter: url(#a11y-cb-filter) saturate(var(--a11y-saturation, 1));
}
html.a11y-high-contrast:not(.a11y-color-blind) {
  filter: invert(1) hue-rotate(180deg) saturate(var(--a11y-saturation, 1));
}
html.a11y-high-contrast.a11y-color-blind {
  filter: url(#a11y-cb-filter) invert(1) hue-rotate(180deg) saturate(var(--a11y-saturation, 1));
}
html.a11y-high-contrast img,
html.a11y-high-contrast video,
html.a11y-high-contrast [style*="background-image"] {
  filter: invert(1) hue-rotate(180deg) saturate(var(--a11y-saturation, 1));
}
#a11y-btn,
#a11y-panel {
  filter: none !important;
}

/* ── Hide images ── */
html.a11y-hide-images img { visibility: hidden; }

/* ── TTS highlight ── */
.a11y-tts-highlight {
  background: rgba(255, 220, 0, 0.45);
  border-radius: 2px;
  outline: 2px solid rgba(255, 180, 0, 0.6);
  outline-offset: 1px;
}
html.dark .a11y-tts-highlight {
  background: rgba(255, 200, 0, 0.3);
  outline-color: rgba(255, 200, 0, 0.5);
}
html.a11y-high-contrast .a11y-tts-highlight {
  background: rgba(255, 255, 0, 0.7);
  outline-color: #000;
}

/* ── TTS widget ── */
#a11y-tts-widget {
  position: fixed;
  right: 80px;
  bottom: calc(50vh + 48px);
  z-index: 9994;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1px solid #e4e4e7;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.13), 0 1px 4px rgba(0,0,0,0.07);
  padding: 8px 10px;
  font-family: system-ui, -apple-system, sans-serif;
}
.a11y-tts-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: #f0f4ff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${LIGHT_PRIMARY};
  transition: background 0.13s;
  flex-shrink: 0;
}
.a11y-tts-btn:hover { background: #dce8ff; }
.a11y-tts-btn:focus-visible {
  outline: 2px solid #4a9fff;
  outline-offset: 2px;
}
.a11y-tts-btn svg {
  width: 15px;
  height: 15px;
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.a11y-tts-progress {
  font-size: 12px;
  font-weight: 600;
  color: #52525c;
  min-width: 36px;
  text-align: center;
}
html.dark #a11y-tts-widget {
  background: #18181b;
  border-color: #27272a;
  box-shadow: 0 4px 16px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.25);
}
html.dark .a11y-tts-btn {
  background: #1e2d45;
  color: ${DARK_PRIMARY};
}
html.dark .a11y-tts-btn:hover { background: #263d5a; }
html.dark .a11y-tts-progress { color: #a1a1aa; }

/* ── Controles TTS inline no painel ── */
.a11y-tts-controls-row {
  justify-content: flex-start;
  gap: 8px;
  padding: 8px 13px;
}
.a11y-tts-controls-inner {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* ── Reading mask ──
   Dois elementos: overlay (cobre tudo com blur+brightness, tem buraco via polygon)
   e window (marca a borda da janela visível com anel suave).
   O buraco no overlay é calculado em JS via clip-path polygon.
   backdrop-filter blur+brightness é aplicado inline pelo JS por nível. */
/* z-index stack do plugin:
   9990 overlay da máscara (desfoque ao redor)
   9991 janela da máscara (borda suave da área visível)
   9995 botão flutuante (sempre acima da máscara)
   9999 painel (sempre no topo) */
#a11y-reading-overlay {
  position: fixed;
  inset: 0;
  z-index: 9990;
  pointer-events: none;
}
#a11y-reading-window {
  position: fixed;
  z-index: 9991;
  pointer-events: none;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.12), 0 0 8px 2px rgba(0, 0, 0, 0.08);
  border-radius: 2px;
}
html.dark #a11y-reading-window {
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08), 0 0 10px 3px rgba(0, 0, 0, 0.25);
}
html.a11y-high-contrast #a11y-reading-window {
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.2), 0 0 8px 2px rgba(0, 0, 0, 0.15);
}

/* ════════════════════════════════════
   FLOATING BUTTON
   ════════════════════════════════════ */

#a11y-btn {
  position: fixed;
  right: 16px;
  bottom: calc(50vh + 48px);
  z-index: 9995;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: linear-gradient(135deg, #1a4a80 0%, ${LIGHT_PRIMARY} 100%);
  box-shadow: 0 4px 14px rgba(19, 51, 90, 0.45);
  transition: box-shadow 0.2s, transform 0.15s;
}
#a11y-btn:hover {
  box-shadow: 0 6px 20px rgba(19, 51, 90, 0.55);
  transform: translateY(-1px);
}
#a11y-btn:active {
  transform: translateY(0);
}
#a11y-btn:focus-visible {
  outline: 3px solid #4a9fff;
  outline-offset: 3px;
}
#a11y-btn svg {
  width: 26px;
  height: 26px;
  color: #ffffff;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.75;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 0.15s;
}
#a11y-btn.a11y-btn-pop svg {
  animation: a11y-btn-pop 0.35s cubic-bezier(0.34, 1.6, 0.64, 1) both;
}
@keyframes a11y-btn-pop {
  0%   { transform: scale(1) rotate(0deg); }
  40%  { transform: scale(1.28) rotate(-12deg); }
  70%  { transform: scale(0.92) rotate(6deg); }
  100% { transform: scale(1) rotate(0deg); }
}
html.dark #a11y-btn {
  background: linear-gradient(135deg, #6ba8e0 0%, ${DARK_PRIMARY} 100%);
  box-shadow: 0 4px 14px rgba(142, 197, 255, 0.3);
}
html.dark #a11y-btn:hover {
  box-shadow: 0 6px 20px rgba(142, 197, 255, 0.45);
}

/* ════════════════════════════════════
   PANEL
   ════════════════════════════════════ */

#a11y-panel {
  position: fixed;
  right: 80px;
  bottom: calc(50vh - 180px);
  z-index: 9999;
  width: 312px;
  max-height: 86vh;
  overflow-y: auto;
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid #e4e4e7;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.14), 0 2px 8px rgba(0, 0, 0, 0.06);
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 14px;
  color: #09090b;
  display: none;
  transform-origin: bottom right;
  scrollbar-width: thin;
  scrollbar-color: #e4e4e7 transparent;
}
#a11y-panel.a11y-open {
  display: flex;
  flex-direction: column;
  animation: a11y-panel-in 0.2s cubic-bezier(0.34, 1.4, 0.64, 1) both;
}
@keyframes a11y-panel-in {
  from { opacity: 0; transform: scale(0.93) translateY(8px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

/* ── Header ── */
.a11y-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 12px;
  background: linear-gradient(135deg, #1a4a80 0%, ${LIGHT_PRIMARY} 100%);
  border-radius: 17px 17px 0 0;
  flex-shrink: 0;
}
.a11y-panel-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: #ffffff;
  letter-spacing: 0.01em;
}
.a11y-panel-close {
  background: rgba(255,255,255,0.15);
  border: none;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
  flex-shrink: 0;
}
.a11y-panel-close:hover { background: rgba(255,255,255,0.28); }
.a11y-panel-close:focus-visible {
  outline: 2px solid rgba(255,255,255,0.8);
  outline-offset: 2px;
}
.a11y-panel-close svg {
  width: 18px;
  height: 18px;
  stroke: currentColor;
  fill: none;
  stroke-width: 2.5;
  stroke-linecap: round;
}

/* ── Body ── */
.a11y-panel-body {
  padding: 10px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

/* ════════════════════════════════════
   ACCORDION
   ════════════════════════════════════ */

.a11y-accordion {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e4e4e7;
  background: #ffffff;
}

/* Trigger — o botão do cabeçalho do grupo */
.a11y-accordion-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 13px;
  background: transparent;
  border: none;
  cursor: pointer;
  gap: 8px;
  transition: background 0.13s;
  min-height: 48px;
}
.a11y-accordion-trigger:hover {
  background: #f4f4f5;
}
.a11y-accordion-trigger:focus-visible {
  outline: 2px solid #4a9fff;
  outline-offset: -2px;
  border-radius: 12px;
}
.a11y-accordion-trigger[aria-expanded="true"] {
  border-bottom: 1px solid #e4e4e7;
}

.a11y-accordion-left {
  display: flex;
  align-items: center;
  gap: 9px;
  flex: 1;
  min-width: 0;
}
.a11y-accordion-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: #f0f4ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.a11y-accordion-icon svg {
  width: 15px;
  height: 15px;
  stroke: ${LIGHT_PRIMARY};
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.a11y-accordion-title {
  font-size: 13px;
  font-weight: 600;
  color: #18181b;
  letter-spacing: 0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.a11y-accordion-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.a11y-accordion-badge {
  font-size: 10px;
  font-weight: 700;
  color: #ffffff;
  background: #2563eb;
  border-radius: 20px;
  padding: 1px 7px;
  line-height: 16px;
  letter-spacing: 0.02em;
}
.a11y-accordion-chevron svg {
  width: 16px;
  height: 16px;
  stroke: #71717a;
  fill: none;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 0.2s cubic-bezier(0.34,1.4,0.64,1);
  display: block;
}
.a11y-accordion-trigger[aria-expanded="true"] .a11y-accordion-chevron svg {
  transform: rotate(180deg);
}

/* Body do accordion — animação de expand/collapse */
.a11y-accordion-body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}
.a11y-accordion-body.a11y-accordion-open {
  grid-template-rows: 1fr;
}
.a11y-accordion-inner {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ── Row ── */
.a11y-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 13px;
  gap: 10px;
  border-bottom: 1px solid #e4e4e7;
  background: #fafafa;
}
.a11y-row:last-child {
  border-bottom: none;
}
.a11y-row-label {
  font-size: 13px;
  font-weight: 500;
  color: #18181b;
  flex: 1;
  line-height: 1.3;
}
.a11y-row-sublabel {
  font-size: 11px;
  font-weight: 400;
  color: #52525c;
  display: block;
  margin-top: 2px;
}

/* Sub-rows da máscara de leitura —
   linha azul à esquerda indica hierarquia, fundo levemente diferenciado */
.a11y-row-sub {
  padding-left: 13px;
  background: #f0f4ff;
  border-left: 3px solid #2563eb;
  transition: opacity 0.18s ease, max-height 0.22s ease, padding 0.18s ease;
  overflow: hidden;
  max-height: 64px;
}
.a11y-row-sub .a11y-row-label {
  font-size: 12px;
  color: #3f3f46;
}
.a11y-row-sub-hidden {
  opacity: 0;
  max-height: 0 !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  border-bottom: none;
  pointer-events: none;
}

/* ── Stepper (+/-) ── */
.a11y-stepper {
  display: flex;
  align-items: center;
  gap: 2px;
  background: #ffffff;
  border: 1px solid #e4e4e7;
  border-radius: 8px;
  padding: 2px;
}
.a11y-stepper-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 17px;
  font-weight: 500;
  color: #18181b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.1s;
  padding: 0;
  line-height: 1;
}
.a11y-stepper-btn:hover:not(:disabled) { background: #f4f4f5; }
.a11y-stepper-btn:disabled {
  color: #a1a1aa;
  background: #f4f4f5;
  cursor: default;
  opacity: 0.6;
}
.a11y-stepper-btn:focus-visible {
  outline: 2px solid #4a9fff;
  outline-offset: 1px;
}
.a11y-stepper-val {
  font-size: 12px;
  font-weight: 600;
  width: 52px;
  text-align: center;
  color: ${LIGHT_PRIMARY};
  padding: 0 2px;
  flex-shrink: 0;
}

/* ── Toggle ── */
.a11y-toggle {
  position: relative;
  width: 40px;
  height: 23px;
  flex-shrink: 0;
}
.a11y-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}
.a11y-toggle-track {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: #d4d4d8;
  cursor: pointer;
  transition: background 0.2s;
}
.a11y-toggle input:checked + .a11y-toggle-track {
  background: #2563eb;
}
.a11y-toggle-track::after {
  content: '';
  position: absolute;
  left: 3px;
  top: 3px;
  width: 17px;
  height: 17px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s cubic-bezier(0.34,1.4,0.64,1);
  box-shadow: 0 1px 4px rgba(0,0,0,0.22);
}
.a11y-toggle input:checked + .a11y-toggle-track::after {
  transform: translateX(17px);
}
.a11y-toggle input:focus-visible + .a11y-toggle-track {
  outline: 2px solid #4a9fff;
  outline-offset: 2px;
}

/* ── Footer ── */
.a11y-panel-footer {
  padding: 8px 10px 12px;
  flex-shrink: 0;
}
.a11y-reset-btn {
  width: 100%;
  padding: 9px 12px;
  border-radius: 10px;
  border: 1px solid #e4e4e7;
  background: #fafafa;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #52525c;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}
.a11y-reset-btn:hover {
  background: #f4f4f5;
  border-color: #d4d4d8;
  color: #09090b;
}
.a11y-reset-btn:focus-visible {
  outline: 2px solid #4a9fff;
  outline-offset: 2px;
}
.a11y-reset-btn svg {
  width: 15px;
  height: 15px;
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  flex-shrink: 0;
}

/* ════════════════════════════════════
   DARK MODE
   ════════════════════════════════════ */

html.dark #a11y-panel {
  background: #18181b;
  border-color: #27272a;
  box-shadow: 0 12px 40px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.3);
  color: #f4f4f5;
  scrollbar-color: #3f3f46 transparent;
}
html.dark .a11y-panel-header {
  background: linear-gradient(135deg, #4a7cb5 0%, #2a5a94 100%);
}
html.dark .a11y-accordion {
  background: #18181b;
  border-color: #27272a;
}
html.dark .a11y-accordion-trigger:hover {
  background: #27272a;
}
html.dark .a11y-accordion-trigger[aria-expanded="true"] {
  border-bottom-color: #27272a;
}
html.dark .a11y-accordion-icon {
  background: #1e2d45;
}
html.dark .a11y-accordion-icon svg {
  stroke: ${DARK_PRIMARY};
}
html.dark .a11y-accordion-title {
  color: #f4f4f5;
}
html.dark .a11y-accordion-chevron svg {
  stroke: #71717a;
}
html.dark .a11y-row {
  background: #09090b;
  border-color: #27272a;
}
html.dark .a11y-row-sub {
  background: #0f1729;
  border-left-color: ${DARK_PRIMARY};
}
html.dark .a11y-row-sub .a11y-row-label {
  color: #a1a1aa;
}
html.dark .a11y-row-label {
  color: #f4f4f5;
}
html.dark .a11y-row-sublabel {
  color: #a1a1aa;
}
html.dark .a11y-stepper {
  background: #27272a;
  border-color: #3f3f46;
}
html.dark .a11y-stepper-btn {
  color: #e4e4e7;
}
html.dark .a11y-stepper-btn:hover:not(:disabled) {
  background: #3f3f46;
}
html.dark .a11y-stepper-btn:disabled {
  color: #71717a;
  background: #27272a;
  opacity: 0.6;
}
html.dark .a11y-stepper-val {
  color: ${DARK_PRIMARY};
}
html.dark .a11y-toggle input:checked + .a11y-toggle-track {
  background: ${DARK_PRIMARY};
}
html.dark .a11y-toggle-track {
  background: #3f3f46;
}
html.dark .a11y-toggle input:checked + .a11y-toggle-track::after {
  background: #18181b;
}
html.dark .a11y-reset-btn {
  background: #27272a;
  border-color: #3f3f46;
  color: #a1a1aa;
}
html.dark .a11y-reset-btn:hover {
  background: #3f3f46;
  color: #f4f4f5;
}
`

const SVG_FILTER_ID = 'a11y-cb-svg'

export function injectStyles(): void {
  if (document.getElementById(STYLES_ID)) return

  const style = document.createElement('style')
  style.id = STYLES_ID
  style.textContent = CSS
  document.head.appendChild(style)

  // SVG filter para deuteranopia — referenciado pelo CSS via url(#a11y-cb-filter)
  if (!document.getElementById(SVG_FILTER_ID)) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.id = SVG_FILTER_ID
    svg.setAttribute('aria-hidden', 'true')
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden'
    svg.innerHTML = `<defs><filter id="a11y-cb-filter"><feColorMatrix type="matrix" values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0"/></filter></defs>`
    document.body.appendChild(svg)
  }
}
