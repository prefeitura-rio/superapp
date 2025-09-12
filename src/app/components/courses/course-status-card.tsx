import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface CourseStatusCardProps {
  status: 'pending' | 'approved' | 'concluded' | 'rejected'
  className?: string
}

const statusConfig = {
  pending: {
    badgeText: 'Em análise',
    message:
      'Sua inscrição foi enviada e está sendo avaliada pela organização responsável. Você receberá um e-mail com mais informações em breve.',
    badgeClassName: 'bg-card-5 text-background dark:text-foreground',
  },
  approved: {
    badgeText: 'Inscrito',
    message:
      'Sua inscrição foi aprovada com sucesso. Você já está confirmado no curso e receberá por e-mail mais informações sobre as próximas etapas.',
    badgeClassName: 'bg-card-3 text-background dark:text-foreground',
  },
  rejected: {
    badgeText: 'Recusado',
    message:
      'Sua inscrição foi analisada, mas não pôde ser aprovada neste momento. Isso pode ter ocorrido devido ao não atendimento dos requisitos ou critérios estabelecidos pela organização responsável.\n\nCaso queira, você poderá se inscrever novamente em uma próxima oportunidade ou buscar mais informações junto à equipe responsável pelo processo.',
    badgeClassName: 'bg-destructive text-background dark:text-foreground',
  },
  concluded: {
    badgeText: 'Finalizado',
    message:
      'Parabéns! Você concluiu o curso.\nO certificado já está disponível e pode ser acessado diretamente pelo botão abaixo.',
    badgeClassName: 'bg-secondary text-foreground',
  },
}

export function CourseStatusCard({ status, className }: CourseStatusCardProps) {
  const config = statusConfig[status]

  return (
    <div
      className={cn(
        'p-4 bg-card mt-6 rounded-2xl border-muted-foreground border-dashed border-1',
        className
      )}
    >
      <div className="flex flex-col items-start justify-between gap-2">
        <Badge className={config.badgeClassName}>{config.badgeText}</Badge>
        <p className="text-xs md:text-sm text-foreground-light leading-4 md:leading-5 whitespace-pre-line">
          {config.message}
        </p>
      </div>
    </div>
  )
}
