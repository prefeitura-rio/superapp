'use client'
import { updateUserDisplayName } from '@/actions/update-user-display-name'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { InputField } from '@/components/ui/custom/input-field'
import { ThemeAwareVideo } from '@/components/ui/custom/theme-aware-video'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { VIDEO_SOURCES } from '@/constants/videos-sources'
import { useInputValidation } from '@/hooks/useInputValidation'
import type { ModelsSelfDeclaredNomeExibicaoInput } from '@/http/models/modelsSelfDeclaredNomeExibicaoInput'
import confetti from 'canvas-confetti'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import toast from 'react-hot-toast'
import { DisplayNameFeedback } from './display-name-feedback'

const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s]+$/

const MIN_NAME_LENGTH = 2
const MAX_NAME_LENGTH = 18

const validateDisplayName = (val: string) =>
  val.length >= MIN_NAME_LENGTH &&
  val.length <= MAX_NAME_LENGTH &&
  NAME_REGEX.test(val.trim())

export default function DisplayNameForm() {
  const [displayName, setDisplayName] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const searchParams = useSearchParams()

  const courseSlug = searchParams.get('redirectFromCourses')

  const displayNameStateInput = useInputValidation({
    value: displayName,
    validate: val => validateDisplayName(val),
    debounceMs: 0,
    minLength: MIN_NAME_LENGTH,
  })

  const isDisplayNameValid = validateDisplayName(displayName)
  const isDisplayNameTooLong = displayName.length > MAX_NAME_LENGTH

  async function handleSave() {
    // Close keyboard when submitting
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }

    if (!isDisplayNameValid) {
      toast.error('Nome inválido. Tente novamente.')
      setDisplayName('')
      return
    }

    startTransition(async () => {
      try {
        const result = await updateUserDisplayName({
          valor: displayName.trim(),
        } as ModelsSelfDeclaredNomeExibicaoInput)

        if (result.success) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.7 },
          })
          setDrawerOpen(true)
        } else {
          // Handle specific error statuses
          if (result.status === 400) {
            toast.error('Nome inválido. Tente novamente.')
          } else {
            // For other API errors, redirect to session expired
            toast.error('Oops! Houve um erro')
          }
        }
      } catch (error: any) {
        // For unexpected errors (network, etc.), redirect to session expired
        router.push('/sessao-expirada')
      }
    })
  }

  function handleDrawerClose() {
    setDrawerOpen(false)
    router.back()
  }

  const clearDisplayName = () => {
    setDisplayName('')
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isDisplayNameValid) {
      handleSave()
    }
  }

  const routeBackUrl = courseSlug
    ? `/servicos/cursos/atualizar-dados?redirectFromCourses=${courseSlug}`
    : '/meu-perfil'

  return (
    <div className="max-w-xl min-h-lvh mx-auto pt-24 flex flex-col space-y-6">
      <div>
        <SecondaryHeader title="" route={routeBackUrl} />
        <section className="relative">
          <h2 className="text-5xl px-4 font-normal leading-11 mb-2 pt-1 text-foreground bg-background z-10 pb-3">
            Como prefere ser
            <br /> chamado(a)?
          </h2>
        </section>
      </div>
      <div className="flex flex-col gap-14 px-4 items-center">
        <form className="w-full" onSubmit={handleFormSubmit}>
          <InputField
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            type="text"
            placeholder="Digite como quer ser chamado"
            onClear={clearDisplayName}
            state={displayNameStateInput}
            showClearButton
          />
        </form>
        <DisplayNameFeedback
          displayName={displayName}
          displayNameStateInput={displayNameStateInput}
        />
        <CustomButton
          size="xl"
          fullWidth
          onClick={handleSave}
          className="-mt-5"
          disabled={
            isPending ||
            displayNameStateInput !== 'success' ||
            isDisplayNameTooLong
          }
        >
          {isPending ? 'Salvando...' : 'Salvar'}
        </CustomButton>
      </div>

      {/* Drawer for feedback after display name update */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-w-none mx-auto rounded-t-none! min-h-screen flex flex-col items-center justify-center">
          <div className="flex flex-col min-h-[60vh] items-center justify-evenly bg-background px-4 py-8">
            <DrawerHeader className="text-center">
              <DrawerTitle className="text-4xl font-medium leading-10 mb-6">
                Nome de exibição
                <br />
                atualizado!
              </DrawerTitle>
            </DrawerHeader>
            <ThemeAwareVideo
              source={VIDEO_SOURCES.updateName}
              containerClassName="mb-10 flex items-center justify-center  h-[min(328px,40vh)] max-h-[328px]"
            />
            <CustomButton
              size="xl"
              fullWidth
              onClick={handleDrawerClose}
              className="rounded-full"
            >
              Finalizar
            </CustomButton>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
