interface StatusIndicatorMessageProps {
  status: 'Amarelo' | 'Laranja' | 'Vermelho'
}

const STATUS_CONFIG = {
  Amarelo: {
    bgColor: 'bg-[#FBDEC1]',
    borderColor: 'border-card-5',
    dotColor: 'bg-[#C38C00] ring-2 ring-[#C38C00]/40',
    textColor: 'text-[#C38C00]',
    message:
      'Essa área está com risco moderado. A equipe de saúde continuará trabalhando, mas não realizará visitas domiciliares.',
  },
  Laranja: {
    bgColor: 'bg-[#eecdaf]',
    borderColor: 'border-card-5',
    dotColor: 'bg-card-5 ring-2 ring-card-5/40',
    textColor: 'text-card-5',
    message:
      'Essa área estava em situação de risco alto, e passa por reavaliação de segurança. Os atendimentos seguem somente dentro da unidade.',
  },
  Vermelho: {
    bgColor: 'bg-[#EACDCE]',
    borderColor: 'border-destructive',
    dotColor: 'bg-destructive',
    textColor: 'text-destructive',
    message:
      'Essa área está em situação de risco grave. A unidade será fechada por segurança. Consulte a situação da unidade dentro de algumas horas.',
  },
} as const

export function StatusIndicatorMessage({
  status,
}: StatusIndicatorMessageProps) {
  const config = STATUS_CONFIG[status]

  return (
    <div
      className={`
      ${config.bgColor} 
      ${config.borderColor} 
      border-1
      border-dashed 
      rounded-lg 
      p-4 
    `}
    >
      <div className="flex items-start gap-2">
        <div
          className={`
          ${config.dotColor} 
          w-2 
          h-2 
          rounded-full 
          mt-1
          flex-shrink-0
        `}
        />
        <div>
          <h3 className={`${config.textColor} text-xs mb-1 leading-4`}>
            Aviso importante
          </h3>
          <p className="text-card-foreground dark:text-[#020618] text-xs leading-4 -ml-4">
            {config.message}
          </p>
        </div>
      </div>
    </div>
  )
}
