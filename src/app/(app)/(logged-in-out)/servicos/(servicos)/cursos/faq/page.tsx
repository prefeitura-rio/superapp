import { SecondaryHeader } from '@/app/components/secondary-header'
import { memo } from 'react'

type ContentPart = {
  type: 'text' | 'video-title' | 'link'
  content: string
  href?: string
}

function parseContent(text: string): ContentPart[] {
  const parts: ContentPart[] = []
  const videoTitleRegex = /"([^"]+)"/g // Picks up the text between double quotes
  const urlRegex = /(https?:\/\/[^\s]+)/g // Picks urls

  let lastIndex = 0
  const matches: Array<{ type: 'video' | 'url'; match: RegExpExecArray }> = []

  let videoMatch = videoTitleRegex.exec(text)
  while (videoMatch !== null) {
    matches.push({ type: 'video', match: videoMatch })
    videoMatch = videoTitleRegex.exec(text)
  }

  let urlMatch = urlRegex.exec(text)
  while (urlMatch !== null) {
    matches.push({ type: 'url', match: urlMatch })
    urlMatch = urlRegex.exec(text)
  }

  matches.sort((a, b) => a.match.index - b.match.index)

  for (const { type, match } of matches) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
      })
    }

    if (type === 'video') {
      parts.push({
        type: 'video-title',
        content: match[1],
      })
    } else {
      parts.push({
        type: 'link',
        content: match[0],
        href: match[0],
      })
    }

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex),
    })
  }

  return parts.length > 0 ? parts : [{ type: 'text', content: text }]
}

const FormattedContent = memo(({ content }: { content: string }) => {
  const parts = parseContent(content)

  return (
    <p className="text-foreground-light text-sm leading-relaxed whitespace-pre-line opacity-50">
      {parts.map((part, i) => {
        if (part.type === 'video-title') {
          return (
            <span key={i} className="italic opacity-100">
              "{part.content}"
            </span>
          )
        }
        if (part.type === 'link') {
          return (
            <a
              key={i}
              href={part.href}
              target="_blank"
              rel="noopener noreferrer"
              className="italic underline opacity-100 hover:opacity-80 transition-opacity"
            >
              {part.content}
            </a>
          )
        }
        return <span key={i}>{part.content}</span>
      })}
    </p>
  )
})

FormattedContent.displayName = 'FormattedContent'

const FAQ_SECTIONS = [
  {
    id: 'plataforma',
    title: 'O que é a Plataforma Oportunidas Cariocas?',
    content:
      'O Oportunidas Cariocas é uma plataforma digital que reúne em um só lugar todas as informações e inscrições de cursos, oficinas, palestras e quaisquer atividades educativas oferecidas pela Prefeitura do Rio e instituições parceiras. ',
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
      'A conta Gov.br é a sua identidade digital para acessar de forma segura e prática os serviços digitais do governo. Qualquer cidadão brasileiro ou estrangeiro com registro na base de dados do Cadastro de Pessoas Físicas (CPF) pode criar a sua conta. \n\n Para o Oportunidas Cariocas, ela é o meio de acesso para que possamos garantir a segurança dos seus dados e a validação da sua identidade, além de simplificar o processo de inscrição nos cursos e demais ações ofertadas.',
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
      'Para cancelar sua inscrição, basta ir até a página da atividade desejada no Oportunidades Cariocas e clicar em “Cancelar inscrição”.',
  },
  {
    id: 'certificado',
    title: 'Receberei certificado de conclusão do curso?',
    content:
      'Sim. Ao finalizar o curso, você terá direito a um certificado digital de participação ou conclusão. \n\n Ele será disponibilizado aqui mesmo, na plataforma Oportunidas Cariocas, na aba "Certificados" e/ou por e-mail pela unidade responsável.',
  },
] as const

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
