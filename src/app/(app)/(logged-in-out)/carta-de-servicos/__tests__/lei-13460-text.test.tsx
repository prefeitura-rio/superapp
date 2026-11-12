import { LEI_13460_PARAGRAPHS } from '@/constants/carta-de-servicos'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Lei13460Text } from '../components/lei-13460-text'

function paragraphsIn(button: HTMLElement) {
  const id = button.getAttribute('aria-controls')
  const region = id ? document.getElementById(id) : null
  return region ? [...region.querySelectorAll('p')] : []
}

describe('Lei13460Text', () => {
  it('começa recolhido: 1º parágrafo inteiro e o 2º truncado', () => {
    render(<Lei13460Text />)
    const button = screen.getByRole('button', { name: 'Ver mais' })

    expect(button).toHaveAttribute('aria-expanded', 'false')
    const paragraphs = paragraphsIn(button)
    expect(paragraphs).toHaveLength(2)
    expect(paragraphs[0]).toHaveTextContent(LEI_13460_PARAGRAPHS[0])
    expect(paragraphs[0]).not.toHaveClass('line-clamp-4')
    expect(paragraphs[1]).toHaveClass('line-clamp-4')
  })

  it('"Ver mais" abre o texto todo e vira "Ver menos"; clicar de novo recolhe', async () => {
    const user = userEvent.setup()
    render(<Lei13460Text />)

    await user.click(screen.getByRole('button', { name: 'Ver mais' }))
    const expanded = screen.getByRole('button', { name: 'Ver menos' })
    expect(expanded).toHaveAttribute('aria-expanded', 'true')
    const paragraphs = paragraphsIn(expanded)
    expect(paragraphs).toHaveLength(LEI_13460_PARAGRAPHS.length)
    expect(paragraphs[1]).not.toHaveClass('line-clamp-4')

    await user.click(expanded)
    const collapsed = screen.getByRole('button', { name: 'Ver mais' })
    expect(paragraphsIn(collapsed)).toHaveLength(2)
  })
})
