/**
 * O script do VLibras (`vlibras-plugin.js`) injeta o widget direto no `body`,
 * como `div#vlibras-access-wrapper` com shadow root (popup + botão), fora de
 * qualquer landmark. Leitores de tela não o acham pela navegação de landmarks
 * e o axe-core acusa a regra `region` no `#vlibras-popup`.
 *
 * Aqui o host do widget vira uma `region` nomeada, como o painel de
 * acessibilidade e o banner de cookies.
 */

export const VLIBRAS_WRAPPER_ID = 'vlibras-access-wrapper'
export const VLIBRAS_REGION_LABEL = 'VLibras — tradução para Libras'

function labelWrapper(wrapper: HTMLElement): void {
  if (!wrapper.hasAttribute('role')) wrapper.setAttribute('role', 'region')
  if (!wrapper.hasAttribute('aria-label')) {
    wrapper.setAttribute('aria-label', VLIBRAS_REGION_LABEL)
  }
}

/**
 * Marca o wrapper do VLibras como landmark assim que ele existir. Devolve a
 * função que para de observar o DOM (para o cleanup do `useEffect`).
 */
export function watchVLibrasLandmark(doc: Document = document): () => void {
  const current = doc.getElementById(VLIBRAS_WRAPPER_ID)
  if (current) {
    labelWrapper(current)
    return () => {}
  }

  const observer = new MutationObserver(() => {
    const wrapper = doc.getElementById(VLIBRAS_WRAPPER_ID)
    if (!wrapper) return
    labelWrapper(wrapper)
    observer.disconnect()
  })
  observer.observe(doc.body, { childList: true })

  return () => observer.disconnect()
}
