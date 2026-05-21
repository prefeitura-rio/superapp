'use client'

import { SecondaryHeader } from '@/app/components/secondary-header'
import { MenuItem } from '@/components/ui/custom/menu-item'
import {
  oportunidadesCariocasLogo,
  oportunidadesCariocasLogoDark,
} from '@/constants/bucket'
import Image from 'next/image'
import Link from 'next/link'

export function EmpregosMenuContent() {
  return (
    <main className="max-w-4xl min-h-lvh mx-auto text-foreground pb-10">
      <SecondaryHeader
        fixed={false}
        route="/servicos/trabalho"
        logo={
          <Link href="/servicos/trabalho">
            <Image
              src={oportunidadesCariocasLogoDark}
              alt="Oportunidades Cariocas"
              width={170}
              height={38}
              priority
              className="dark:block hidden"
            />
            <Image
              src={oportunidadesCariocasLogo}
              alt="Oportunidades Cariocas"
              width={170}
              height={38}
              priority
              className="dark:hidden block"
            />
          </Link>
        }
      />
      <div className="px-4 pt-3.4">
        <h1 className="text-3xl font-medium text-foreground pb-2 pt-4">Menu</h1>
        <MenuItem
          label="Minhas candidaturas"
          href="/servicos/trabalho/minhas-candidaturas"
          isFirst
        />
        <MenuItem label="Meu currículo" href="/servicos/trabalho/curriculo" />
        <MenuItem label="FAQ" href="/servicos/trabalho/faq" isLast />
      </div>
    </main>
  )
}
