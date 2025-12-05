'use client'
import { updateUserPhone } from '@/actions/update-user-phone'
import PhoneInputForm from '@/app/components/phone-input-form'
import { SecondaryHeader } from '@/app/components/secondary-header'
import welcomeImage from '@/assets/welcome.svg'
import { Button } from '@/components/ui/button'
import { CustomButton } from '@/components/ui/custom/custom-button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import type { ModelsSelfDeclaredPhoneInput } from '@/http/models/modelsSelfDeclaredPhoneInput'
import { isValidPhone, parsePhoneNumberForApi } from '@/lib/phone-utils'
import type { CountryCode } from 'libphonenumber-js/max'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import toast from 'react-hot-toast'

export default function PhoneNumberForm() {
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState<CountryCode>('BR')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const searchParams = useSearchParams()

  const isPhoneValid = isValidPhone(phone, country)
  const courseSlug = searchParams.get('redirectFromCourses')
  const returnUrl = searchParams.get('returnUrl')
  const redirectFromCourses = !!courseSlug
  let redirectFromCoursesUrl = ''

  async function handleSave() {
    startTransition(async () => {
      const parsedPhone = parsePhoneNumberForApi(phone, country)
      if (!parsedPhone) {
        toast.error('Número de telefone inválido.')
        return
      }

      try {
        const result = await updateUserPhone(
          parsedPhone as ModelsSelfDeclaredPhoneInput
        )

        if (redirectFromCourses) {
          redirectFromCoursesUrl = `&redirectFromCourses=${courseSlug}`
        }

        if (result.success) {
          const tokenUrl = `/meu-perfil/informacoes-pessoais/atualizar-telefone/token-input?valor=${parsedPhone.valor}&ddd=${parsedPhone.ddd}&ddi=${encodeURIComponent(
            parsedPhone.ddi
          )}${redirectFromCoursesUrl}${returnUrl ? `&returnUrl=${encodeURIComponent(returnUrl)}` : ''}`
          router.push(tokenUrl)
          toast.success('Token enviado')
        } else {
          // Handle specific error statuses
          if (result.status === 409) {
            toast.error('Número já cadastrado')
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

  const routeBackUrl = returnUrl
    ? returnUrl
    : redirectFromCourses
      ? `/servicos/cursos/atualizar-dados?redirectFromCourses=${courseSlug}`
      : '/meu-perfil'

  function handleDrawerClose() {
    setDrawerOpen(false)
    router.push(routeBackUrl)
  }

  return (
    <div className="max-w-xl min-h-lvh mx-auto pt-24 flex flex-col space-y-6">
      <div>
        <SecondaryHeader title="" route={routeBackUrl} />
        <section className="relative">
          <h2 className="text-5xl px-4 font-normal leading-11 mb-2 pt-1 text-foreground bg-background z-10 pb-3">
            Escreva seu <br /> celular
          </h2>
        </section>
      </div>
      <div className="flex flex-col gap-14 px-4 items-center">
        <PhoneInputForm
          value={phone}
          onChange={setPhone}
          country={country}
          onCountryChange={setCountry}
          onSubmit={handleSave}
        />
        <CustomButton
          size="xl"
          onClick={handleSave}
          className="rounded-full"
          variant="primary"
          fullWidth
          disabled={isPending || !isPhoneValid}
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
            <Image
              src={welcomeImage}
              alt="Email atualizado"
              width={260}
              height={320}
              className="mx-auto mb-10"
              style={{ objectFit: 'contain', maxHeight: '320px' }}
              priority
            />
            <Button
              size="lg"
              className="w-full max-w-xs mt-8 bg-primary hover:bg-primary/90 rounded-full font-normal"
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
