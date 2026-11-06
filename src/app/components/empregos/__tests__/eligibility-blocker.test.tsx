import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { EligibilityBlocker } from '../eligibility-blocker'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/app/components/oportunidades/oportunidades-sub-header', () => ({
  OportunidadesSubHeader: () => null,
}))

describe('EligibilityBlocker', () => {
  it('mostra a frase PcD junto dos demais critérios na página de bloqueio atual', () => {
    render(
      <EligibilityBlocker
        failedCriterios={[
          { slug: 'idade_minima', label: 'Ter pelo menos 18 anos' },
          {
            slug: 'pcd',
            label: 'Ser pessoa com deficiência (Física, Auditiva ou Visual)',
          },
        ]}
      />
    )

    expect(
      screen.getByRole('heading', {
        name: 'Você não atende aos requisitos dessa vaga',
      })
    ).toBeInTheDocument()
    const itens = screen.getAllByRole('listitem').map(li => li.textContent)
    expect(itens).toEqual([
      'Ter pelo menos 18 anos',
      'Ser pessoa com deficiência (Física, Auditiva ou Visual)',
    ])
  })

  it('mostra a frase PcD sem tipos', () => {
    render(
      <EligibilityBlocker
        failedCriterios={[{ slug: 'pcd', label: 'Ser pessoa com deficiência' }]}
      />
    )
    expect(screen.getByRole('listitem')).toHaveTextContent(
      'Ser pessoa com deficiência'
    )
  })
})
