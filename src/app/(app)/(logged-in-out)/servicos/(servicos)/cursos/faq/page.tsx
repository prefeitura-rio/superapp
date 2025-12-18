import { SecondaryHeader } from '@/app/components/secondary-header'
import { FormattedContent, type FaqSection } from '@/lib/faq-utils'

const FAQ_SECTIONS: FaqSection[] = [
  {
    id: 'plataforma',
    title: 'O que é a Plataforma Oportunidades Cariocas?',
    content:
      'O Oportunidades Cariocas é uma plataforma digital que reúne em um só lugar todas as informações e inscrições de cursos, oficinas, palestras e quaisquer atividades educativas oferecidas pela Prefeitura do Rio e instituições parceiras. ',
  },
  {
    id: 'quem-pode',
    title: 'Quem pode se inscrever?',
    content:
      'Qualquer pessoa que queira aprender algo novo, consolidar ou aperfeiçoar conhecimentos e habilidades pode se inscrever. Basta atender aos requisitos de cada atividade, se houver.',
  },
  {
    id: 'conta-govbr',
    title:
      'O que é a conta Gov.br e por que preciso dela para me inscrever nos cursos?',
    content:
      'A conta Gov.br é a sua identidade digital para acessar de forma segura e prática os serviços digitais do governo. Qualquer cidadão brasileiro ou estrangeiro com registro na base de dados do Cadastro de Pessoas Físicas (CPF) pode criar a sua conta. \n\n Para o Oportunidades Cariocas, ela é o meio de acesso para que possamos garantir a segurança dos seus dados e a validação da sua identidade, além de simplificar o processo de inscrição nos cursos e demais ações ofertadas.',
  },
  {
    id: 'criar-conta',
    title: 'Não tenho uma conta Gov.br. Como posso criar uma?',
    content:
      'Você pode criar sua conta de forma gratuita e rápida pelo site ou aplicativo do Gov.br. Basta seguir as instruções e preencher os dados solicitados. \n\n Ficou com dúvida? Assista o vídeo "Saiba como criar uma conta GOV.BR [OFICIAL]" através do link https://www.youtube.com/watch?v=qmqJqr3fN5w',
  },
  {
    id: 'recuperar-senha',
    title: 'Esqueci a senha da minha conta Gov.br. O que devo fazer?',
    content:
      'Você pode recuperar sua senha diretamente no site ou aplicativo do Gov.br. Basta seguir o processo de "Esqueci minha senha" e usar o método de recuperação que preferir (e-mail, celular ou reconhecimento facial, dependendo do nível da sua conta). \n\n Ficou com dúvida? Assista ao vídeo "Como recuperar a senha de sua conta GOV.BR? [OFICIAL]" através do link https://www.youtube.com/watch?v=H5LC7saob7M&t=1s',
  },
  {
    id: 'apto-aulas',
    title: 'Ao solicitar a inscrição, já estou apto(a) para as aulas?',
    content:
      'Não. Ao solicitar sua inscrição, você deverá aguardar a confirmação por e-mail ou telefone da unidade responsável pela atividade. \n\n Por isso, é muito importante manter seus dados de contato sempre atualizados.',
  },
  {
    id: 'varios-cursos',
    title: 'Posso solicitar inscrição em mais de um curso?',
    content: 'Sim, você pode se inscrever em mais de um curso ao mesmo tempo.',
  },
  {
    id: 'cursos-gratuitos',
    title: 'Todos os cursos são gratuitos?',
    content:
      'Não. A maioria dos cursos é gratuita, mas alguns podem ter um custo. Se houver, essa informação estará sempre destacada na descrição do próprio curso.',
  },
  {
    id: 'cancelar',
    title: 'Como faço para cancelar minha inscrição?',
    content:
      'Para cancelar sua inscrição, basta ir até a página da atividade desejada no Oportunidades Cariocas e clicar em "Cancelar inscrição".',
  },
  {
    id: 'certificado',
    title: 'Receberei certificado de conclusão do curso?',
    content:
      'Sim. Ao finalizar o curso, você terá direito a um certificado digital de participação ou conclusão. \n\n Ele será disponibilizado aqui mesmo, na plataforma Oportunidades Cariocas, na aba "Certificados" e/ou por e-mail pela unidade responsável.',
  },
]

export const dynamic = 'force-static'

export default function FaqPageCourses() {
  return (
    <main className="max-w-4xl min-h-lvh mx-auto pt-15 text-foreground pb-10">
      <SecondaryHeader title="FAQ" />
      <div className="p-5 pt-10 max-w-4xl mx-auto">
        <div className="space-y-8">
          {FAQ_SECTIONS.map((section, index) => (
            <div key={section.id}>
              <div className="space-y-2">
                <h2 className="text-lg font-medium tracking-normal leading-5">
                  {section.title}
                </h2>
                <FormattedContent content={section.content} />
              </div>
              {index < FAQ_SECTIONS.length - 1 && (
                <div className="mt-8 border-t border-border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
