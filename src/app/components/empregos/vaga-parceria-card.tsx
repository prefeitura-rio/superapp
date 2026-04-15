import { ParceriaLogo } from '@/assets/icons'

interface VagaParceriaCardProps {
  orgaoParceiro: string
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
