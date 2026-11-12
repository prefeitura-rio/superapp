import { screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import {
  VLIBRAS_REGION_LABEL,
  VLIBRAS_WRAPPER_ID,
  watchVLibrasLandmark,
} from '../vlibras-landmark'

// Reproduz o que o vlibras-plugin.js (v7.12.2) injeta: um host com shadow
// root aberto contendo o popup e o botão, anexado direto ao body.
function injectVLibrasWidget(): HTMLElement {
  const host = document.createElement('div')
  host.id = VLIBRAS_WRAPPER_ID
  const shadow = host.attachShadow({ mode: 'open' })
  shadow.innerHTML =
    '<div id="vlibras-access">' +
    '<img id="vlibras-popup" src="vlibras-popup.webp" alt="Acessível com VLibras"/>' +
    '<button type="button" id="vlibras-button" aria-label="Conteúdo acessível em Libras">' +
    '<img src="vlibras-access.svg" alt="" aria-hidden="true"/>' +
    '</button></div>'
  document.body.appendChild(host)
  return host
}

describe('watchVLibrasLandmark', () => {
  let stop: (() => void) | undefined

  afterEach(() => {
    stop?.()
    stop = undefined
    document.body.innerHTML = ''
  })

  it('marca como region nomeada o widget injetado depois da montagem', async () => {
    stop = watchVLibrasLandmark()
    const host = injectVLibrasWidget()

    const region = await screen.findByRole('region', {
      name: VLIBRAS_REGION_LABEL,
    })
    expect(region).toBe(host)
    expect(region.shadowRoot?.querySelector('#vlibras-popup')).not.toBeNull()
  })

  it('marca o widget que já estava no DOM', () => {
    const host = injectVLibrasWidget()

    stop = watchVLibrasLandmark()

    expect(host).toHaveAttribute('role', 'region')
    expect(host).toHaveAttribute('aria-label', VLIBRAS_REGION_LABEL)
  })

  it('não sobrescreve role nem aria-label já definidos', () => {
    const host = injectVLibrasWidget()
    host.setAttribute('role', 'complementary')
    host.setAttribute('aria-label', 'Libras')

    stop = watchVLibrasLandmark()

    expect(host).toHaveAttribute('role', 'complementary')
    expect(host).toHaveAttribute('aria-label', 'Libras')
  })

  it('para de observar depois do cleanup', async () => {
    watchVLibrasLandmark()()
    const host = injectVLibrasWidget()

    // dá a vez aos MutationObservers pendentes
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(host).not.toHaveAttribute('role')
    expect(host).not.toHaveAttribute('aria-label')
  })

  it('ignora mutações que não criam o widget', async () => {
    stop = watchVLibrasLandmark()
    document.body.appendChild(document.createElement('div'))
    const host = injectVLibrasWidget()

    await waitFor(() => expect(host).toHaveAttribute('role', 'region'))
  })
})
