import HeaderWrapperClient from '@/app/components/header-wrapper-client'
import { ChevronRightIcon } from '@/assets/icons/chevron-right-icon'
import { TICKET_FORM_BASE_URL, buildAuthUrl } from '@/constants/url'
import { getUserInfoFromToken } from '@/lib/user-info'
import { redirect } from 'next/navigation'

interface OuvidoriaPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    osId?: string
    elogio?: string
    sugestao?: string
    reclamacao?: string
  }>
}

type OuvidoriaType = 'elogio' | 'sugestao' | 'reclamacao'

const CARD_META: Record<OuvidoriaType, { title: string; description: string }> =
  {
    elogio: {
      title: 'Elogio',
      description: 'Conte para gente o que lhe agradou em nossos serviços',
    },
    sugestao: {
      title: 'Sugestão',
      description:
        'Queremos sua contribuição para melhorar nossos serviços e políticas públicas',
    },
    reclamacao: {
      title: 'Reclamação',
      description: 'Diga o que não funcionou bem para buscarmos uma solução',
    },
  }

function buildOuvidoriaLink(categoryId: string, osId: string): string {
  const params = new URLSearchParams({ id: categoryId, woId: osId })
  return `${TICKET_FORM_BASE_URL}/ouvidoria/?${params.toString()}`
}

export default async function OuvidoriaPage({
  params,
  searchParams,
}: OuvidoriaPageProps) {
  const { id } = await params
  const { osId, elogio, sugestao, reclamacao } = await searchParams

  const user = await getUserInfoFromToken()
  if (!user.cpf) {
    const sp = new URLSearchParams()
    if (osId) sp.set('osId', osId)
    if (elogio) sp.set('elogio', elogio)
    if (sugestao) sp.set('sugestao', sugestao)
    if (reclamacao) sp.set('reclamacao', reclamacao)
    redirect(buildAuthUrl(`/solicitacoes/${id}/ouvidoria?${sp.toString()}`))
  }

  const types: OuvidoriaType[] = ['elogio', 'sugestao', 'reclamacao']
  const categoryIds: Record<OuvidoriaType, string | undefined> = {
    elogio,
    sugestao,
    reclamacao,
  }

  const availableCards = types
    .filter(t => !!categoryIds[t])
    .map(t => ({
      type: t,
      href: buildOuvidoriaLink(categoryIds[t] as string, osId as string),
    }))

  if (!osId || availableCards.length === 0) {
    redirect(`/solicitacoes/${id}`)
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

        {availableCards.map(card => (
          <a
            key={card.type}
            href={card.href}
            className="block bg-card rounded-2xl p-4 hover:bg-secondary transition-colors"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium leading-5 text-foreground">
                  {CARD_META[card.type].title}
                </span>
                <span className="text-sm text-foreground-light leading-5">
                  {CARD_META[card.type].description}
                </span>
              </div>
              <div className="text-foreground-light shrink-0">
                <ChevronRightIcon />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
