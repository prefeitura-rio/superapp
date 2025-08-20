'use client'
import { updateUserEmail } from '@/actions/update-user-email'
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
import type { ModelsSelfDeclaredEmailInput } from '@/http/models/modelsSelfDeclaredEmailInput'
import confetti from 'canvas-confetti'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import toast from 'react-hot-toast'

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@([a-zA-Z][a-zA-Z-]*\.)+[a-zA-Z]{2,}$/

const MIN_EMAIL_LENGTH = 5

const validateEmail = (val: string) =>
  val.length >= MIN_EMAIL_LENGTH && EMAIL_REGEX.test(val)

export default function EmailForm() {
  const [email, setEmail] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const emailStateInput = useInputValidation({
    value: email,
    validate: val => EMAIL_REGEX.test(val),
    debounceMs: 0,
    minLength: MIN_EMAIL_LENGTH,
  })

  const isEmailValid = validateEmail(email)

  async function handleSave() {
    // Close keyboard when submitting
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }

    if (!isEmailValid) {
      toast.error('Email inválido. Tente novamente.')
      setEmail('')
      return
    }
    startTransition(async () => {
      const result = await updateUserEmail({
        valor: email,
      } as ModelsSelfDeclaredEmailInput)

      if (result.success) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.7 },
        })
        setDrawerOpen(true)
      } else if (result.status === 409) {
        toast.error('Email Já Cadastrado')
      } else {
        toast.error('Erro ao atualizar email.')
      }
    })
  }

  function handleDrawerClose() {
    setDrawerOpen(false)
    router.back()
  }

  const clearEmail = () => {
    setEmail('')
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isEmailValid) {
      handleSave()
    }
  }

  return (
    <div className="max-w-xl min-h-lvh mx-auto pt-24 flex flex-col space-y-6">
      <div>
        <SecondaryHeader title="" route="/user-profile" />
        <section className="relative">
          <h2 className="text-5xl px-4 font-normal leading-11 mb-2 pt-1 text-foreground bg-background z-10 pb-3">
            Escreva seu <br /> email
          </h2>
        </section>
      </div>
      <div className="flex flex-col gap-14 px-4 items-center">
        <form className="w-full" onSubmit={handleFormSubmit}>
          <InputField
            value={email}
            onChange={e => setEmail(e.target.value)}
            type="email"
            placeholder="Digite seu email"
            onClear={clearEmail}
            state={emailStateInput}
            showClearButton
          />
        </form>
        <CustomButton
          size="xl"
          fullWidth
          onClick={handleSave}
          disabled={isPending || emailStateInput !== 'success'}
        >
          {isPending ? 'Salvando...' : 'Salvar'}
        </CustomButton>
      </div>

      {/* Drawer for feedback after email update */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-w-none mx-auto rounded-t-none! min-h-screen flex flex-col items-center justify-center">
          <div className="flex flex-col min-h-[60vh] items-center justify-evenly bg-background px-4 py-8">
            <DrawerHeader className="text-center">
              <DrawerTitle className="text-4xl font-medium leading-10 mb-6">
                Email <br />
                atualizado!
              </DrawerTitle>
            </DrawerHeader>
            <ThemeAwareVideo
              source={VIDEO_SOURCES.updatedEmail}
              containerClassName="mb-10 flex items-center justify-center  h-[min(328px,40vh)] max-h-[328px]"
            />
            <CustomButton size="xl" fullWidth onClick={handleDrawerClose}>
              Finalizar
            </CustomButton>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
