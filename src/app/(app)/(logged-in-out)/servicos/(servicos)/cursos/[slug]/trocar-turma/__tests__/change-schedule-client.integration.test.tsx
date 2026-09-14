import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { ChangeScheduleClient } from '../components/change-schedule-client'

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// Mock react-hot-toast
const mockToastError = vi.fn()
vi.mock('react-hot-toast', () => ({
  default: { error: (m: string) => mockToastError(m) },
}))

// Mock canvas-confetti (o slide de sucesso dispara confete → canvas null em jsdom)
vi.mock('canvas-confetti', () => ({ default: vi.fn() }))

// Mock swiper (reutiliza o mock do fluxo de confirmar-informacoes)
vi.mock('swiper/react', async () => {
  const { MockSwiper, MockSwiperSlide } = await import(
    '../../../confirmar-informacoes/components/__tests__/mocks/swiper'
  )
  return { Swiper: MockSwiper, SwiperSlide: MockSwiperSlide }
})
vi.mock('swiper/modules', () => ({ Pagination: {} }))
vi.mock('swiper/css', () => ({}))
vi.mock('swiper/css/pagination', () => ({}))

// Mock server action
vi.mock('@/actions/courses/change-schedule', () => ({
  changeSchedule: vi.fn(),
}))

import { changeSchedule } from '@/actions/courses/change-schedule'

const mockChangeSchedule = vi.mocked(changeSchedule)

const courseSlug = '123-curso-teste'
const course = { id: 123 }

const onlineSchedule = {
  id: 'sch-new',
  vacancies: 10,
  remaining_vacancies: 5,
  class_start_date: '2026-03-01',
  class_end_date: '2026-06-01',
  class_time: '09:00-12:00',
  class_days: 'Seg, Qua, Sex',
}

// Inscrição atual em uma turma diferente da nova (para não desabilitar a opção)
const userEnrollment = {
  id: 'enr-1',
  status: 'approved',
  course_id: 123,
  schedule_id: 'sch-antiga',
  enrolled_unit: { id: 'unit-antiga' },
} as never

function renderOnlineFlow() {
  return render(
    <ChangeScheduleClient
      course={course}
      userEnrollment={userEnrollment}
      nearbyUnits={[]}
      onlineClasses={[onlineSchedule] as never}
      courseSlug={courseSlug}
      isOnlineCourse={true}
    />
  )
}

describe('ChangeScheduleClient (integração)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockChangeSchedule.mockResolvedValue({ success: true })
  })

  test('renderiza o slide de seleção de turma e o botão "Confirmar troca"', () => {
    renderOnlineFlow()

    expect(
      screen.getByText(/datas e horários disponíveis/i)
    ).toBeInTheDocument()
    expect(screen.getByTestId('back-button')).toBeInTheDocument()
    // Slide único (curso online) → botão final
    expect(
      screen.getByRole('button', { name: /Confirmar troca/i })
    ).toBeInTheDocument()
  })

  test('botão voltar no primeiro slide volta para a página do curso', async () => {
    const user = userEvent.setup()
    renderOnlineFlow()

    await user.click(screen.getByTestId('back-button'))

    expect(mockPush).toHaveBeenCalledWith(`/servicos/cursos/${courseSlug}`)
  })

  test('selecionar turma e confirmar chama changeSchedule e mostra sucesso', async () => {
    const user = userEvent.setup()
    renderOnlineFlow()

    // Seleciona a turma nova
    await user.click(screen.getByRole('radio'))

    // Confirma a troca (sem validação bloqueante)
    await user.click(screen.getByRole('button', { name: /Confirmar troca/i }))

    await waitFor(
      () => {
        expect(mockChangeSchedule).toHaveBeenCalledWith(
          expect.objectContaining({
            enrollmentId: 'enr-1',
            courseId: 123,
            scheduleId: 'sch-new',
          })
        )
      },
      { timeout: 5000 }
    )

    // O heading é quebrado em spans; usar o nome acessível (texto concatenado)
    await waitFor(
      () => {
        expect(
          screen.getByRole('heading', {
            name: /troca de turma e horário foi aceita/i,
          })
        ).toBeInTheDocument()
      },
      { timeout: 5000 }
    )
  }, 15000)

  test('erro da action exibe toast de erro', async () => {
    const user = userEvent.setup()
    mockChangeSchedule.mockResolvedValue({
      success: false,
      error: 'Prazo mínimo de 72h não respeitado',
    })
    renderOnlineFlow()

    await user.click(screen.getByRole('radio'))
    await user.click(screen.getByRole('button', { name: /Confirmar troca/i }))

    await waitFor(
      () => {
        expect(mockToastError).toHaveBeenCalledWith(
          'Prazo mínimo de 72h não respeitado'
        )
      },
      { timeout: 5000 }
    )
  }, 15000)

  // A troca de turma tinha o mesmo furo do fluxo de inscrição: só olhava vagas.
  // O backend não valida a janela no ChangeSchedule, então uma turma vencida
  // oferecida aqui vira uma troca indevida — não só um erro no final.
  describe('período de inscrição por turma', () => {
    const janelaAberta = {
      enrollment_start_date: '2020-01-01T00:00:00Z',
      enrollment_end_date: '2099-12-31T23:59:59Z',
    }
    const janelaEncerrada = {
      enrollment_start_date: '2020-01-01T00:00:00Z',
      enrollment_end_date: '2021-01-01T00:00:00Z',
    }

    function renderComTurmas(extra: Record<string, unknown>[]) {
      return render(
        <ChangeScheduleClient
          course={course}
          userEnrollment={userEnrollment}
          nearbyUnits={[]}
          onlineClasses={extra as never}
          courseSlug={courseSlug}
          isOnlineCourse={true}
        />
      )
    }

    test('não oferece turma com vaga porém fora do prazo', () => {
      renderComTurmas([
        { ...onlineSchedule, id: 'sch-aberta', ...janelaAberta },
        { ...onlineSchedule, id: 'sch-encerrada', ...janelaEncerrada },
      ])

      // Só a turma dentro do prazo é ofertada; a vencida some da seleção
      expect(screen.getAllByRole('radio')).toHaveLength(1)
    })

    test('confirma a troca com a turma que está no prazo', async () => {
      const user = userEvent.setup()
      renderComTurmas([
        { ...onlineSchedule, id: 'sch-encerrada', ...janelaEncerrada },
        { ...onlineSchedule, id: 'sch-aberta', ...janelaAberta },
      ])

      // Só há um radio (a vencida foi filtrada): tem de ser a que está no prazo
      await user.click(screen.getByRole('radio'))
      await user.click(screen.getByRole('button', { name: /Confirmar troca/i }))

      await waitFor(
        () => {
          expect(mockChangeSchedule).toHaveBeenCalledWith(
            expect.objectContaining({ scheduleId: 'sch-aberta' })
          )
        },
        { timeout: 5000 }
      )
    }, 15000)
  })
})
