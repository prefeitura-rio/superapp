import { render, screen } from '@testing-library/react'
import type { SVGProps } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { QuickInfoItem } from '../quick-info-item'

function FakeIcon(props: SVGProps<SVGSVGElement>) {
  return <svg data-testid="icon" {...props} />
}

describe('QuickInfoItem', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('centraliza o ícone verticalmente em relação ao texto, sem deslocamento', () => {
    render(
      <QuickInfoItem
        icon={FakeIcon}
        label="Prazo de pagamento"
        value="30 dias"
      />
    )

    const icon = screen.getByTestId('icon')
    const iconWrapper = icon.parentElement
    const row = iconWrapper?.parentElement

    expect(row).toHaveClass('flex', 'items-center')
    expect(iconWrapper).toHaveClass('flex', 'items-center', 'shrink-0')
    expect(iconWrapper?.className).not.toMatch(/\bm[ty]-/)
  })

  it('usa o token foreground-light no ícone e 14px no label', () => {
    render(<QuickInfoItem icon={FakeIcon} label="Órgão" value="Secretaria" />)

    expect(screen.getByTestId('icon')).toHaveClass('text-foreground-light')
    expect(screen.getByText('Órgão')).toHaveClass('text-sm')
    expect(screen.getByText('Secretaria')).toBeInTheDocument()
  })
})
