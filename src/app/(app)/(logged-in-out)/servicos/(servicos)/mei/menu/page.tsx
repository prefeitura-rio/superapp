'use client'

import { SecondaryHeader } from '@/app/components/secondary-header'
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
    <main className="max-w-4xl min-h-lvh mx-auto text-foreground pb-10">
      <SecondaryHeader fixed={false} title="Menu" route="/servicos/mei" />
      <div className="px-4 pt-3.4">
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
