'use client'

import { Badge } from '@/components/ui/badge'
import { getEmailValue, hasValidEmail } from '@/helpers/email-data-helpers'
import { getPhoneValue, hasValidPhone } from '@/helpers/phone-data-helpers'
import { formatCpf } from '@/lib/format-cpf'
import { formatTitleCase } from '@/lib/utils'
import type { CourseUserInfo } from '../../types'
import type { ContactUpdateStatus } from '../confirm-inscription-client'

interface ConfirmUserDataSlideProps {
  userInfo: CourseUserInfo
  userAuthInfo: {
    cpf: string
    name: string
  }
  contactUpdateStatus?: ContactUpdateStatus
}

export default function ConfirmUserDataSlide({
  userInfo,
  userAuthInfo,
  contactUpdateStatus,
}: ConfirmUserDataSlideProps) {
  const hasEmail = hasValidEmail(userInfo.email)
  const hasPhone = hasValidPhone(userInfo.phone)

  const phoneNeedsUpdate = contactUpdateStatus?.phoneNeedsUpdate || false
  const emailNeedsUpdate = contactUpdateStatus?.emailNeedsUpdate || false

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
            Celular {(!hasPhone || phoneNeedsUpdate) && '*'}
          </p>
          <div className="flex items-center gap-2">
            <p
              className={`font-normal ${
                hasPhone ? 'text-foreground' : 'text-destructive'
              }`}
            >
              {!hasPhone
                ? 'celular não cadastrado'
                : (getPhoneValue(userInfo.phone) as string)}
            </p>
            {phoneNeedsUpdate && (
              <Badge
                variant="destructive"
                className="px-3 py-0.5 text-sm rounded-full"
              >
                Atualizar
              </Badge>
            )}
          </div>
        </div>
        <div className="py-1">
          <p className="text-sm text-muted-foreground tracking-normal leading-5 font-normal">
            E-mail {(!hasEmail || emailNeedsUpdate) && '*'}
          </p>
          <div className="flex items-center gap-2 min-w-0">
            <p
              className={`font-normal min-w-0 truncate ${
                hasEmail ? 'text-foreground' : 'text-destructive'
              }`}
            >
              {!hasEmail
                ? 'e-mail não cadastrado'
                : getEmailValue(userInfo.email)}
            </p>
            {emailNeedsUpdate && hasEmail && (
              <Badge
                variant="destructive"
                className="px-3 py-0.5 text-sm rounded-full flex-shrink-0"
              >
                Atualizar
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
