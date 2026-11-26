import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { OportunidadesCariocas } from '../oportunidades-cariocas'

// Handoff (PREF-716): a faixa intermediária começa na passagem de 576px.
// Convenção do repositório: `max-[576px]:` = mobile, `min-[577px]:` = intermediário.
const BREAKPOINT_INTERMEDIARIO = 'min-[577px]:'

function classesDe(element: Element): string[] {
  return (element.getAttribute('class') ?? '').split(/\s+/).filter(Boolean)
}

function todasAsClasses(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll('[class]')).flatMap(classesDe)
}

describe('OportunidadesCariocas', () => {
  it('não usa o breakpoint sm: (640px) do Tailwind', () => {
    const { container } = render(<OportunidadesCariocas />)

    const classesSm = todasAsClasses(container).filter(c => c.startsWith('sm:'))
    expect(classesSm).toEqual([])
  })

  it.each([
    ['Cursos Gratuitos', '/servicos/cursos'],
    ['Vagas de Trabalho', '/servicos/trabalho'],
  ])(
    'card "%s" troca de altura (240px → 160px) a partir de 577px',
    (titulo, href) => {
      render(<OportunidadesCariocas />)

      const card = screen.getByRole('link', { name: new RegExp(titulo) })
      expect(card).toHaveAttribute('href', href)
      const classes = classesDe(card)
      expect(classes).toContain('h-60')
      expect(classes).toContain(`${BREAKPOINT_INTERMEDIARIO}h-40`)
    }
  )

  it('alterna os grupos de personagem mobile/intermediário em 577px', () => {
    const { container } = render(<OportunidadesCariocas />)

    const classes = todasAsClasses(container)
    expect(
      classes.filter(c => c === `${BREAKPOINT_INTERMEDIARIO}hidden`)
    ).toHaveLength(4)
    expect(
      classes.filter(c => c === `${BREAKPOINT_INTERMEDIARIO}block`)
    ).toHaveLength(2)
  })

  it('aumenta a tipografia (título 16px, subtítulo e botão 14px, linha 20px) a partir de 577px', () => {
    render(<OportunidadesCariocas />)

    for (const titulo of ['Cursos Gratuitos', 'Vagas de Trabalho']) {
      expect(classesDe(screen.getByText(titulo))).toEqual(
        expect.arrayContaining([
          'text-sm',
          `${BREAKPOINT_INTERMEDIARIO}text-base`,
          'leading-4',
          `${BREAKPOINT_INTERMEDIARIO}leading-5`,
        ])
      )
    }

    for (const texto of [
      'Aulas presenciais e online',
      'Cadastre o seu currículo',
      'Ver cursos',
      'Ver vagas',
    ]) {
      expect(classesDe(screen.getByText(texto))).toEqual(
        expect.arrayContaining([
          'text-xs',
          `${BREAKPOINT_INTERMEDIARIO}text-sm`,
          'leading-4',
          `${BREAKPOINT_INTERMEDIARIO}leading-5`,
        ])
      )
    }
  })
})
