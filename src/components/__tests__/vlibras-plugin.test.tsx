import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { VLibrasPlugin } from '../vlibras-plugin'

vi.mock('next/script', () => ({
  default: ({ src }: { src: string }) => <script data-src={src} />,
}))

describe('VLibrasPlugin', () => {
  afterEach(() => {
    document.getElementById('vlibras-access-wrapper')?.remove()
  })

  it('expõe o widget injetado pelo script como landmark nomeado', async () => {
    render(<VLibrasPlugin nonce="n" />)

    // o vlibras-plugin.js cria o host com shadow root direto no body
    const host = document.createElement('div')
    host.id = 'vlibras-access-wrapper'
    host.attachShadow({ mode: 'open' }).innerHTML =
      '<img id="vlibras-popup" alt="Acessível com VLibras"/>'
    document.body.appendChild(host)

    expect(
      await screen.findByRole('region', {
        name: 'VLibras — tradução para Libras',
      })
    ).toBe(host)
  })

  it('para de observar ao desmontar', async () => {
    const { unmount } = render(<VLibrasPlugin />)
    unmount()

    const host = document.createElement('div')
    host.id = 'vlibras-access-wrapper'
    document.body.appendChild(host)
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(host).not.toHaveAttribute('role')
  })
})
