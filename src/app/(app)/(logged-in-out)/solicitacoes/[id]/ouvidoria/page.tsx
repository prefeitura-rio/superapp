import HeaderWrapperClient from '@/app/components/header-wrapper-client'
import { ChevronRightIcon } from '@/assets/icons/chevron-right-icon'
import { buildAuthUrl } from '@/constants/url'
import { getUserInfoFromToken } from '@/lib/user-info'
import { redirect } from 'next/navigation'

interface OuvidoriaLAIPageProps {
  params: Promise<{ id: string }>
}

const cards = [
  {
    title: 'Elogio',
    description: 'Conte para gente o que lhe agradou em nossos serviços',
  },
  {
    title: 'Sugestão',
    description:
      'Queremos sua contribuição para melhorar nossos serviços e políticas públicas',
  },
  {
    title: 'Reclamação',
    description: 'Diga o que não funcionou bem para buscarmos uma solução',
  },
]

export default async function OuvidoriaLAIPage({
  params,
}: OuvidoriaLAIPageProps) {
  const { id } = await params
  const user = await getUserInfoFromToken()

  if (!user.cpf) {
    redirect(buildAuthUrl(`/solicitacoes/${id}/ouvidoria`))
  }

  return (
    <div className="pb-4 text-foreground flex flex-col">
      <HeaderWrapperClient />

      <div className="max-w-4xl mx-auto w-full px-4 flex flex-col gap-2">
        <h1
          className="text-3xl font-medium leading-9 text-card-foreground mb-4 pt-2"
          style={{ letterSpacing: '-0.4px' }}
        >
          Como foi o atendimento da sua solicitação?
        </h1>

        {cards.map(card => (
          <div key={card.title} className="bg-card rounded-2xl p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium leading-5 text-foreground">
                  {card.title}
                </span>
                <span className="text-sm text-foreground-light leading-5">
                  {card.description}
                </span>
              </div>
              <div className="text-foreground-light shrink-0">
                <ChevronRightIcon />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
