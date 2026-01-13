import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { ConfirmInscriptionClient } from '../confirm-inscription-client'

import {
  completeUserInfo,
  incompleteUserInfo,
  userAuthInfo,
  userAuthInfoIncomplete,
} from './fixtures/user-info'
import {
  nearbyUnitsSingle,
  emptyUnits,
  onlineClassesSingle,
} from './fixtures/nearby-units'
import { basicCourseInfo, courseId, courseSlug } from './fixtures/course-info'

// Mock next/navigation
const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => new URLSearchParams(),
}))

// Mock react-hot-toast
const mockToastError = vi.fn()

vi.mock('react-hot-toast', () => ({
  toast: {
    error: (message: string) => mockToastError(message),
  },
}))

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}))

// Mock swiper modules
vi.mock('swiper/react', async () => {
  const { MockSwiper, MockSwiperSlide } = await import('./mocks/swiper')
  return {
    Swiper: MockSwiper,
    SwiperSlide: MockSwiperSlide,
  }
})

vi.mock('swiper/modules', () => ({
  Pagination: {},
}))

vi.mock('swiper/css', () => ({}))
vi.mock('swiper/css/pagination', () => ({}))

// Mock server action
vi.mock('@/actions/courses/submit-inscription', () => ({
  submitCourseInscription: vi.fn(),
}))

// Mock ThemeAwareVideo
vi.mock('@/components/ui/custom/theme-aware-video', () => ({
  ThemeAwareVideo: () => <div data-testid="theme-aware-video" />,
}))

// Import mocked server action
import { submitCourseInscription } from '@/actions/courses/submit-inscription'

const mockSubmitCourseInscription = vi.mocked(submitCourseInscription)

