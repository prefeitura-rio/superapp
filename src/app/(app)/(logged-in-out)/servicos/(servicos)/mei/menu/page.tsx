'use client'

import { ChevronLeftIcon } from '@/assets/icons'
import { IconButton } from '@/components/ui/custom/icon-button'
import { MenuItem } from '@/components/ui/custom/menu-item'
import { useRouter } from 'next/navigation'

export default function MeiMenuPage() {
  const router = useRouter()

  const handleBack = () => {
    router.push('/servicos/mei')
  }

  return (
    <main className="max-w-xl min-h-lvh mx-auto pt-15 text-foreground pb-10">
      <header className="px-4 py-4 fixed w-full max-w-xl mx-auto z-50 bg-background text-foreground">
        <div className="flex justify-start">
          <IconButton icon={ChevronLeftIcon} onClick={handleBack} />
        </div>
      </header>
      <div className="px-4 pt-6">
        <MenuItem
          label="Minhas propostas"
          href="/servicos/mei/minhas-propostas"
          isFirst
        />
        <MenuItem label="Meu MEI" href="/servicos/mei/meu-mei" />
        <MenuItem label="FAQ" href="/servicos/mei/faq" isLast />
      </div>
    </main>
  )
}
