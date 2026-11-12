import Image from 'next/image'
import Link from 'next/link'
import meuCurriculoIcone from '../../../../../public/empregos/meu-curriculo-3d.png'

interface MeuCurriculoCardProps {
  subtitulo: string
}

export function MeuCurriculoCard({ subtitulo }: MeuCurriculoCardProps) {
  return (
    <Link
      href="/servicos/trabalho/curriculo"
      className="flex min-h-27 flex-col justify-between gap-4 rounded-2xl border border-border bg-card px-4 py-3 transition-opacity hover:opacity-90 active:opacity-95"
    >
      <Image
        src={meuCurriculoIcone}
        alt=""
        width={36}
        height={36}
        className="size-9"
      />
      <div>
        <p className="text-sm font-medium leading-4 text-foreground">
          Meu Currículo
        </p>
        <p className="mt-0.5 text-xs leading-4 text-foreground-light">
          {subtitulo}
        </p>
      </div>
    </Link>
  )
}
