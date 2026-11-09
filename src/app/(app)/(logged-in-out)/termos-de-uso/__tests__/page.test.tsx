import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const push = vi.fn()
const back = vi.fn()

vi.mock('@/app/components/header-wrapper-client', () => ({
  default: () => <header data-testid="header-global" />,
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, back }),
}))

import TermosDeUsoPage from '../page'

function platformLinks() {
  const nav = screen.getByRole('navigation', { name: 'Plataformas' })
  return within(nav).queryAllByRole('link')
}

beforeEach(() => {
  push.mockReset()
  back.mockReset()
})

describe('/termos-de-uso', () => {
  it('mostra o Header Global, título, subtítulo e campo de busca', () => {
    render(<TermosDeUsoPage />)

    expect(screen.getByTestId('header-global')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 1, name: 'Termos de uso' })
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Encontre os termos de uso das nossas plataformas e saiba mais sobre as condições de utilização de cada serviço'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByRole('searchbox', { name: 'Buscar plataforma' })
    ).toBeInTheDocument()
  })

  it('lista as 5 plataformas na ordem do card, cada uma apontando para o seu detalhe', () => {
    render(<TermosDeUsoPage />)

    const links = platformLinks()
    expect(links.map(link => link.textContent)).toEqual([
      'PrefRio Site',
      'PrefRio Central Telefonica',
      'PrefRio Whatsapp',
      'Cursos',
      'Empregos',
    ])
    expect(links.map(link => link.getAttribute('href'))).toEqual([
      '/termos-de-uso/prefrio-site',
      '/termos-de-uso/prefrio-central-telefonica',
      '/termos-de-uso/prefrio-whatsapp',
      '/termos-de-uso/cursos',
      '/termos-de-uso/empregos',
    ])
  })

  it('a busca filtra pelo nome, sem diferenciar acento nem caixa', async () => {
    const user = userEvent.setup()
    render(<TermosDeUsoPage />)
    const search = screen.getByRole('searchbox', { name: 'Buscar plataforma' })

    await user.type(search, 'prefrio')
    expect(platformLinks().map(link => link.textContent)).toEqual([
      'PrefRio Site',
      'PrefRio Central Telefonica',
      'PrefRio Whatsapp',
    ])

    await user.clear(search)
    await user.type(search, 'TELEFÔNICA')
    expect(platformLinks().map(link => link.textContent)).toEqual([
      'PrefRio Central Telefonica',
    ])

    await user.clear(search)
    expect(platformLinks()).toHaveLength(5)
  })

  it('o X do design system só aparece com texto, limpa a busca e devolve o foco', async () => {
    const user = userEvent.setup()
    render(<TermosDeUsoPage />)
    const search = screen.getByRole('searchbox', { name: 'Buscar plataforma' })

    expect(
      screen.queryByRole('button', { name: 'Limpar busca' })
    ).not.toBeInTheDocument()

    await user.type(search, 'cursos')
    expect(platformLinks()).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: 'Limpar busca' }))

    expect(search).toHaveValue('')
    expect(search).toHaveFocus()
    expect(platformLinks()).toHaveLength(5)
    expect(
      screen.queryByRole('button', { name: 'Limpar busca' })
    ).not.toBeInTheDocument()
  })

  it('esconde o X nativo do campo de busca', () => {
    render(<TermosDeUsoPage />)

    const wrapper = screen.getByRole('searchbox', {
      name: 'Buscar plataforma',
    }).parentElement
    expect(wrapper).toHaveClass(
      '[&_input::-webkit-search-cancel-button]:hidden'
    )
  })

  it('segue o Figma: itens em 14px com respiro antes da divisória e busca com estado focused', () => {
    render(<TermosDeUsoPage />)

    for (const link of platformLinks()) {
      expect(link).toHaveClass('pb-6')
      expect(within(link).getByText(link.textContent ?? '')).toHaveClass(
        'text-sm'
      )
    }
    expect(screen.getByRole('search')).toHaveClass(
      'focus-within:ring-2',
      'focus-within:ring-ring'
    )
  })

  it('avisa quando nenhuma plataforma bate com a busca', async () => {
    const user = userEvent.setup()
    render(<TermosDeUsoPage />)

    await user.type(
      screen.getByRole('searchbox', { name: 'Buscar plataforma' }),
      'ouvidoria'
    )

    expect(platformLinks()).toHaveLength(0)
    expect(screen.getByRole('status')).toHaveTextContent(
      'Nenhuma plataforma encontrada para “ouvidoria”.'
    )
  })

  it('voltar sem página anterior do site leva para a home', async () => {
    const user = userEvent.setup()
    render(<TermosDeUsoPage />)

    await user.click(screen.getByRole('button', { name: 'Voltar' }))

    expect(push).toHaveBeenCalledWith('/')
    expect(back).not.toHaveBeenCalled()
  })
})
