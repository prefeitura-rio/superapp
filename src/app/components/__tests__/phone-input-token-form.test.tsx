import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PhoneInputTokenForm from '../phone-input-token-form'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}))

vi.mock('@/actions/update-user-phone', () => ({
  updateUserPhone: vi.fn(),
}))

// input-otp usa ResizeObserver e document.elementFromPoint, ausentes no jsdom.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
document.elementFromPoint ??= () => null

const onValue = vi.fn()

function ControlledForm() {
  const [value, setValue] = useState('')
  return (
    <PhoneInputTokenForm
      value={value}
      onChange={next => {
        onValue(next)
        setValue(next)
      }}
    />
  )
}

function getOtpInput(): HTMLInputElement {
  return screen.getByRole('textbox') as HTMLInputElement
}

describe('PhoneInputTokenForm', () => {
  // input-otp agenda setTimeout (0, 10 e 50 ms) a cada mudança de valor/foco e
  // não os cancela no unmount. Se dispararem depois do teardown do jsdom, o
  // setState do React lança `window is not defined` e o Vitest sai com código 1
  // mesmo com todos os testes passando. Com fake timers, o afterEach esvazia a
  // fila (dentro de act, para o React processar os updates) e desmonta ainda
  // com o jsdom de pé, sem deixar timer pendente para depois do teardown.
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    try {
      act(() => {
        vi.runOnlyPendingTimers()
      })
      cleanup()
      expect(vi.getTimerCount()).toBe(0)
    } finally {
      vi.useRealTimers()
    }
  })

  it.each([
    ' 123456',
    '123456\n',
    '123 456',
    'Seu código de verificação é: 123456. Ele expira em 5 minutos.',
  ])('aceita o código colado de %j como 123456', async pasted => {
    onValue.mockClear()
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<ControlledForm />)

    await user.click(getOtpInput())
    await user.paste(pasted)

    expect(onValue).toHaveBeenLastCalledWith('123456')
    expect(getOtpInput()).toHaveValue('123456')
  })

  it('ignora caracteres que não são dígitos ao digitar', async () => {
    onValue.mockClear()
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<ControlledForm />)

    await user.click(getOtpInput())
    await user.keyboard('1a 2-3')

    expect(getOtpInput()).toHaveValue('123')
    for (const [value] of onValue.mock.calls) {
      expect(value).toMatch(/^\d*$/)
    }
  })
})
