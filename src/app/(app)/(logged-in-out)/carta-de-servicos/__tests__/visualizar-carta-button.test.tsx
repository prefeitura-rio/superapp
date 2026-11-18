import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { VisualizarCartaButton } from '../components/visualizar-carta-button'

const HREF = '/api/carta-de-servicos/2951/pdf'

describe('VisualizarCartaButton', () => {
  it('abre a rota do PDF em aba nova, sem forçar download', () => {
    render(<VisualizarCartaButton href={HREF} />)
    const link = screen.getByRole('link', {
      name: /^Visualizar Carta de Serviços\s*\(abre em nova aba\)$/,
    })
    expect(link).toHaveAttribute('href', HREF)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(link).not.toHaveAttribute('download')
  })
})
