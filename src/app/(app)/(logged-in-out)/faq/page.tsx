import { GlobalMenuTrigger } from '@/app/components/global-menu/global-menu-trigger'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { MenuItem } from '@/components/ui/custom/menu-item'
import { isFeatureEnabled } from '@/lib/feature-flags'

interface FaqTopic {
  id: string
  label: string
  href: string
  enabled: boolean
}

/**
 * Hub das Perguntas Frequentes: reúne num só lugar os FAQs que antes viviam
 * espalhados (perfil do Pref.Rio, menu hambúrguer de Cursos e de Empregos).
 * Cada assunto continua na sua própria tela, no formato que já existia.
 */
const TOPICS: FaqTopic[] = [
  {
    id: 'pref-rio',
    label: 'PrefRio',
    href: '/faq/pref-rio',
    enabled: true,
  },
  {
    id: 'cursos',
    label: 'Cursos',
    href: '/servicos/cursos/faq',
    enabled: isFeatureEnabled('cursos'),
  },
  {
    id: 'trabalho',
    label: 'Trabalho',
    href: '/servicos/trabalho/faq',
    enabled: isFeatureEnabled('empregos'),
  },
]

export default function FaqHubPage() {
  const topics = TOPICS.filter(topic => topic.enabled)

  return (
    <main className="max-w-4xl min-h-lvh mx-auto text-foreground pb-10">
      <SecondaryHeader fixed={false} rightSlot={<GlobalMenuTrigger />} />

      <div className="px-4 pt-2">
        <h1 className="text-3xl font-medium text-foreground">
          Perguntas Frequentes
        </h1>
        <p className="text-sm text-foreground-light leading-5 mt-2">
          Escolha um dos assuntos abaixo para encontrar respostas de forma
          rápida
        </p>

        <nav className="mt-6">
          {topics.map((topic, index) => (
            <MenuItem
              key={topic.id}
              label={topic.label}
              href={topic.href}
              isFirst={index === 0}
              isLast={index === topics.length - 1}
            />
          ))}
        </nav>
      </div>
    </main>
  )
}
