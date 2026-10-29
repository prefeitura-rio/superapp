import { AccessibilityPillBadge } from '@/app/components/courses/badges'
import { PcdIcon } from '@/assets/icons'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

/**
 * DEV-82 — o selo de acessibilidade dos cards de cursos usa o ícone de
 * acessibilidade do design system (PcdIcon, o mesmo das vagas), não o
 * `Accessibility` do lucide-react. O ícone segue decorativo (aria-hidden),
 * como era com o lucide: o texto do selo já descreve a acessibilidade.
 */

function pcdIconMarkup(): string {
  const { container, unmount } = render(
    <PcdIcon className="w-3 h-3 shrink-0" aria-hidden="true" />
  )
  const markup = container.innerHTML
  unmount()
  return markup
}

describe('AccessibilityPillBadge', () => {
  it.each([
    ['ACESSIVEL', 'Acessível PcD'],
    ['PREFERENCIAL', 'Preferencial PcD'],
    ['EXCLUSIVO', 'Exclusivo PcD'],
  ])('renderiza o PcdIcon do design system para %s', (accessibility, label) => {
    const expectedIcon = pcdIconMarkup()
    const { container } = render(
      <AccessibilityPillBadge accessibility={accessibility} />
    )

    const icons = container.querySelectorAll('svg')
    expect(icons).toHaveLength(1)
    expect(icons[0].outerHTML).toBe(expectedIcon)
    expect(container.querySelector('.lucide-accessibility')).toBeNull()
    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it.each([undefined, '', 'NAO_ACESSIVEL', 'qualquer'])(
    'não renderiza nada para %s',
    accessibility => {
      const { container } = render(
        <AccessibilityPillBadge accessibility={accessibility} />
      )
      expect(container).toBeEmptyDOMElement()
    }
  )
})
