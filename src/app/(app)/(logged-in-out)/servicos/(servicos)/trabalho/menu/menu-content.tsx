'use client'


import { MenuItem } from '@/components/ui/custom/menu-item'

export function EmpregosMenuContent() {
  return (
    <main className="max-w-4xl mx-auto text-foreground pb-10">

      <div className="px-4 pt-3.4">
        <h1 className="text-3xl font-medium text-foreground pb-2 pt-4">Menu</h1>
        <MenuItem
          label="Minhas candidaturas"
          href="/servicos/trabalho/minhas-candidaturas"
          isFirst
        />
        <MenuItem label="Meu currículo" href="/servicos/trabalho/curriculo" />
        <MenuItem label="FAQ" href="/faq/trabalho" isLast />
      </div>
    </main>
  )
}
