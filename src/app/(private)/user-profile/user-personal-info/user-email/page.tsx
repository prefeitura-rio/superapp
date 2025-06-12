'use client'
import { updateUserEmail } from '@/actions/update-user-email'
import { SecondaryHeader } from '@/app/(private)/components/secondary-header'
import welcomeImage from '@/assets/welcome.svg'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import type { ModelsSelfDeclaredEmailInput } from '@/http/models/modelsSelfDeclaredEmailInput'
import confetti from 'canvas-confetti'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

export default function EmailForm() {
  const [email, setEmail] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSave() {
    setError(null)
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
      } else {
        setError(result.error || 'Erro ao atualizar email')
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
            Escreva seu <br /> email
          </h2>
        </section>
      </div>
      <div className="flex flex-col gap-14 px-4 items-center">
        <Input
          className="text-card-foreground text-sm bg-card border-border rounded-xl"
          value={email}
          onChange={e => setEmail(e.target.value)}
          type="email"
          placeholder="Digite seu email"
          disabled={isPending}
        />
        {error && <span className="text-red-500 text-sm">{error}</span>}
        <Button
          size="lg"
          className="w-full hover:cursor-pointer bg-primary hover:bg-primary/90 rounded-lg font-normal"
          onClick={handleSave}
          disabled={isPending || !email}
        >
          {isPending ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      {/* Drawer for feedback after email update */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-w-md mx-auto rounded-t-none! min-h-screen flex flex-col items-center justify-center">
          <div className="flex flex-col min-h-[60vh] items-center justify-evenly bg-background px-4 py-8">
            <DrawerHeader className="text-center">
              <DrawerTitle className="text-4xl font-medium leading-10 mb-6">
                Email <br />
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
