import { SecondaryHeader } from '@/app/components/secondary-header'

export default function FaqPageCourses() {
  const sections = [
    {
      title: 'O que é a Plataforma Ciclo Carioca?',
      content:
        'O Ciclo Carioca é uma plataforma digital que reúne em um só lugar todas as informações e inscrições de cursos oferecidos pela Prefeitura do Rio e instituições parceiras. ',
    },
    {
      title: 'Quem pode se inscrever?',
      content:
        'Qualquer pessoa que queira aprender algo novo, consolidar ou aperfeiçoar conhecimentos e habilidades pode se inscrever. Basta atender aos requisitos de cada curso, se houver.',
    },
    {
      title: 'Ao solicitar a inscrição, já estou apto(a) para as aulas?',
      content:
        'Não. Ao solicitar sua inscrição, você deverá aguardar a confirmação por e-mail ou telefone da unidade responsável pelo curso. \n\n Por isso, é muito importante manter seus dados de contato sempre atualizados.',
    },
    {
      title: 'Posso solicitar inscrição em mais de um curso?',
      content:
        'Sim, você pode se inscrever em mais de um curso ao mesmo tempo.',
    },
    {
      title: 'Todos os cursos são gratuitos?',
      content:
        'Não. A maioria dos cursos é gratuita, mas alguns podem ter um custo. Se houver, essa informação estará sempre destacada na descrição do próprio curso.',
    },
    {
      title: 'Como faço para cancelar minha inscrição?',
      content:
        'Para cancelar sua inscrição, basta ir até a página do curso desejado no Ciclo Carioca e clicar em “Cancelar inscrição”. ',
    },
    {
      title: 'Receberei certificado de conclusão do curso?',
      content:
        'Sim. Ao finalizar o curso, você terá direito a um certificado digital de participação ou conclusão, emitido pela instituição responsável. \n\n Ele será disponibilizado aqui mesmo, na plataforma Ciclo Carioca, na aba “Certificados”.',
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
