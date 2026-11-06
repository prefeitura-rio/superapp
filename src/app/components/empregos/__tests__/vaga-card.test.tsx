import type { EmpregabilidadeVaga } from '@/http-courses/models'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { VagaCard } from '../vaga-card'
import { transformVagaToCardData } from '../vagas-utils'

const UUID = '45a1378e-9452-44ac-abbe-337e42eae217'
const SLUG = 'agente-de-campo-45a1378e9452'

function vaga(
  overrides: Partial<EmpregabilidadeVaga> = {}
): EmpregabilidadeVaga {
  return {
    id: UUID,
    slug: SLUG,
    titulo: 'Agente de Campo',
    status: 'publicado_ativo',
    ...overrides,
  }
}

describe('VagaCard — URL de SEO', () => {
  it('leva o slug da API para o card', () => {
    expect(transformVagaToCardData(vaga())).toMatchObject({
      id: UUID,
      slug: SLUG,
    })
  })

  it('aponta para /servicos/trabalho/<slug>', () => {
    render(<VagaCard vaga={transformVagaToCardData(vaga())} variant="all" />)

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      `/servicos/trabalho/${SLUG}`
    )
  })

  it('mantém o link pelo id quando a vaga não tem slug', () => {
    render(
      <VagaCard
        vaga={transformVagaToCardData(vaga({ slug: undefined }))}
        variant="recent"
      />
    )

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      `/servicos/trabalho/${UUID}`
    )
  })
})

// Razão de contraste WCAG 2.x entre duas cores RGB (0–255)
function contrastRatio(
  a: [number, number, number],
  b: [number, number, number]
): number {
  const luminance = (rgb: [number, number, number]) => {
    const [r, g, bl] = rgb.map(c => {
      const s = c / 255
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl
  }
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

describe('VagaCard — contraste do "Publicada em" (WCAG AA)', () => {
  const RECENT_BG: [number, number, number] = [0x3e, 0x57, 0x82]
  const card = {
    id: UUID,
    slug: SLUG,
    titulo: 'Agente de Campo',
    empresaNome: 'Empresa Exemplo',
    badges: [],
    dataPublicacao: '01/11/2026',
  }

  it('usa branco com opacidade de contraste ≥ 4.5:1 sobre o fundo do card recente', () => {
    render(<VagaCard vaga={card} variant="recent" />)

    expect(screen.getByRole('link').className).toContain('bg-[#3E5782]')
    const publicada = screen.getByText('Publicada em 01/11/2026')
    expect(publicada.className).not.toContain('rgba(255,255,255,0.60)')

    const match = publicada.className.match(
      /(?:^|\s)text-white(?:\/(\d+))?(?:\s|$)/
    )
    expect(match).not.toBeNull()
    const alpha = match?.[1] ? Number(match[1]) / 100 : 1
    const blended = RECENT_BG.map(c => alpha * 255 + (1 - alpha) * c) as [
      number,
      number,
      number,
    ]

    expect(contrastRatio(blended, RECENT_BG)).toBeGreaterThanOrEqual(4.5)
  })

  it('mantém a cor da variante "all"', () => {
    render(<VagaCard vaga={card} variant="all" />)

    expect(screen.getByText('Publicada em 01/11/2026').className).toContain(
      'text-[#0084D1]'
    )
  })
})
