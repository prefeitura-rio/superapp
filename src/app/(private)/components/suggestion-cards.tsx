'use client'

import boyStudying from '@/assets/boyStudying.png'
import smilingWoman from '@/assets/smilingWoman.png'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface SuggestionCardsProps {
  order?: number[]
}

const cards = [
  {
    key: 'iptu',
    bg: 'bg-[#6A93D2]',
    route: '/services/iptu',
    badge: (
      <Badge className="bg-secondary font-normal text-foreground z-10 absolute top-4 left-5">
        IPTU
      </Badge>
    ),
    text: (
      <>
        <p className="text-xs leading-5 text-background font-normal z-10 absolute bottom-8 left-5">
          com desconto
        </p>
        <p className="text-xl leading-5 text-background font-medium z-10 absolute bottom-3 left-5">
          Pague no PIX
        </p>
      </>
    ),
    image: (
      <Image
        src={smilingWoman}
        alt="Pessoa sentada em uma poltrona azul"
        className="h-26 w-auto absolute -bottom-4 -right-4 z-20"
      />
    ),
  },
  {
    key: 'curso',
    bg: 'bg-[#3DB58F]',
    route: '/services/courses',
    badge: (
      <Badge className="bg-[#64C4A5] font-normal text-white z-10 absolute top-4 left-5">
        Inscrições gratuitas
      </Badge>
    ),
    text: (
      <p className="text-xl leading-5 max-[385px]:max-w-[100px] sm:max-w-[186px] text-background font-medium z-10 absolute bottom-3 left-5">
        Encontre seu Curso
      </p>
    ),
    image: (
      <Image
        src={boyStudying}
        alt="Pessoa sentada em uma poltrona azul"
        className="h-26 w-auto absolute -bottom-0 right-0 z-20"
      />
    ),
  },
  // {
  //   key: 'emprego',
  //   bg: 'bg-red-100',
  //   route: '/services/jobs',
  //   badge: null,
  //   text: (
  //     <p className="text-xl text-black font-medium z-10 absolute bottom-3 left-6">
  //       Oportunidades
  //       <br />
  //       de <span className="font-bold">Emprego</span>
  //     </p>
  //   ),
  //   image: (
  //     <Image
  //       src={businessMan}
  //       alt="Pessoa sentada em uma poltrona azul"
  //       className="h-26 w-auto absolute -bottom-4 -right-0 z-20"
  //     />
  //   ),
  // },
]

export default function SuggestionCards({
  order = [0, 1],
}: SuggestionCardsProps) {
  const router = useRouter()
  return (
    <div className="relative w-full overflow-x-auto pb-6 no-scrollbar">
      <div className="flex gap-4 px-4 w-max">
        {order.map(idx => {
          const card = cards[idx]
          return (
            <div
              key={card.key}
              className={`w-[85vw] max-w-[350px] h-[104px] ${card.bg} rounded-2xl overflow-hidden flex flex-col relative`}
              // onClick={() => card.route && router.push(card.route)}
              style={{ cursor: 'pointer' }}
              // onKeyDown={e => {
              //   if ((e.key === 'Enter' || e.key === ' ') && card.route)
              //     router.push(card.route)
              // }}
            >
              {card.badge}
              {card.text}
              {card.image}
            </div>
          )
        })}
      </div>
    </div>
  )
}
