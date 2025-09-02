import { formatCpf } from '@/lib/format-cpf'
import { formatUserPhone } from '@/lib/format-phone'
import type { UserInfoComplete } from '../../types'

interface ConfirmUserDataSlideProps {
  userInfo: UserInfoComplete
}

interface DataFieldProps {
  label: string
  value: string
}

const DataField = ({ label, value }: DataFieldProps) => (
  <div className="py-1">
    <p className="text-sm text-muted-foreground tracking-normal leading-5 font-normal">
      {label}
    </p>
    <p className="text-foreground font-normal">{value}</p>
  </div>
)

const formatUserEmail = (email: UserInfoComplete['email']): string => {
  return email?.principal?.valor || 'Informação indisponível'
}

export const ConfirmUserDataSlide = ({
  userInfo,
}: ConfirmUserDataSlideProps) => {
  const userFields = [
    { label: 'CPF', value: formatCpf(userInfo.cpf) },
    { label: 'Nome', value: userInfo.name },
    { label: 'Celular', value: formatUserPhone(userInfo.telefone) },
    { label: 'E-mail', value: formatUserEmail(userInfo.email) },
  ]

  return (
    <div className="w-full space-y-10">
      <div className="text-left">
        <h2 className="text-3xl font-medium text-foreground mb-2 leading-9 tracking-tight">
          Para continuar com sua inscrição,{' '}
          <span className="text-primary">confirme suas informações</span>
        </h2>
      </div>

      <div className="space-y-4 mt-3">
        {userFields.map(({ label, value }) => (
          <DataField key={label} label={label} value={value} />
        ))}
      </div>
    </div>
  )
}
