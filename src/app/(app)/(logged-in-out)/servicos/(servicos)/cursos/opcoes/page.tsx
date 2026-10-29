import { OportunidadesSubHeader } from '@/app/components/oportunidades/oportunidades-sub-header'
import { MenuItem } from '@/components/ui/custom/menu-item'
import { getUserInfoFromToken } from '@/lib/user-info'

export default async function ProfilePage() {
  const userInfo = await getUserInfoFromToken()

  return (
    <div>
      <OportunidadesSubHeader
        menuHref="/servicos/cursos/opcoes"
        logoHref="/servicos/cursos"
      />
      <div className="max-w-4xl mx-auto text-foreground pb-10">
        <div className="px-4 pt-3.5">
          <h1 className="text-3xl font-medium text-foreground pb-2 pt-3">
            Menu
          </h1>
          <nav className="space-y-1">
            <MenuItem
              disabled={!userInfo.cpf}
              label="Meus cursos"
              href="/servicos/cursos/meus-cursos"
              isFirst={true}
            />
            <MenuItem
              disabled={!userInfo.cpf}
              label="Certificados"
              href="/servicos/cursos/certificados"
            />
            <MenuItem label="FAQ" href="/faq/cursos" />
          </nav>
        </div>
      </div>
    </div>
  )
}
