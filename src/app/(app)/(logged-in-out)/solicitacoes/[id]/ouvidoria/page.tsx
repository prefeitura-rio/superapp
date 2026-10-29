import HeaderWrapperClient from '@/app/components/header-wrapper-client'
import autofalante from '@/assets/autofalante.png'
import { ChevronRightIcon } from '@/assets/icons/chevron-right-icon'
import joia from '@/assets/joinha.png'
import lampada from '@/assets/lampada.png'
import { buildAuthUrl } from '@/constants/url'
import { getUserInfoFromToken } from '@/lib/user-info'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

interface OuvidoriaLAIPageProps {
  params: Promise<{ id: string }>
}

export default async function OuvidoriaLAIPage({
  params,
}: OuvidoriaLAIPageProps) {
  const { id } = await params
  const user = await getUserInfoFromToken()

  if (!user.cpf) {
    redirect(buildAuthUrl(`/solicitacoes/${id}/ouvidoria`))
  }

  const cards = [
    {
      href: 'https://www.1746.rio/hc/pt-br/articles/13791534748187-Elogio',
      img: joia,
      alt: 'Elogio',
      title: 'Elogio',
      description: 'Conte para gente o que lhe agradou em nossos serviços',
    },
    {
      href: 'https://www.1746.rio/hc/pt-br/articles/13791513095451-Sugest%C3%A3o',
      img: lampada,
      alt: 'Sugestão',
      title: 'Sugestão',
      description:
        'Queremos sua contribuição para melhorar nossos serviços e políticas públicas',
    },
    {
      href: 'https://www.1746.rio/hc/pt-br/articles/13791498047643-Reclama%C3%A7%C3%A3o',
      img: autofalante,
      alt: 'Reclamação',
      title: 'Reclamação',
      description: 'Diga o que não funcionou bem para buscarmos uma solução',
    },
  ]

  return (
    <div className="pb-4 min-h-lvh max-w-xl mx-auto text-foreground flex flex-col">
      <HeaderWrapperClient />

      <section className="px-4 pt-2 mb-6">
        <h1 className="text-3xl font-medium leading-9 text-foreground">
          Como foi o atendimento da sua solicitação?
        </h1>
      </section>

      <div className="px-4 space-y-2">
        {cards.map(card => (
          <Link
            key={card.title}
            href={card.href}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="bg-card rounded-2xl p-4 hover:bg-card/50 transition-colors">
              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
                <Image src={card.img} alt={card.alt} width={40} height={40} />
                <div className="text-left">
                  <h3 className="font-medium leading-5 text-sm text-foreground">
                    {card.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {card.description}
                  </p>
                </div>
                <div className="text-muted-foreground">
                  <ChevronRightIcon />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
