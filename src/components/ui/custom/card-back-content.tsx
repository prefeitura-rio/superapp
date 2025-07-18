'use client'

interface BackContentField {
  label: string
  value?: string
  fallback?: string
}

interface CardBackContentProps {
  fields: BackContentField[]
  lastFieldFullWidth?: boolean
}

export function CardBackContent({
  fields,
  lastFieldFullWidth = true,
}: CardBackContentProps) {
  const lastIndex = fields.length - 1

  return (
    <>
      {fields.map((field, index) => {
        const isLast = index === lastIndex
        const shouldUseFullWidth = isLast && lastFieldFullWidth

        if (shouldUseFullWidth) {
          return (
            <div key={index} className="flex items-center justify-between">
              <div>
                <span className="text-sm opacity-70 block">{field.label}</span>
                <span className="text-sm block">
                  {field.value || field.fallback || 'Não disponível'}
                </span>
              </div>
            </div>
          )
        }

        return (
          <div key={index}>
            <span className="text-sm opacity-70 block">{field.label}</span>
            <span className="text-sm block">
              {field.value || field.fallback || 'Não disponível'}
            </span>
          </div>
        )
      })}
    </>
  )
}
