import { FileText } from 'lucide-react'
import Link from 'next/link'

interface MeuCurriculoCardProps {
  subtitulo: string
}

export function MeuCurriculoCard({ subtitulo }: MeuCurriculoCardProps) {
  return (
    <Link
      href="/servicos/trabalho/curriculo"
      className="flex min-h-28 flex-col justify-between gap-4 rounded-2xl bg-background p-4 transition-opacity hover:opacity-90 active:opacity-95"
    >
      {/* Provisório: a ilustração 3D do Figma ainda não foi exportada. */}
      <FileText aria-hidden className="size-7 text-primary stroke-[1.5]" />
      <div>
        <p className="text-sm font-medium text-foreground">Meu Currículo</p>
        <p className="mt-0.5 text-xs leading-4 text-foreground-light">
          {subtitulo}
        </p>
      </div>
    </Link>
  )
}
