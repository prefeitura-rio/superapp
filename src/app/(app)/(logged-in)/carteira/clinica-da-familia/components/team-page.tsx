import { DoctorIcon, NurseIcon } from '@/assets/icons'
import { Card, CardContent } from '@/components/ui/card'
import { formatTitleCase } from '@/lib/utils'
import type { ReactNode } from 'react'

interface TeamPageProps {
  healthData?: {
    clinica_familia?: {
      nome?: string
    }
    equipe_saude_familia?: {
      nome?: string
      indicador?: boolean
      medicos?: Array<{ id_profissional_sus: string; nome: string }>
      enfermeiros?: Array<{ id_profissional_sus: string; nome: string }>
    }
  }
}

interface TeamMemberCardProps {
  icon: ReactNode
  title: string
  members: Array<{ nome: string }>
}

function TeamMemberCard({ icon, title, members }: TeamMemberCardProps) {
  return (
    <Card className="rounded-xl border-0 shadow-none">
      <CardContent className="px-0">
        <div className="space-y-1 px-4 flex gap-4 items-center">
          {icon}
          <div className="flex flex-col flex-1 min-w-0">
            <p className="text-xs text-foreground-light leading-4">{title}</p>
            {members.length > 0 ? (
              members.map((member, index) => (
                <p
                  key={index}
                  className="text-foreground leading-5 text-sm break-words"
                >
                  {member.nome}
                </p>
              ))
            ) : (
              <p className="text-foreground leading-5 text-sm">
                Não disponível
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function TeamPage({ healthData }: TeamPageProps) {
  const medicos = healthData?.equipe_saude_familia?.medicos || []
  const enfermeiros = healthData?.equipe_saude_familia?.enfermeiros || []
  const teamName =
    healthData?.equipe_saude_familia?.nome || 'Equipe não disponível'

  if (healthData?.equipe_saude_familia?.indicador === false) {
    return null
  }

  return (
    <div className="py-6 px-4">
      <h2 className="text-base pb-2 pl-1 text-foreground font-medium leading-5">
        Equipe {formatTitleCase(teamName)}
      </h2>

      <div className="flex flex-col gap-2">
        <TeamMemberCard
          icon={<DoctorIcon className="text-foreground" />}
          title="Médicos e médicas"
          members={medicos}
        />
        <TeamMemberCard
          icon={<NurseIcon className="text-foreground" />}
          title="Enfermeiros e enfermeiras"
          members={enfermeiros}
        />
      </div>
    </div>
  )
}
