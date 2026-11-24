import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

const toastMock = vi.hoisted(() => Object.assign(vi.fn(), { error: vi.fn() }))
vi.mock('react-hot-toast', () => ({ default: toastMock, toast: toastMock }))

import { ServiceRating } from '../service-rating'

const TARGET = { slug: 'servico-teste', articleId: 'ka089000000BUO5AAO' }
const ENDPOINT = '/api/servicos/servico-teste/avaliacao'

let fetchMock: ReturnType<typeof vi.fn>

function okResponse() {
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}

function sentBodies() {
  return fetchMock.mock.calls.map(([url, init]) => {
    expect(url).toBe(ENDPOINT)
    return JSON.parse((init as RequestInit).body as string)
  })
}

function setup() {
  const user = userEvent.setup()
  render(<ServiceRating target={TARGET} />)
  return {
    user,
    like: () => screen.getByRole('button', { name: 'Sim, foi útil' }),
    dislike: () => screen.getByRole('button', { name: 'Não foi útil' }),
    submit: () => screen.getByRole('button', { name: 'Enviar avaliação' }),
    chip: (name: string) => screen.getByRole('button', { name }),
  }
}

describe('ServiceRating', () => {
  beforeEach(() => {
    fetchMock = vi.fn().mockImplementation(async () => okResponse())
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    toastMock.mockClear()
    toastMock.error.mockClear()
  })

  test('like envia na hora e mostra o agradecimento por 3 segundos', async () => {
    const { user, like } = setup()

    await user.click(like())

    await waitFor(() =>
      expect(sentBodies()).toEqual([
        { vote: 'up', articleId: TARGET.articleId },
      ])
    )
    expect(like()).toHaveAttribute('aria-pressed', 'true')
    expect(toastMock).toHaveBeenCalledWith(
      'Obrigado pela avaliação!',
      expect.objectContaining({ duration: 3000 })
    )
  })

  test('clicar de novo no like já enviado não envia nada, só agradece', async () => {
    const { user, like } = setup()

    await user.click(like())
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    await user.click(like())

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(toastMock).toHaveBeenCalledTimes(2)
  })

  test('dislike só abre o formulário; o envio é em "Enviar avaliação"', async () => {
    const { user, dislike, submit, chip } = setup()

    await user.click(dislike())

    expect(fetchMock).not.toHaveBeenCalled()
    expect(dislike()).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('O que podemos melhorar?')).toBeInTheDocument()
    expect(submit()).toBeDisabled()

    await user.click(chip('Informação desatualizada'))
    await user.click(chip('Difícil de entender'))
    await user.click(submit())

    await waitFor(() =>
      expect(sentBodies()).toEqual([
        {
          vote: 'down',
          articleId: TARGET.articleId,
          rejectionReasons: ['Informacao_desatualizada', 'Dificil_de_entender'],
        },
      ])
    )
    await waitFor(() =>
      expect(screen.queryByText('O que podemos melhorar?')).toBeNull()
    )
    expect(toastMock).toHaveBeenCalledWith(
      'Obrigado pela avaliação!',
      expect.anything()
    )
  })

  test('"Outro motivo" mostra o campo e, ao desmarcar, esconde e apaga o texto', async () => {
    const { user, dislike, chip } = setup()

    await user.click(dislike())
    expect(screen.queryByLabelText('Quer explicar melhor?')).toBeNull()

    await user.click(chip('Outro motivo'))
    await user.type(
      screen.getByLabelText('Quer explicar melhor?'),
      'O endereço mudou.'
    )
    await user.click(chip('Outro motivo'))
    expect(screen.queryByLabelText('Quer explicar melhor?')).toBeNull()

    await user.click(chip('Outro motivo'))
    expect(screen.getByLabelText('Quer explicar melhor?')).toHaveValue('')
  })

  test('comentário vai junto só com "Outro motivo" marcado', async () => {
    const { user, dislike, chip, submit } = setup()

    await user.click(dislike())
    await user.click(chip('Outro motivo'))
    await user.type(
      screen.getByLabelText('Quer explicar melhor?'),
      'O endereço mudou.'
    )
    await user.click(submit())

    await waitFor(() =>
      expect(sentBodies()).toEqual([
        {
          vote: 'down',
          articleId: TARGET.articleId,
          rejectionReasons: ['Outro_motivo'],
          rejectionDescription: 'O endereço mudou.',
        },
      ])
    )
  })

  test('de dislike para like fecha o formulário, descarta os motivos e envia o like', async () => {
    const { user, like, dislike, chip } = setup()

    await user.click(dislike())
    await user.click(chip('Informação incorreta'))
    await user.click(like())

    await waitFor(() =>
      expect(sentBodies()).toEqual([
        { vote: 'up', articleId: TARGET.articleId },
      ])
    )
    expect(screen.queryByText('O que podemos melhorar?')).toBeNull()
    expect(like()).toHaveAttribute('aria-pressed', 'true')

    await user.click(dislike())
    expect(chip('Informação incorreta')).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })

  test('de like para dislike não envia nada ao abrir o formulário', async () => {
    const { user, like, dislike } = setup()

    await user.click(like())
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    await user.click(dislike())

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(screen.getByText('O que podemos melhorar?')).toBeInTheDocument()

    // Voltar ao like já registrado não envia de novo.
    await user.click(like())
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('O que podemos melhorar?')).toBeNull()
  })

  test('clicar de novo no dislike já enviado não envia nada, só agradece', async () => {
    const { user, dislike, chip, submit } = setup()

    await user.click(dislike())
    await user.click(chip('Informação incompleta'))
    await user.click(submit())
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))

    await user.click(dislike())

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('O que podemos melhorar?')).toBeNull()
    expect(toastMock).toHaveBeenCalledTimes(2)
  })

  test('like, dislike e "Enviar avaliação" ficam desabilitados durante o envio', async () => {
    let release: (response: Response) => void = () => {}
    fetchMock.mockImplementation(
      () =>
        new Promise<Response>(resolve => {
          release = resolve
        })
    )
    const { user, like, dislike, chip, submit } = setup()

    await user.click(dislike())
    await user.click(chip('Informação incompleta'))
    await user.click(submit())

    await waitFor(() => expect(submit()).toBeDisabled())
    expect(like()).toBeDisabled()
    expect(dislike()).toBeDisabled()

    release(okResponse())
    await waitFor(() => expect(like()).toBeEnabled())
  })

  test('falha no envio mostra erro neutro e desfaz a seleção do like', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ code: 'unavailable' }), { status: 503 })
    )
    const { user, like } = setup()

    await user.click(like())

    await waitFor(() => expect(toastMock.error).toHaveBeenCalled())
    expect(like()).toHaveAttribute('aria-pressed', 'false')
    expect(toastMock).not.toHaveBeenCalled()
  })
})
