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
import type { ModelsSelfDeclaredPhoneInput } from '@/http/models/modelsSelfDeclaredPhoneInput'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

export default function PhoneNumberForm() {
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSave() {
    setError(null)
    startTransition(async () => {
      // Parse DDI, DDD, valor from phone input
      const digits = phone.replace(/\D/g, '')
      const ddi = countryCode.replace(/\D/g, '')
      const ddd = digits.substring(0, 2)
      const valor = digits.substring(2)
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
      } else {
        setError(result.error || 'Erro ao atualizar número')
      }
    })
  }

  function handleDrawerClose() {
    setDrawerOpen(false)
    router.back()
  }

  return (
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
        {error && <span className="text-red-500 text-sm">{error}</span>}
        <Button
          size="lg"
          className="w-full hover:cursor-pointer bg-primary hover:bg-primary/90 rounded-lg font-normal"
          onClick={handleSave}
          disabled={
            isPending ||
            phone.replace(/\D/g, '').length < 11 ||
            countryCode.length < 3
          }
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
  )
}
