import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const push = vi.fn()
const back = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, back }),
}))

import { BackButton } from '../components/back-button'

function setReferrer(value: string) {
  Object.defineProperty(document, 'referrer', {
    value,
    configurable: true,
  })
}

function setHistoryLength(length: number) {
  vi.spyOn(window.history, 'length', 'get').mockReturnValue(length)
}

async function clickBack() {
  const user = userEvent.setup()
  render(<BackButton fallbackHref="/" />)
  await user.click(screen.getByRole('button', { name: 'Voltar' }))
}

beforeEach(() => {
  push.mockReset()
  back.mockReset()
})

afterEach(() => {
  setReferrer('')
  vi.restoreAllMocks()
})

describe('BackButton', () => {
  it('volta no histórico quando a página anterior é do próprio site', async () => {
    setReferrer(`${window.location.origin}/servicos`)
    setHistoryLength(3)

    await clickBack()

    expect(back).toHaveBeenCalledTimes(1)
    expect(push).not.toHaveBeenCalled()
  })

  it('vai para o fallback quando a página anterior é de outro site', async () => {
    setReferrer('https://www.google.com/')
    setHistoryLength(3)

    await clickBack()

    expect(push).toHaveBeenCalledWith('/')
    expect(back).not.toHaveBeenCalled()
  })

  it('vai para o fallback quando a aba não tem histórico', async () => {
    setReferrer(`${window.location.origin}/servicos`)
    setHistoryLength(1)

    await clickBack()

    expect(push).toHaveBeenCalledWith('/')
    expect(back).not.toHaveBeenCalled()
  })

  it('vai para o fallback quando o referrer é inválido', async () => {
    setReferrer('não é uma url')
    setHistoryLength(3)

    await clickBack()

    expect(push).toHaveBeenCalledWith('/')
  })

  it('tem os estados focused de hover (desktop) e toque (mobile)', () => {
    render(<BackButton fallbackHref="/" />)

    const button = screen.getByRole('button', { name: 'Voltar' })
    expect(button).toHaveClass(
      'bg-card',
      'hover:bg-secondary',
      'active:bg-secondary'
    )
  })
})
