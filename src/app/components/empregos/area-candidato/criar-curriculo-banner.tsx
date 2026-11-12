import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import Link from 'next/link'
import criarCurriculoIlustracao from '../../../../../public/empregos/criar-curriculo-3d.png'

/**
 * Banner da área do candidato para quem está deslogado. "Criar agora" leva ao
 * currículo, que manda para o login e volta.
 */
export function CriarCurriculoBanner() {
  return (
    <Link
      href="/servicos/trabalho/curriculo"
      className="relative flex h-27 w-full items-center overflow-hidden rounded-2xl bg-border px-6 py-4 transition-opacity hover:opacity-90 active:opacity-95"
    >
      {/* Faixa decorativa do Figma (Rectangle 2278). */}
      <span
        aria-hidden
        className="absolute top-6 left-[62%] h-41 w-52 rotate-[42.89deg] rounded-[38px] bg-card shadow-[0_4px_33px_0_rgba(107,107,107,0.23),inset_1px_1px_2px_0_rgba(255,255,255,0.08)]"
      />
      <div className="relative flex min-w-0 flex-1 flex-col gap-2.5">
        <div>
          <p className="text-base font-medium leading-5 text-foreground">
            Faça seu currículo
          </p>
          <p className="text-xs leading-4 text-[#3E5782] dark:text-primary">
            Entre no Banco de Talentos
          </p>
        </div>
        <Badge className="bg-[#3E5782] text-white">Criar agora</Badge>
      </div>
      <Image
        src={criarCurriculoIlustracao}
        alt=""
        width={121}
        height={97}
        className="absolute right-6 bottom-0 h-24.25 w-auto"
        priority
      />
    </Link>
  )
}
