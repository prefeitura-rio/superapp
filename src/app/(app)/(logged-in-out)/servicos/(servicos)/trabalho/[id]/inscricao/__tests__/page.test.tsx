import { getApiV1EmpregabilidadeCandidaturasUsuarioCpf } from '@/http-courses/empregabilidade-candidaturas/empregabilidade-candidaturas'
import { getApiV1EmpregabilidadeOnboardingCpf } from '@/http-courses/empregabilidade-onboarding/empregabilidade-onboarding'
import { getApiPublicEmpregabilidadeVagasId } from '@/http-courses/empregabilidade-vagas-public/empregabilidade-vagas-public'
import { getDalCitizenCpf } from '@/lib/dal'
import { redirect } from 'next/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import InscricaoPage from '../page'

/**
 * A inscrição só abre para vaga ativa (mesma regra da página de detalhe):
 * vaga expirada, congelada ou descontinuada volta ao detalhe, que mostra
 * "Inscrições encerradas", em vez de percorrer o fluxo até o backend recusar.
 */

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  }),
}))
vi.mock(
  '@/http-courses/empregabilidade-candidaturas/empregabilidade-candidaturas',
  () => ({ getApiV1EmpregabilidadeCandidaturasUsuarioCpf: vi.fn() })
)
vi.mock(
  '@/http-courses/empregabilidade-onboarding/empregabilidade-onboarding',
  () => ({ getApiV1EmpregabilidadeOnboardingCpf: vi.fn() })
)
vi.mock(
  '@/http-courses/empregabilidade-vagas-public/empregabilidade-vagas-public',
  () => ({ getApiPublicEmpregabilidadeVagasId: vi.fn() })
)
vi.mock('@/lib/dal', () => ({ getDalCitizenCpf: vi.fn() }))
vi.mock('../enviar-candidatura-action', () => ({
  enviarCandidatura: vi.fn(),
}))
vi.mock('../inscricao-flow-carousel', () => ({
  InscricaoFlowCarousel: () => null,
}))

const VAGA_ID = '00000000-0000-4000-8000-000000000001'

function mockVaga(status: string) {
  vi.mocked(getApiPublicEmpregabilidadeVagasId).mockResolvedValue({
    status: 200,
    data: { id: VAGA_ID, titulo: 'Vaga sintética', status },
  } as unknown as Awaited<
    ReturnType<typeof getApiPublicEmpregabilidadeVagasId>
  >)
}

function renderPage() {
  return InscricaoPage({
    params: Promise.resolve({ id: VAGA_ID }),
    searchParams: Promise.resolve({}),
  })
}

describe('InscricaoPage — status da vaga', () => {
  beforeEach(() => {
    vi.mocked(redirect).mockClear()
    vi.mocked(getApiV1EmpregabilidadeCandidaturasUsuarioCpf).mockResolvedValue({
      status: 200,
      data: { data: [], meta: { page: 1, page_size: 1, total: 0 } },
    } as unknown as Awaited<
      ReturnType<typeof getApiV1EmpregabilidadeCandidaturasUsuarioCpf>
    >)
    vi.mocked(getApiV1EmpregabilidadeOnboardingCpf).mockResolvedValue({
      status: 200,
      data: { is_first_login: false },
    } as unknown as Awaited<
      ReturnType<typeof getApiV1EmpregabilidadeOnboardingCpf>
    >)
    vi.mocked(getDalCitizenCpf).mockResolvedValue({
      status: 200,
      data: { cpf: '12345678901', nome: 'Pessoa Sintética' },
    } as unknown as Awaited<ReturnType<typeof getDalCitizenCpf>>)
  })

  it.each(['publicado_expirado', 'vaga_congelada', 'vaga_descontinuada'])(
    'vaga %s redireciona ao detalhe sem abrir o fluxo',
    async status => {
      mockVaga(status)

      await expect(renderPage()).rejects.toThrow(
        `NEXT_REDIRECT:/servicos/trabalho/${VAGA_ID}`
      )
      expect(redirect).toHaveBeenCalledWith(`/servicos/trabalho/${VAGA_ID}`)
    }
  )

  it('vaga publicado_ativo abre o fluxo de inscrição', async () => {
    mockVaga('publicado_ativo')

    const page = await renderPage()

    expect(page).toBeTruthy()
    expect(redirect).not.toHaveBeenCalled()
  })
})
