import { SecondaryHeader } from '@/app/components/secondary-header'
import { MenuItem } from '@/components/ui/custom/menu-item'
import { Mail, Smartphone } from 'lucide-react'

export default function AtualizarDadosPage() {
  return (
    <div className="pt-20 min-h-lvh max-w-4xl mx-auto text-foreground flex flex-col">
      <SecondaryHeader title="" route="/servicos/cursos/" />

      <div className="px-4">
        <h1 className="text-3xl font-medium text-foreground pt-2 pb-6 leading-9 tracking-tight">
          O que você gostaria de atualizar?
        </h1>

        <div className="space-y-0">
          <MenuItem
            icon={<Smartphone className="h-5 w-5" />}
            title="Celular"
            label="+55 (11) 99999-8888"
            href="/meu-perfil/informacoes-pessoais/atualizar-telefone?redirectFromCourses=true"
          />

          <MenuItem
            icon={<Mail className="h-5 w-5" />}
            title="E-mail"
            label="marina.duarte@gmail.com"
            href="/meu-perfil/informacoes-pessoais/atualizar-email?redirectFromCourses=true"
          />
        </div>

        <p className="font-sm text-muted-foreground font-normal leading-5 tracking-normal pt-8">
          As demais informações são obtidas a partir dos dados fornecidos pela
          plataforma Gov.br
        </p>
      </div>
    </div>
  )
}
