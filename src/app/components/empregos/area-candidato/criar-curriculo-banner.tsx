import { FileText } from 'lucide-react'
import Link from 'next/link'

/**
 * Banner da área do candidato para quem está deslogado. "Criar agora" leva ao
 * currículo, que manda para o login e volta.
 */
export function CriarCurriculoBanner() {
  return (
    <Link
      href="/servicos/trabalho/curriculo"
      className="relative flex min-h-24 w-full items-center justify-between gap-3 overflow-hidden rounded-2xl bg-background px-4 py-4 transition-opacity hover:opacity-90 active:opacity-95"
    >
      <div className="min-w-0 flex-1">
        <p className="text-base font-medium text-foreground">
          Faça seu currículo
        </p>
        <p className="mt-0.5 text-xs leading-4 text-foreground-light">
          Entre no Banco de Talentos
        </p>
        <span className="mt-3 inline-flex rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
          Criar agora
        </span>
      </div>
      {/* Provisório: a ilustração 3D do Figma ainda não foi exportada. */}
      <FileText
        aria-hidden
        className="size-16 shrink-0 text-primary/70 stroke-[1.25]"
      />
    </Link>
  )
}
