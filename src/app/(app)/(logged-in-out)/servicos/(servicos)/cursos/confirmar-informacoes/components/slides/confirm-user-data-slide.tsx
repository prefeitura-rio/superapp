'use client'

import { getEmailValue, hasValidEmail } from '@/helpers/email-data-helpers'
import { getPhoneValue, hasValidPhone } from '@/helpers/phone-data-helpers'
import { formatCpf } from '@/lib/format-cpf'
import { formatTitleCase } from '@/lib/utils'
import type { CourseUserInfo } from '../../types'

interface ConfirmUserDataSlideProps {
  userInfo: CourseUserInfo
  userAuthInfo: {
    cpf: string
    name: string
  }
}

export default function ConfirmUserDataSlide({
  userInfo,
  userAuthInfo,
}: ConfirmUserDataSlideProps) {
  const hasEmail = hasValidEmail(userInfo.email)
  const hasPhone = hasValidPhone(userInfo.phone)
  return (
    <div className="w-full space-y-10">
      <div className="text-left">
        <h2 className="text-3xl font-medium text-foreground mb-2 leading-9 tracking-tight">
          Para continuar com sua inscrição,{' '}
          <span className="text-primary">confirme suas informações</span>
        </h2>
      </div>

      <div className="space-y-4 mt-3">
        <div className="py-1">
          <p className="text-sm text-muted-foreground tracking-normal leading-5 font-normal">
            CPF
          </p>
          <p className="text-foreground font-normal">
            {formatCpf(userAuthInfo?.cpf)}
          </p>
        </div>
        <div className="py-1">
          <p className="text-sm text-muted-foreground tracking-normal leading-5 font-normal">
            Nome
          </p>
          <p className="text-foreground font-normal">
            {formatTitleCase(userAuthInfo?.name) || 'Informação indisponível'}
          </p>
        </div>
        <div className="py-1">
          <p className="text-sm text-muted-foreground tracking-normal leading-5 font-normal">
            Celular
          </p>
          <p
            className={`font-normal ${
              hasPhone ? 'text-foreground' : 'text-orange-400/70'
            }`}
          >
            {hasPhone
              ? (getPhoneValue(userInfo.phone) as string)
              : 'Celular não cadastrado'}
          </p>
        </div>
        <div className="py-1">
          <p className="text-sm text-muted-foreground tracking-normal leading-5 font-normal">
            E-mail
          </p>
          <p
            className={`font-normal ${
              hasEmail ? 'text-foreground' : 'text-orange-400/70'
            }`}
          >
            {hasEmail ? getEmailValue(userInfo.email) : 'E-mail não cadastrado'}
          </p>
        </div>
      </div>
    </div>
  )
}
