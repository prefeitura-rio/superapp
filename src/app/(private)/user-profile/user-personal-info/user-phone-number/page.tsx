'use client'
import { updateUserPhone } from '@/actions/update-user-phone'
import PhoneInputForm from '@/app/(private)/components/phone-input-form'
import { SecondaryHeader } from '@/app/(private)/components/secondary-header'
import welcomeImage from '@/assets/welcome.svg'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { PageFadeInWrapper } from '@/components/ui/page-fade-in'
import type { ModelsSelfDeclaredPhoneInput } from '@/http/models/modelsSelfDeclaredPhoneInput'
import { isValidPhoneLength } from '@/lib/format-phone-worldwide'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import toast from 'react-hot-toast'

export default function PhoneNumberForm() {
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState('+55')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const isPhoneValid = isValidPhoneLength(phone, countryCode)

  async function handleSave() {
    startTransition(async () => {
      // Parse DDI, DDD, valor from phone input based on country
      const digits = phone.replace(/\D/g, '')
      const ddi = countryCode.replace(/\D/g, '')

      // For Brazil, extract DDD (area code) and valor (number)
      // For other countries, treat the entire number as valor
      let ddd = ''
      let valor = digits

      if (countryCode === '+55' && digits.length === 11) {
        // Brazil: first 2 digits are DDD (area code)
        ddd = digits.substring(0, 2)
        valor = digits.substring(2)
      }

      const result = await updateUserPhone({
        valor: valor,
        ddd,
        ddi,
      } as ModelsSelfDeclaredPhoneInput)

      if (result.success) {
        // Pass phone info in URL for next step
        router.push(
          `/user-profile/user-personal-info/user-phone-number/token-input?valor=${valor}&ddd=${ddd}&ddi=${encodeURIComponent(
            ddi
          )}`
        )
        toast.success('Token enviado')
      } else {
        const errorMessage =
          result.error === 'No change: phone matches current data'
            ? 'Esse já é o seu número'
            : 'Erro'
        toast.error(errorMessage)
      }
    })
  }

  function handleDrawerClose() {
    setDrawerOpen(false)
    router.back()
  }

  return (
    <PageFadeInWrapper>
      <div className="max-w-md min-h-lvh mx-auto pt-24 flex flex-col space-y-6">
        <div>
          <SecondaryHeader title="" />
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
            countryCode={countryCode}
            onCountryCodeChange={setCountryCode}
          />
          <Button
            size="lg"
            className="w-full hover:cursor-pointer bg-primary hover:bg-primary/90 rounded-lg font-normal"
            onClick={handleSave}
          disabled={isPending || !isPhoneValid || !countryCode.startsWith('+')}
          >
            {isPending ? 'Enviando...' : 'Enviar'}
          </Button>
        </div>

        {/* Drawer for feedback after email update */}
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="max-w-md mx-auto rounded-t-none! min-h-screen flex flex-col items-center justify-center">
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
                className="w-full max-w-xs mt-8 bg-primary hover:bg-primary/90 rounded-lg font-normal"
                onClick={handleDrawerClose}
              >
                Finalizar
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </PageFadeInWrapper>
  )
}
