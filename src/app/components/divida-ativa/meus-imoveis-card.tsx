import { ChevronRightIcon } from '@/assets/icons/chevron-right-icon'
import meusImoveisIcon from '@/assets/meus-imoveis.png'
import Image from 'next/image'
import Link from 'next/link'

interface MeusImoveisCardProps {
  /**
   * Quantos imóveis o cidadão já cadastrou. `null` quando a leitura falhou: a contagem é
   * conteúdo secundário e não pode derrubar a landing, então o card fica sem o número e
   * continua navegável.
   */
  quantidade: number | null
}

export function MeusImoveisCard({ quantidade }: MeusImoveisCardProps) {
  return (
    <Link
      href="/divida-ativa/imoveis"
      className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 transition-colors hover:bg-card/50"
    >
      {/* Decorativa: o rótulo ao lado já nomeia o card, então um alt aqui só duplicaria o
          texto para quem usa leitor de tela. */}
      <Image
        src={meusImoveisIcon}
        alt=""
        width={40}
        height={39}
        className="shrink-0"
      />

      <span className="text-sm font-normal leading-5 text-foreground">
        Meus imóveis
      </span>

      {quantidade !== null && (
        <span className="flex size-6 items-center justify-center rounded-full bg-secondary text-xs font-normal text-foreground">
          {quantidade}
        </span>
      )}

      <ChevronRightIcon className="ml-auto shrink-0 text-muted-foreground" />
    </Link>
  )
}
