import { SecondaryHeader } from '@/app/components/secondary-header'
import { MenuItem } from '@/components/ui/custom/menu-item'
import { getUserInfoFromToken } from '@/lib/user-info'

export default async function ProfilePage() {
  const userInfo = await getUserInfoFromToken()

  return (
    <div className="pb-25 pt-20 max-w-4xl mx-auto text-white flex flex-col">
      {/* Header */}
      <SecondaryHeader title="" route="/servicos/cursos" />

      {/* Menu Items */}
      <div className="flex-1 px-4">
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
