'use client'

import { SecondaryHeader } from '@/app/components/secondary-header'
import { MenuItem } from '@/components/ui/custom/menu-item'

export function EmpregosMenuContent() {
  return (
    <main className="max-w-4xl min-h-lvh mx-auto text-foreground pb-10">
      <SecondaryHeader fixed={false} title="Menu" route="/servicos/empregos" />
      <div className="px-4 pt-3.4">
        <MenuItem
          label="Minhas candidaturas"
          href="/servicos/empregos/minhas-candidaturas"
          isFirst
        />
        <MenuItem label="Meu currículo" href="/servicos/empregos/curriculo" />
        <MenuItem label="FAQ" href="/servicos/empregos/faq" isLast />
      </div>
    </main>
  )
}
