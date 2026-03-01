import { EmpregabilidadeStatusCandidatura } from '@/http-courses/models'
import { Check, Clock, X } from 'lucide-react'

interface CandidaturaFeedbackCardProps {
  statusCandidatura: EmpregabilidadeStatusCandidatura
  /** Quando definido (>= 0), indica que o candidato avançou pelo menos uma etapa */
  etapaAtualCandidatura?: number
}

function FeedbackIcon({
  statusCandidatura,
  avancouEtapa,
}: {
  statusCandidatura: EmpregabilidadeStatusCandidatura
  avancouEtapa: boolean
}) {
  if (
    statusCandidatura ===
      EmpregabilidadeStatusCandidatura.StatusCandidaturaEnviada &&
    !avancouEtapa
  ) {
    return <Clock className="size-4 shrink-0 text-foregound" />
  }

  if (
    statusCandidatura ===
      EmpregabilidadeStatusCandidatura.StatusCandidaturaEnviada &&
    avancouEtapa
  ) {
    return (
      <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
        <Check className="size-3 stroke-[2.5]" />
      </span>
    )
  }

  if (
    statusCandidatura ===
    EmpregabilidadeStatusCandidatura.StatusCandidaturaAprovada
  ) {
    return (
      <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-wallet-2b text-white">
        <Check className="size-3 stroke-[2.5]" />
      </span>
    )
  }

  if (
    statusCandidatura ===
    EmpregabilidadeStatusCandidatura.StatusCandidaturaReprovada
  ) {
    return (
      <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-destructive text-white">
        <X className="size-3 stroke-[2.5]" />
      </span>
    )
  }

  // vaga_congelada e vaga_descontinuada
  return (
    <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
      <X className="size-3 stroke-[2.5]" />
    </span>
  )
}

function getFeedbackText(
  statusCandidatura: EmpregabilidadeStatusCandidatura,
  avancouEtapa: boolean
): string {
  if (
    statusCandidatura ===
    EmpregabilidadeStatusCandidatura.StatusCandidaturaEnviada
  ) {
    if (avancouEtapa)
      return 'Parabéns! Você passou para a próxima etapa. Fique atento ao seu e-mail para mais informações.'
    return 'Sua inscrição foi enviada e está sendo avaliada pela organização responsável.'
  }

  if (
    statusCandidatura ===
    EmpregabilidadeStatusCandidatura.StatusCandidaturaAprovada
  ) {
    return 'Parabéns! Você foi aprovado para essa vaga. Fique atento ao seu e-mail para mais informações.'
  }

  if (
    statusCandidatura ===
    EmpregabilidadeStatusCandidatura.StatusCandidaturaReprovada
  ) {
    return 'Sua inscrição foi analisada, mas não pôde ser aprovada neste momento. Caso queira, você pode se candidatar para outras vagas disponíveis no Oportunidades Cariocas.'
  }

  if (
    statusCandidatura ===
    EmpregabilidadeStatusCandidatura.StatusCandidaturaVagaCongelada
  ) {
    return 'Esta vaga está temporariamente suspensa. Sua candidatura foi registrada e entraremos em contato caso o processo seletivo seja retomado.'
  }

  // vaga_descontinuada
  return 'Esta vaga não está mais disponível. Agradecemos seu interesse e convidamos você a explorar outras oportunidades no Oportunidades Cariocas.'
}

export function CandidaturaFeedbackCard({
  statusCandidatura,
  etapaAtualCandidatura,
}: CandidaturaFeedbackCardProps) {
  const avancouEtapa =
    etapaAtualCandidatura != null && etapaAtualCandidatura >= 0
  const text = getFeedbackText(statusCandidatura, avancouEtapa)

  return (
    <div className="flex items-center gap-3 rounded-xl bg-card p-4">
      <FeedbackIcon
        statusCandidatura={statusCandidatura}
        avancouEtapa={avancouEtapa}
      />
      <p className="text-xs font-normal leading-5 text-foreground-light">
        {text}
      </p>
    </div>
  )
}
