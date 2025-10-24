'use client'

interface TutorInfoProps {
  name: string
  cpf: string
  phone: string
  email: string
}

export function TutorInfo({ name, cpf, phone, email }: TutorInfoProps) {
  return (
    <div className="w-full">
      <div className="flex flex-col gap-1 p-4">
        <div className="text-sm">
          <span className="text-foreground-light leading-5 dark:text-foreground-light/70">
            Nome{' '}
          </span>
          <span className="text-foreground leading-5">{name}</span>
        </div>
        <div className="text-sm">
          <span className="text-foreground-light leading-5 dark:text-foreground-light/70">
            CPF{' '}
          </span>
          <span className="text-foreground leading-5">{cpf}</span>
        </div>
        <div className="text-sm">
          <span className="text-foreground-light leading-5 dark:text-foreground-light/70">
            Telefone{' '}
          </span>
          <span className="text-foreground leading-5">{phone}</span>
        </div>
        <div className="text-sm">
          <span className="text-foreground-light leading-5 dark:text-foreground-light/70">
            E-mail{' '}
          </span>
          <span className="text-foreground leading-5">{email}</span>
        </div>
      </div>
    </div>
  )
}
