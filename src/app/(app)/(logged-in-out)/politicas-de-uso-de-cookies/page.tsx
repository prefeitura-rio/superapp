import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  Cookie,
  ExternalLink,
  Eye,
  Settings,
  Shield,
} from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-static'

export default function CookiesPolicy() {
  return (
    <div className="min-h-screen bg-background py-8 pb-20">
      <div className="max-w-xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            Política de Cookies
          </h1>
          <p className="text-muted-foreground text-lg">
            Saiba como utilizamos cookies para melhorar sua experiência
          </p>
        </div>

        {/* What are cookies */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Cookie className="h-5 w-5" />O que são Cookies?
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Cookies são pequenos arquivos de texto que são armazenados no seu
            dispositivo quando você visita nosso site. Eles nos ajudam a
            fornecer uma experiência personalizada e melhorar a funcionalidade
            do portal.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2 text-sm">
              <Eye className="h-4 w-4" />
              <span>Analytics e métricas</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Settings className="h-4 w-4" />
              <span>Preferências do usuário</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4" />
              <span>Melhorias no site</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4" />
              <span>Segurança e autenticação</span>
            </div>
          </div>
        </section>

        {/* Types of cookies */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            Tipos de Cookies que Utilizamos
          </h2>
          <p className="text-muted-foreground text-sm">
            Categorias de cookies e suas finalidades específicas
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-10">
              <div className="w-20 flex-shrink-0">
                <Badge variant="default" className="mt-1 text-background">
                  Necessários
                </Badge>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">Cookies Essenciais</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Essenciais para o funcionamento básico do site. Incluem
                  autenticação, segurança e funcionalidades essenciais.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-10">
              <div className="w-20 flex-shrink-0">
                <Badge variant="secondary" className="mt-1 text-foreground">
                  Analytics
                </Badge>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">Cookies de Análise</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Nos ajudam a entender como os usuários interagem com o site,
                  permitindo melhorias contínuas na experiência.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-10">
              <div className="w-20 flex-shrink-0">
                <Badge variant="outline" className="mt-1">
                  Funcionais
                </Badge>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">Cookies Funcionais</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Lembram suas preferências e configurações para uma experiência
                  mais personalizada.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cookie details table */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Detalhamento dos Cookies</h2>
          <p className="text-muted-foreground text-sm">
            Lista completa dos cookies utilizados em nosso portal
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Nome do Cookie</th>
                  <th className="text-left py-2 font-medium">Finalidade</th>
                  <th className="text-left py-2 font-medium">Duração</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                <tr className="border-b">
                  <td className="py-2 font-mono">_ga</td>
                  <td className="py-2">Usado para distinguir usuários.</td>
                  <td className="py-2">2 anos</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-mono">ga_[container-id]</td>
                  <td className="py-2">
                    Usado para persistir o estado da sessão.
                  </td>
                  <td className="py-2">2 anos</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-mono">
                    _hjSessionUser_[session-id]
                  </td>
                  <td className="py-2">
                    Usado para identificar uma sessão de usuário.
                  </td>
                  <td className="py-2">1 ano</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* How to manage cookies */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Como Gerenciar Cookies</h2>
          <div className="space-y-4">
            <h4 className="font-medium text-sm mb-2">
              Configurações do Navegador
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              A maioria dos navegadores permite controlar cookies através das
              configurações de privacidade.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="hover:text-foreground"
              >
                <Link
                  href="https://support.google.com/chrome/answer/95647?co=GENIE.Platform%3DDesktop&oco=1&hl=pt-BR"
                  target="_blank"
                >
                  Chrome <ExternalLink className="h-3 w-3 ml-1" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="hover:text-foreground"
              >
                <Link
                  href="https://support.mozilla.org/pt-BR/kb/cookies-informacoes-sites-armazenam-no-computador"
                  target="_blank"
                >
                  Firefox <ExternalLink className="h-3 w-3 ml-1" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="hover:text-foreground"
              >
                <Link
                  href="https://support.microsoft.com/pt-br/help/4027947/microsoft-edge-deletecookies"
                  target="_blank"
                >
                  Edge <ExternalLink className="h-3 w-3 ml-1" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="hover:text-foreground"
              >
                <Link
                  href="https://support.microsoft.com/pt-br/help/17442/windows-internetexplorer-delete-manage-cookies"
                  target="_blank"
                >
                  Internet Explorer <ExternalLink className="h-3 w-3 ml-1" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="hover:text-foreground"
              >
                <Link
                  href="https://help.opera.com/en/latest/web-preferences/#cookies"
                  target="_blank"
                >
                  Opera <ExternalLink className="h-3 w-3 ml-1" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="hover:text-foreground"
              >
                <Link
                  href="https://support.apple.com/pt-br/guide/safari/sfri11471/mac"
                  target="_blank"
                >
                  Safari <ExternalLink className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Legal information */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            Lei Geral de Proteção de Dados
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            A Lei nº 13.709, de 14 de agosto de 2018 - Lei Geral de Proteção de
            Dados Pessoais (LGPD) - define o tratamento de dados pessoais, com o
            objetivo de proteger os direitos fundamentais de liberdade e de
            privacidade e o livre desenvolvimento da personalidade da pessoa
            natural. É importante notar que a mesma legislação fundamenta a
            disciplina da proteção de dados pessoais no respeito à privacidade;
            na autodeterminação informativa; na liberdade de expressão, de
            informação, de comunicação e de opinião; na inviolabilidade da
            intimidade, da honra e da imagem; no desenvolvimento econômico e
            tecnológico e a inovação; na livre iniciativa, a livre concorrência
            e a defesa do consumidor; e nos direitos humanos, o livre
            desenvolvimento da personalidade, a dignidade e o exercício da
            cidadania pelas pessoas naturais.
          </p>
        </section>
      </div>
    </div>
  )
}
