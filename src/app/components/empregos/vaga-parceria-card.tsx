import { PrefLogo } from '@/assets/icons/pref-logo'

interface VagaParceriaCardProps {
  orgaoParceiro: string
}

/** Logo Prefeitura Rio (hardcoded) - circular */
function ParceriaLogo() {
  return (
    <div className="size-12 shrink-0 overflow-hidden rounded-full border border-border bg-muted/30 flex items-center justify-center p-1.5">
      <PrefLogo className="h-full w-full object-contain" fill="#1a1a1a" />
    </div>
  )
}

export function VagaParceriaCard({ orgaoParceiro }: VagaParceriaCardProps) {
  return (
    <div className="mt-6 flex items-center gap-3">
      <ParceriaLogo />
      <p className="text-sm font-normal leading-5 text-foreground">
        Vaga oferecida em parceria com a {orgaoParceiro}
      </p>
    </div>
  )
}
