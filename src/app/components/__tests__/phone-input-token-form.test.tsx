import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
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

// input-otp agenda setTimeout de 0, 10 e 50 ms a cada mudança de valor e não os
// cancela ao desmontar. Se o de 50 ms dispara depois que o Vitest desmonta o
// jsdom do arquivo, o setState quebra com "window is not defined", um erro não
// tratado que reprova a suíte. Espera esses timers antes de seguir.
afterEach(() => new Promise(resolve => setTimeout(resolve, 100)))

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
  it.each([
    ' 123456',
    '123456\n',
    '123 456',
    'Seu código de verificação é: 123456. Ele expira em 5 minutos.',
  ])('aceita o código colado de %j como 123456', async pasted => {
    onValue.mockClear()
    const user = userEvent.setup()
    render(<ControlledForm />)

    await user.click(getOtpInput())
    await user.paste(pasted)

    expect(onValue).toHaveBeenLastCalledWith('123456')
    expect(getOtpInput()).toHaveValue('123456')
  })

  it('ignora caracteres que não são dígitos ao digitar', async () => {
    onValue.mockClear()
    const user = userEvent.setup()
    render(<ControlledForm />)

    await user.click(getOtpInput())
    await user.keyboard('1a 2-3')

    expect(getOtpInput()).toHaveValue('123')
    for (const [value] of onValue.mock.calls) {
      expect(value).toMatch(/^\d*$/)
    }
  })
})
