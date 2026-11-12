import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Integração: Meu Currículo inteiro (acordeões, formulário e contexts reais)
 * com o link do acordeão Termos de Uso. Só as bordas são mockadas: router,
 * server actions e o sub-header.
 */

const { push, back, replace } = vi.hoisted(() => ({
  push: vi.fn(),
  back: vi.fn(),
  replace: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, back, replace, refresh: vi.fn() }),
  usePathname: () => '/servicos/trabalho/curriculo',
  useSearchParams: () => new URLSearchParams(),
}))
vi.mock('@/app/components/oportunidades/oportunidades-sub-header', () => ({
  OportunidadesSubHeader: () => null,
}))
vi.mock('canvas-confetti', () => ({ default: vi.fn() }))
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))
vi.mock('../save-termos-accept-action', () => ({
  saveTermosAcceptAction: vi.fn(async () => ({ success: true })),
}))
vi.mock('../save-formacao-action', () => ({
  saveFormacaoAccordion: vi.fn(async () => ({ success: true })),
}))
vi.mock('../save-situacao-action', () => ({
  saveSituacaoAction: vi.fn(async () => ({ success: true })),
}))
vi.mock('../habilidades-competencias/habilidades-competencias-actions', () => ({
  getHabilidadesCompetenciasAction: vi.fn(async () => ({
    ok: true,
    data: { area: null, conhecimentos: [], comportamentos: [] },
  })),
  searchAreasAtuacaoAction: vi.fn(async () => ({
    data: [],
    total: 0,
    page: 1,
    pageSize: 20,
  })),
  listConhecimentosDaAreaAction: vi.fn(async () => ({
    data: [],
    total: 0,
    page: 1,
    pageSize: 100,
  })),
  listComportamentosAction: vi.fn(async () => ({
    data: [],
    total: 0,
    page: 1,
    pageSize: 100,
  })),
  saveHabilidadesCompetenciasAction: vi.fn(),
}))

import { CurriculoContent } from '../curriculo-content'

const TERMOS_EMPREGOS = '/termos-de-uso/empregos?origem=curriculo'

function renderCurriculo(props: Parameters<typeof CurriculoContent>[0] = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <CurriculoContent cpf="12345678900" {...props} />
    </QueryClientProvider>
  )
}

function termsLink() {
  return screen.getByRole('link', {
    name: /Termos de Uso e nosso Aviso de Privacidade/,
  })
}

async function openAccordion(
  user: ReturnType<typeof userEvent.setup>,
  name: string
) {
  await user.click(screen.getByRole('button', { name: new RegExp(`^${name}`) }))
}

beforeEach(() => {
  push.mockReset()
  back.mockReset()
  replace.mockReset()
})

describe('Meu Currículo — link do acordeão Termos de Uso (integração)', () => {
  it('o acordeão Termos de Uso leva a "Termos de uso: Empregos" em nova aba, sem mudar o resto da seção', async () => {
    const user = userEvent.setup()
    renderCurriculo()

    await openAccordion(user, 'Termos de Uso')

    const link = termsLink()
    expect(link).toHaveAttribute('href', TERMOS_EMPREGOS)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(link).toHaveClass('underline')

    const section = link.closest('.space-y-6') as HTMLElement
    expect(
      within(section).getByText(/Ao preencher e enviar este formulário/)
    ).toBeInTheDocument()
    expect(
      within(section).getByText('Li e concordo com os termos de uso')
    ).toBeInTheDocument()
    expect(within(section).getByRole('checkbox')).not.toBeChecked()
    expect(
      within(section).getByRole('button', { name: 'Cancelar' })
    ).toBeInTheDocument()
    expect(
      within(section).getByRole('button', { name: 'Salvar' })
    ).toBeInTheDocument()
  })

  it('nenhum link do Meu Currículo aponta para a página antiga de termos', async () => {
    const user = userEvent.setup()
    const { container } = renderCurriculo()

    await openAccordion(user, 'Termos de Uso')

    expect(
      container.querySelector('a[href^="/servicos/trabalho/termos-de-uso"]')
    ).toBeNull()
    expect(
      container.querySelectorAll(`a[href="${TERMOS_EMPREGOS}"]`)
    ).toHaveLength(1)
  })

  /**
   * Cobre o currículo: o que foi preenchido (sem salvar) sobrevive a ir até o
   * acordeão Termos e clicar no link. Que o clique abre outra aba e deixa esta
   * intacta só dá para provar no navegador real (jsdom não navega): ver o E2E
   * "abre o texto completo em nova aba e o voltar fecha a aba, com o currículo
   * intacto" em e2e/termos-de-uso.spec.ts.
   */
  it('o que foi preenchido sem salvar continua lá depois de ir ao link dos termos', async () => {
    const user = userEvent.setup()
    renderCurriculo()

    await openAccordion(user, 'Formação')
    const nomeCurso = within(
      screen.getByTestId('formacao-card-0')
    ).getByPlaceholderText('Preencha com o nome do curso')
    await user.type(nomeCurso, 'Técnico em Informática')

    await openAccordion(user, 'Termos de Uso')
    await user.click(termsLink())

    expect(push).not.toHaveBeenCalled()
    expect(replace).not.toHaveBeenCalled()
    expect(back).not.toHaveBeenCalled()
    expect(
      screen.getByRole('heading', { level: 1, name: 'Meu Currículo' })
    ).toBeInTheDocument()

    await openAccordion(user, 'Formação')
    expect(
      within(screen.getByTestId('formacao-card-0')).getByPlaceholderText(
        'Preencha com o nome do curso'
      )
    ).toHaveValue('Técnico em Informática')
  })

  it('no currículo da candidatura o link é o mesmo', async () => {
    const user = userEvent.setup()
    renderCurriculo({ inscricaoVagaId: 'vaga-123' })

    await openAccordion(user, 'Termos de Uso')

    expect(termsLink()).toHaveAttribute('href', TERMOS_EMPREGOS)
    expect(termsLink()).toHaveAttribute('target', '_blank')
  })
})
