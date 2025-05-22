'use client'
import Whatsapp from '@/assets/Whatsapp.svg'
import icon1746 from '@/assets/icon1746.svg'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { SecondaryHeader } from '../../components/secondary-header'
import { WalletCard } from '../../components/wallet-card'

// Status color mapping
const statusColor: Record<string, string> = {
  Aberto: 'text-green-400',
  'Em andamento': 'text-yellow-300',
  Fechado: 'text-red-400',
  Pendente: 'text-blue-400',
}

function CallsStatusCard({
  title,
  status,
  date,
}: { title: string; status: string; date: string }) {
  return (
    <Card className="bg-zinc-900 border-none rounded-xl px-5 py-4">
      <div className="flex justify-between items-center">
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-sm font-medium truncate">{title}</span>
          <span className="text-xs text-zinc-400 mt-1">{date}</span>
        </div>
        <span
          className={`text-xs font-medium ml-4 ${statusColor[status] ?? ''}`}
        >
          {status}
        </span>
      </div>
    </Card>
  )
}

const FILTERS = [
  { label: 'Todos', value: 'all' },
  { label: 'Abertos', value: 'Aberto' },
  { label: 'Em andamento', value: 'Em andamento' },
  { label: 'Fechado', value: 'Fechado' },
  { label: 'Pendente', value: 'Pendente' },
]

const CALLS = [
  {
    title: 'Reparo de lâmpada apagada',
    status: 'Aberto',
    date: '25.05.2024',
  },
  {
    title: 'Manutenção/Desobstrução de bueiro',
    status: 'Em andamento',
    date: '13.04.2024',
  },
  {
    title: 'Fiscalização de buraco na via',
    status: 'Fechado',
    date: '03.03.2024',
  },
  {
    title: 'Recapeamento/recuperação de asfalto',
    status: 'Pendente',
    date: '03.03.2024',
  },
]

function CallsPage() {
  const [selected, setSelected] = useState('all')

  const filteredCalls =
    selected === 'all' ? CALLS : CALLS.filter(call => call.status === selected)

  return (
    <div className="text-white p-0 pb-5">
      <h2 className="pb-4 px-5">Chamados</h2>
      {/* Scrollable Filters */}
      <div className="relative w-full overflow-x-auto px-5 pb-4 no-scrollbar">
        <div className="flex gap-3 min-w-max">
          {FILTERS.map(filter => (
            <Badge
              key={filter.value}
              onClick={() => setSelected(filter.value)}
              className={`cursor-pointer px-3 py-1 rounded-full text-sm transition-colors
                ${
                  selected === filter.value
                    ? 'bg-white text-black'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }
              `}
              variant={selected === filter.value ? 'secondary' : 'outline'}
            >
              {filter.label}
            </Badge>
          ))}
        </div>
      </div>
      <div className="space-y-4 px-5">
        {filteredCalls.map((call, idx) => (
          <CallsStatusCard
            key={idx}
            title={call.title}
            status={call.status}
            date={call.date}
          />
        ))}
      </div>
    </div>
  )
}

export default function HealthCard() {
  return (
    <div className="max-w-md mx-auto pt-26 pb-10">
      <SecondaryHeader title="Carteira" />
      <div className="z-50">
        <h2 className="pb-4 px-5">Saúde</h2>
        <div className="px-5">
          <WalletCard
            href="/wallet/calls"
            title="Zeladoria"
            statusLabel="Chamados"
            statusValue="29"
            extraLabel="Abertos"
            extraValue="3"
            bgClass="bg-green-100"
            icon={{ src: icon1746, alt: 'Zeladoria' }}
          />
          {/* WhatsApp Icon Buttons Row */}
          <div className="flex flex-row gap-5 justify-start mt-8">
            {/* WhatsApp Button */}
            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="lg"
                className="rounded-full w-16 h-16 bg-[#16181A] hover:bg-[#232326] transition-colors"
              >
                <Plus className="h-8" />
              </Button>
              <div className="flex flex-col items-center">
                <span className="mt-2 text-white text-sm font-normal">
                  Abrir Chamado
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-16 h-16 bg-[#16181A] hover:bg-[#232326] transition-colors"
              >
                <Image src={Whatsapp} alt="Whatsapp" width={22} height={22} />
              </Button>
              <div className="flex flex-col items-center">
                <span className="mt-2 text-white text-sm font-normal">
                  Whatsapp
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* CallsPage moved here */}
        <div className="mt-8">
          <CallsPage />
        </div>
      </div>
    </div>
  )
}
