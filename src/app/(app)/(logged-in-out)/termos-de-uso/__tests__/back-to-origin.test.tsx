import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const push = vi.fn()
const back = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, back }),
}))

import { BackToOrigin } from '../components/back-to-origin'

const LABEL = 'Voltar para o currículo'
const HREF = '/servicos/trabalho/curriculo'

function setReferrer(value: string) {
  Object.defineProperty(document, 'referrer', {
    value,
    configurable: true,
  })
}

function setHistoryLength(length: number) {
  vi.spyOn(window.history, 'length', 'get').mockReturnValue(length)
}

/** Simula `window.close()`: fecha (ou não) a aba. */
function mockClose({ closes }: { closes: boolean }) {
  let closed = false
  // jsdom não implementa `window.closed`.
  Object.defineProperty(window, 'closed', {
    get: () => closed,
    configurable: true,
  })
  return vi.spyOn(window, 'close').mockImplementation(() => {
    closed = closes
  })
}

function clickBack() {
  render(<BackToOrigin href={HREF} label={LABEL} />)
  act(() => {
    screen.getByRole('button', { name: LABEL }).click()
  })
}

beforeEach(() => {
  push.mockReset()
  back.mockReset()
  vi.useFakeTimers()
})

afterEach(() => {
  setReferrer('')
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('BackToOrigin', () => {
  it('na mesma aba, volta no histórico (o currículo continua como estava)', () => {
    setReferrer(`${window.location.origin}${HREF}`)
    setHistoryLength(3)
    const close = mockClose({ closes: true })

    clickBack()

    expect(back).toHaveBeenCalledTimes(1)
    expect(close).not.toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
  })

  it('aberto em nova aba, fecha a aba e devolve a pessoa ao currículo', () => {
    setReferrer('')
    setHistoryLength(1)
    const close = mockClose({ closes: true })

    clickBack()
    act(() => {
      vi.runAllTimers()
    })

    expect(close).toHaveBeenCalledTimes(1)
    expect(back).not.toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
  })

  it('se o navegador não deixa fechar a aba, abre o currículo', () => {
    setReferrer('')
    setHistoryLength(1)
    const close = mockClose({ closes: false })

    clickBack()
    expect(push).not.toHaveBeenCalled()
    act(() => {
      vi.runAllTimers()
    })

    expect(close).toHaveBeenCalledTimes(1)
    expect(push).toHaveBeenCalledWith(HREF)
  })

  it('vindo de outro site, não volta para fora: tenta fechar e cai no currículo', () => {
    setReferrer('https://www.google.com/')
    setHistoryLength(3)
    mockClose({ closes: false })

    clickBack()
    act(() => {
      vi.runAllTimers()
    })

    expect(back).not.toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith(HREF)
  })

  it('tem os estados focused de hover (desktop) e toque (mobile)', () => {
    render(<BackToOrigin href={HREF} label={LABEL} />)

    expect(screen.getByRole('button', { name: LABEL })).toHaveClass(
      'bg-card',
      'hover:bg-secondary',
      'active:bg-secondary'
    )
  })
})
