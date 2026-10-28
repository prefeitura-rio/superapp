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
