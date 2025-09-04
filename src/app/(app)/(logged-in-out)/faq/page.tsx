import { SecondaryHeader } from '@/app/components/secondary-header'

export default function FaqPagePrefRio() {
  const sections = [
    {
      title: 'O que é a Plataforma PrefRio?',
      content:
        'É uma plataforma digital que vai concentrar em um só lugar os serviços e informações dos atuais portais Prefeitura.rio, Carioca Digital e 1746. O objetivo é simplificar o acesso e tornar o atendimento mais rápido, inteligente e personalizado.',
    },
  ]
  return (
    <main className="max-w-4xl min-h-lvh mx-auto pt-15 text-foreground pb-10">
      <SecondaryHeader title="FAQ" />
      <div className="p-5 pt-10 max-w-4xl mx-auto">
        <div className="space-y-8">
          {sections.map((section, index) => (
            <div key={index}>
              <div className="space-y-2">
                <h2 className="text-lg font-medium tracking-normal leading-5">
                  {section.title}
                </h2>
                <p className="text-foreground-light text-sm leading-relaxed whitespace-pre-line opacity-50">
                  {section.content}
                </p>
              </div>
              {index < sections.length - 1 && (
                <div className="mt-8 border-t border-border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
