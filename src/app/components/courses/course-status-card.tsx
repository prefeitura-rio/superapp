import { ClockIcon } from '@/assets/icons/clock-icon'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface CourseStatusCardProps {
  status: 'pending' | 'approved' | 'concluded' | 'rejected' | 'cancelled'
  className?: string
  hasCertificate?: boolean
}

function CheckCircleIcon({ color }: { color: 'black' | 'green' }) {
  const bg = color === 'green' ? '#22c55e' : '#09090B'
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="10" cy="10" r="10" fill={bg} />
      <path
        d="M6 10.5L8.5 13L14 7.5"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function XCircleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="10" cy="10" r="10" fill="#ef4444" />
      <path
        d="M7 7L13 13M13 7L7 13"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

interface StatusConfig {
  icon: ReactNode
  message: string
}

const statusConfig: Record<string, StatusConfig> = {
  pending: {
    icon: (
      <ClockIcon
        className="text-foreground-light shrink-0"
        width={20}
        height={20}
      />
    ),
    message:
      'Sua inscrição foi enviada e está sendo avaliada pela organização responsável.',
  },
  approved: {
    icon: <CheckCircleIcon color="black" />,
    message:
      'Sua inscrição foi aprovada com sucesso. Você já está confirmado no curso e receberá por e-mail mais informações sobre as próximas etapas.',
  },
  concluded: {
    icon: <CheckCircleIcon color="green" />,
    message:
      'Parabéns! Você concluiu o curso.\nO certificado já está disponível e pode ser acessado diretamente pelo botão abaixo.',
  },
  rejected: {
    icon: <XCircleIcon />,
    message:
      'Sua inscrição foi analisada, mas não pôde ser aprovada neste momento. Isso pode ter ocorrido devido ao não atendimento dos requisitos ou critérios estabelecidos pela organização responsável.\n\nCaso queira, você poderá se inscrever novamente em uma próxima oportunidade ou buscar mais informações junto à equipe responsável pelo processo.',
  },
  cancelled: {
    icon: <XCircleIcon />,
    message:
      'Sua inscrição foi analisada, mas não pôde ser aprovada neste momento. Isso pode ter ocorrido devido ao não atendimento dos requisitos ou critérios estabelecidos pela organização responsável.\n\nCaso queira, você poderá se inscrever novamente em uma próxima oportunidade ou buscar mais informações junto à equipe responsável pelo processo.',
  },
}

export function CourseStatusCard({
  status,
  className,
  hasCertificate = true,
}: CourseStatusCardProps) {
  const config = statusConfig[status]

  const message =
    status === 'concluded' && !hasCertificate
      ? 'Parabéns! Você concluiu o curso com sucesso.'
      : config.message

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 rounded-xl bg-card',
        className
      )}
    >
      <span className="shrink-0">{config.icon}</span>
      <p className="text-foreground-light text-xs font-normal leading-4 whitespace-pre-line">
        {message}
      </p>
    </div>
  )
}
