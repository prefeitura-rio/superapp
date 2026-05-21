import { SecondaryHeader } from '@/app/components/secondary-header'
import { MenuItem } from '@/components/ui/custom/menu-item'
import {
  oportunidadesCariocasLogo,
  oportunidadesCariocasLogoDark,
} from '@/constants/bucket'
import { getUserInfoFromToken } from '@/lib/user-info'
import Image from 'next/image'
import Link from 'next/link'

export default async function ProfilePage() {
  const userInfo = await getUserInfoFromToken()

  return (
    <div className="pb-25 pt-20 max-w-4xl mx-auto text-white flex flex-col">
      <SecondaryHeader
        route="/servicos/cursos"
        logo={
          <Link href="/servicos/cursos">
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

      <div className="flex-1 px-4">
        <h1 className="text-3xl font-medium text-foreground pb-2 pt-3">Menu</h1>
        <nav className="space-y-1">
          {/* {userInfo.cpf && ( */}
          <MenuItem
            disabled={!userInfo.cpf}
            label="Meus cursos"
            href="/servicos/cursos/meus-cursos"
            isFirst={true}
          />
          {/* )} */}
          {/* <MenuItem
            label="Favoritos"
            href="/servicos/cursos/meus-cursos?favorites=true"
          /> */}
          {/* {userInfo.cpf && ( */}
          <MenuItem
            disabled={!userInfo.cpf}
            label="Certificados"
            href="/servicos/cursos/certificados"
          />
          {/* )} */}
          <MenuItem label="FAQ" href="/servicos/cursos/faq" />
        </nav>
      </div>
    </div>
  )
}
