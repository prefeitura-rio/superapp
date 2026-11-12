import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TermosDeUsoContent } from '../termos-de-uso-content'

vi.mock('@/app/components/oportunidades/oportunidades-sub-header', () => ({
  OportunidadesSubHeader: () => <header />,
}))

describe('TermosDeUsoContent (trabalho)', () => {
  it('só tem <li> como filhos diretos de <ul> e <ol> (axe-core: list)', () => {
    const { container } = render(<TermosDeUsoContent />)

    const lists = container.querySelectorAll('ul, ol')
    expect(lists.length).toBeGreaterThan(0)

    const invalidChildren = Array.from(lists).flatMap(list =>
      Array.from(list.children)
        .filter(child => child.tagName !== 'LI')
        .map(child => `${child.tagName}: ${child.textContent?.slice(0, 40)}`)
    )
    expect(invalidChildren).toEqual([])
  })

  it('anuncia os direitos 5.1 a 5.5 como itens de uma mesma lista', () => {
    render(<TermosDeUsoContent />)

    const item51 = screen.getByText(/^5\.1\. Participação no acompanhamento/)
    expect(item51.tagName).toBe('LI')

    const list = item51.closest('ul')
    expect(list).not.toBeNull()
    const items = within(list as HTMLElement).getAllByRole('listitem')
    expect(items.map(item => item.textContent?.slice(0, 4))).toEqual([
      '5.1.',
      '5.2.',
      '5.3.',
      '5.4.',
      '5.5.',
    ])
  })
})