describe('ConfirmInscriptionClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSubmitCourseInscription.mockResolvedValue({ success: true })
  })

  describe('renderization', () => {
    test('renders initial slide with complete user data', () => {
      render(
        <ConfirmInscriptionClient
          userInfo={completeUserInfo}
          userAuthInfo={userAuthInfo}
          nearbyUnits={nearbyUnitsSingle}
          courseInfo={basicCourseInfo}
          courseId={courseId}
          courseSlug={courseSlug}
        />
      )

      expect(
        screen.getByText(/confirme suas informações/i)
      ).toBeInTheDocument()
      expect(screen.getByText(userAuthInfo.name)).toBeInTheDocument()
    })

    test('renders with incomplete user data showing required field indicators', () => {
      render(
        <ConfirmInscriptionClient
          userInfo={incompleteUserInfo}
          userAuthInfo={userAuthInfoIncomplete}
          nearbyUnits={nearbyUnitsSingle}
          courseInfo={basicCourseInfo}
          courseId={courseId}
          courseSlug={courseSlug}
        />
      )

      expect(screen.getByText(/Informe seu celular/i)).toBeInTheDocument()
      expect(screen.getByText(/Informe seu e-mail/i)).toBeInTheDocument()
      expect(screen.getByText(/Informe seu endereço/i)).toBeInTheDocument()
    })

    test('renders required fields message when user data is incomplete', () => {
      render(
        <ConfirmInscriptionClient
          userInfo={incompleteUserInfo}
          userAuthInfo={userAuthInfoIncomplete}
          nearbyUnits={nearbyUnitsSingle}
          courseInfo={basicCourseInfo}
          courseId={courseId}
          courseSlug={courseSlug}
        />
      )

      expect(
        screen.getByText(/Campos obrigatórios devem ser preenchidos/i)
      ).toBeInTheDocument()
    })
  })

  describe('validation', () => {
    test('disables continue button when required fields are missing', () => {
      render(
        <ConfirmInscriptionClient
          userInfo={incompleteUserInfo}
          userAuthInfo={userAuthInfoIncomplete}
          nearbyUnits={nearbyUnitsSingle}
          courseInfo={basicCourseInfo}
          courseId={courseId}
          courseSlug={courseSlug}
        />
      )

      const continueButton = screen.getByRole('button', {
        name: /Continuar/i,
      })
      expect(continueButton).toBeDisabled()
    })

    test('enables continue button when all required fields are filled', () => {
      render(
        <ConfirmInscriptionClient
          userInfo={completeUserInfo}
          userAuthInfo={userAuthInfo}
          nearbyUnits={nearbyUnitsSingle}
          courseInfo={basicCourseInfo}
          courseId={courseId}
          courseSlug={courseSlug}
        />
      )

      const continueButton = screen.getByRole('button', {
        name: /Confirmar inscrição/i,
      })
      expect(continueButton).not.toBeDisabled()
    })
  })

  describe('submission success', () => {
    test('shows success slide after successful submission', async () => {
      const user = userEvent.setup()

      mockSubmitCourseInscription.mockResolvedValue({
        success: true,
        data: { id: 'enrollment-123' },
      })

      render(
        <ConfirmInscriptionClient
          userInfo={completeUserInfo}
          userAuthInfo={userAuthInfo}
          nearbyUnits={nearbyUnitsSingle}
          courseInfo={basicCourseInfo}
          courseId={courseId}
          courseSlug={courseSlug}
        />
      )

      const confirmButton = screen.getByRole('button', {
        name: /Confirmar inscrição/i,
      })

      await user.click(confirmButton)

      await waitFor(
        () => {
          expect(screen.getByText(/Inscrição enviada/i)).toBeInTheDocument()
        },
        { timeout: 5000 }
      )
    })

    test('calls submitCourseInscription with correct data', async () => {
      const user = userEvent.setup()

      mockSubmitCourseInscription.mockResolvedValue({
        success: true,
        data: { id: 'enrollment-123' },
      })

      render(
        <ConfirmInscriptionClient
          userInfo={completeUserInfo}
          userAuthInfo={userAuthInfo}
          nearbyUnits={nearbyUnitsSingle}
          courseInfo={basicCourseInfo}
          courseId={courseId}
          courseSlug={courseSlug}
        />
      )

      const confirmButton = screen.getByRole('button', {
        name: /Confirmar inscrição/i,
      })

      await user.click(confirmButton)

      await waitFor(() => {
        expect(mockSubmitCourseInscription).toHaveBeenCalledWith(
          expect.objectContaining({
            courseId: courseId,
            userInfo: expect.objectContaining({
              cpf: userAuthInfo.cpf,
              name: userAuthInfo.name,
            }),
          })
        )
      })
    })
  })

  describe('submission error', () => {
    test('shows error toast and redirects on API error', async () => {
      const user = userEvent.setup()

      mockSubmitCourseInscription.mockResolvedValue({
        success: false,
        error: 'Usuário já inscrito neste curso',
      })

      render(
        <ConfirmInscriptionClient
          userInfo={completeUserInfo}
          userAuthInfo={userAuthInfo}
          nearbyUnits={nearbyUnitsSingle}
          courseInfo={basicCourseInfo}
          courseId={courseId}
          courseSlug={courseSlug}
        />
      )

      const confirmButton = screen.getByRole('button', {
        name: /Confirmar inscrição/i,
      })

      await user.click(confirmButton)

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Usuário já inscrito neste curso')
      })

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(`/servicos/cursos/${courseId}`)
      })
    })

    test('shows generic error toast on unknown error', async () => {
      const user = userEvent.setup()

      mockSubmitCourseInscription.mockRejectedValue(new Error('Network error'))

      render(
        <ConfirmInscriptionClient
          userInfo={completeUserInfo}
          userAuthInfo={userAuthInfo}
          nearbyUnits={nearbyUnitsSingle}
          courseInfo={basicCourseInfo}
          courseId={courseId}
          courseSlug={courseSlug}
        />
      )

      const confirmButton = screen.getByRole('button', {
        name: /Confirmar inscrição/i,
      })

      await user.click(confirmButton)

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Network error')
      })
    })
  })

  describe('navigation', () => {
    test('navigates back to course page when clicking back button on first slide', async () => {
      const user = userEvent.setup()

      render(
        <ConfirmInscriptionClient
          userInfo={completeUserInfo}
          userAuthInfo={userAuthInfo}
          nearbyUnits={nearbyUnitsSingle}
          courseInfo={basicCourseInfo}
          courseId={courseId}
          courseSlug={courseSlug}
        />
      )

      const backButton = screen.getByTestId('back-button')

      await user.click(backButton)

      expect(mockPush).toHaveBeenCalledWith(`/servicos/cursos/${courseSlug}`)
    })
  })

  describe('online course', () => {
    test('renders correctly for online course without units', () => {
      render(
        <ConfirmInscriptionClient
          userInfo={completeUserInfo}
          userAuthInfo={userAuthInfo}
          nearbyUnits={emptyUnits}
          onlineClasses={onlineClassesSingle}
          courseInfo={basicCourseInfo}
          courseId={courseId}
          courseSlug={courseSlug}
        />
      )

      expect(
        screen.getByText(/confirme suas informações/i)
      ).toBeInTheDocument()
    })
  })
})
