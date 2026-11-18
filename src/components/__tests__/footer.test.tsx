import { CARTA_DE_SERVICOS_ROUTE } from '@/constants/carta-de-servicos'
import { TERMOS_DE_USO_ROUTE } from '@/constants/termos-de-uso/platforms'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Footer } from '../footer'

describe('Footer', () => {
  it('exibe informações de endereço da prefeitura', () => {
    render(<Footer />)
    expect(
      screen.getByText('Prefeitura da Cidade do Rio de Janeiro'),
    ).toBeTruthy()
    expect(screen.getByText('Rua Afonso Cavalcanti, 455')).toBeTruthy()
    expect(screen.getByText('CNPJ: 42.498.733/0001-48')).toBeTruthy()
  })

  it('exibe os dois botões de telefone', () => {
    render(<Footer />)
    expect(screen.getAllByText('1746').length).toBeGreaterThan(0)
    expect(screen.getAllByText('(21) 3460-1746').length).toBeGreaterThan(0)
  })

  it('tem link "Carta de serviços" apontando para a rota correta', () => {
    render(<Footer />)
    const links = screen.getAllByRole('link', { name: 'Carta de serviços' })
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) {
      expect(link).toHaveAttribute('href', CARTA_DE_SERVICOS_ROUTE)
    }
  })

  it('tem link "Termos de uso" apontando para a rota correta', () => {
    render(<Footer />)
    const links = screen.getAllByRole('link', { name: 'Termos de uso' })
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) {
      expect(link).toHaveAttribute('href', TERMOS_DE_USO_ROUTE)
    }
  })

  it('tem link de Transparência apontando para o portal de transparência', () => {
    render(<Footer />)
    const link = screen.getByRole('link', { name: 'Acesso à Informação' })
    expect(link).toHaveAttribute('href', 'https://transparencia.prefeitura.rio/')
  })

  it('tem link "Oportunidades cariocas" apontando para /servicos/trabalho', () => {
    render(<Footer />)
    const link = screen.getByRole('link', { name: 'Oportunidades cariocas' })
    expect(link).toHaveAttribute('href', '/servicos/trabalho')
  })
})
