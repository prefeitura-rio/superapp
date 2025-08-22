'use client'
import { validateUserPhoneToken } from '@/actions/validate-user-phone-token'
import PhoneInputTokenForm from '@/app/components/phone-input-token-form'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { Button } from '@/components/ui/button'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { ThemeAwareVideo } from '@/components/ui/custom/theme-aware-video'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { VIDEO_SOURCES } from '@/constants/videos-sources'
import type { ModelsPhoneVerificationValidateRequest } from '@/http/models/modelsPhoneVerificationValidateRequest'
import confetti from 'canvas-confetti'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import toast from 'react-hot-toast'

export default function TokenInputForm() {
  const [token, setToken] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const valor = searchParams.get('valor') || ''
  const ddd = searchParams.get('ddd') || ''
  const ddi = searchParams.get('ddi') || ''

  const hasAutoSubmitted = useRef(false)

 async function handleSave() {
    // Close keyboard when submitting
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }

    startTransition(async () => {
      try {
        const result = await validateUserPhoneToken({
          code: token,
          ddd,
          ddi,
          valor,
        } as ModelsPhoneVerificationValidateRequest)
        
        if (result.success) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.7 },
          })
          setDrawerOpen(true)
        } else {
          // Handle specific error statuses
          if (result.error === "Invalid or expired verification code") {
            toast.error('Token inválido ou expirado.')
            setError('Token inválido ou expirado.')
          } else {
            // For other API errors, show toast
             router.push('/sessao-expirada')
          }
        }
      } catch (error: any) {
        // For unexpected errors (network, etc.), redirect to session expired
        toast.error('Oops! Houve um erro.')
      }
      setToken('')
    })
  }

  function handleDrawerClose() {
    setDrawerOpen(false)
    router.push('/meu-perfil/informacoes-pessoais')
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <unnecessary dependency>
  useEffect(() => {
    if (
      token &&
      token.length === 6 &&
      !isPending &&
      !hasAutoSubmitted.current
    ) {
      hasAutoSubmitted.current = true
      handleSave()
    }

    if (token.length < 6) {
      hasAutoSubmitted.current = false
    }
  }, [token, isPending])

  return (
    <div className="max-w-xl min-h-lvh mx-auto pt-24 flex flex-col space-y-6">
      <div>
        <SecondaryHeader title="" />
        <section className="relative">
          <h2 className="text-5xl px-4 font-normal leading-11 mb-2 pt-1 text-foreground bg-background z-10 pb-3">
            Escreva os <br /> 6 dígitos
          </h2>
        </section>
      </div>
      <div className="flex flex-col gap-14 px-4 items-center">
        <PhoneInputTokenForm
          value={token}
          onChange={setToken}
          resendParams={{ valor, ddd, ddi }}
          error={error}
        />
        <CustomButton
          size="xl"
          fullWidth
          variant="primary"
          onClick={handleSave}
          disabled={isPending || !token || token.length < 6}
        >
          {isPending ? 'Enviando...' : 'Enviar'}
        </CustomButton>
      </div>

      {/* Drawer for feedback after email update */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="mx-auto rounded-t-none! min-h-screen flex flex-col items-center justify-center">
          <div className="flex flex-col min-h-[60vh] items-center justify-evenly bg-background px-4 py-8">
            <DrawerHeader className="text-center">
              <DrawerTitle className="text-4xl font-medium leading-10 mb-6">
                Número <br />
                atualizado!
              </DrawerTitle>
            </DrawerHeader>

            <ThemeAwareVideo
              source={VIDEO_SOURCES.updatedNumber}
              containerClassName="mb-10 flex items-center justify-center  h-[min(328px,40vh)] max-h-[328px]"
            />
            <Button
              size="lg"
              className="w-full max-w-xs mt-8 bg-primary hover:bg-primary/90 rounded-lg font-normal"
              onClick={handleDrawerClose}
            >
              Finalizar
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
