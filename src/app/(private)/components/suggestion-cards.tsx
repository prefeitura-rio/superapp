import boyStudying from '@/assets/boyStudying.svg'
import businessMan from '@/assets/businessMan.svg'
import smilingWoman from '@/assets/smilingWoman.svg'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

interface SuggestionCardsProps {
  order?: number[]
}

const cards = [
  {
    key: 'iptu',
    bg: 'bg-[#A0BFF9]',
    badge: (
      <Badge className="bg-[#F65600] font-normal text-white z-10 absolute top-5 left-6">
        com desconto
      </Badge>
    ),
    text: (
      <p className="text-xl font-medium z-10 absolute bottom-3 text-black left-6">
        Pague seu <br />
        <span className="font-bold">IPTU</span> no PIX
      </p>
    ),
    image: (
      <Image
        src={smilingWoman}
        alt="Pessoa sentada em uma poltrona azul"
        className="h-38 w-auto absolute -bottom-4 -right-4 z-20"
      />
    ),
  },
  {
    key: 'curso',
    bg: 'bg-[#B3DDE9]',
    badge: null,
    text: (
      <p className="text-xl text-black font-medium z-10 absolute bottom-3 left-6">
        Encontre
        <br />
        seu <span className="font-bold">Curso</span>
      </p>
    ),
    image: (
      <Image
        src={boyStudying}
        alt="Pessoa sentada em uma poltrona azul"
        className="h-36 w-auto absolute -bottom-4 -right-0 z-20"
      />
    ),
  },
  {
    key: 'emprego',
    bg: 'bg-red-100',
    badge: null,
    text: (
      <p className="text-xl text-black font-medium z-10 absolute bottom-3 left-6">
        Oportunidades
        <br />
        de <span className="font-bold">Emprego</span>
      </p>
    ),
    image: (
      <Image
        src={businessMan}
        alt="Pessoa sentada em uma poltrona azul"
        className="h-40 w-auto absolute -bottom-4 -right-0 z-20"
      />
    ),
  },
]

export default function SuggestionCards({
  order = [0, 1, 2],
}: SuggestionCardsProps) {
  return (
    <div className="relative w-full overflow-x-auto pb-4 no-scrollbar">
      <div className="flex gap-4 px-5 w-max">
        {order.map(idx => {
          const card = cards[idx]
          return (
            <div
              key={card.key}
              className={`w-[85vw] max-w-[350px] h-[152px] ${card.bg} rounded-lg overflow-hidden flex flex-col relative`}
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
