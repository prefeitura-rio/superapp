'use client'

import { DisabilityDrawerContent } from '@/app/components/drawer-contents/disability-drawer-content'
import { EducationDrawerContent } from '@/app/components/drawer-contents/education-drawer-content'
import { FamilyIncomeDrawerContent } from '@/app/components/drawer-contents/family-income-drawer-content'
import { GenderDrawerContent } from '@/app/components/drawer-contents/gender-drawer-content'
import { EditIcon } from '@/assets/icons/edit-icon'
import { BottomSheet } from '@/components/ui/custom/bottom-sheet'
import { getEmailValue, hasValidEmail } from '@/helpers/email-data-helpers'
import { getPhoneValue, hasValidPhone } from '@/helpers/phone-data-helpers'
import { formatCpf } from '@/lib/format-cpf'
import { formatDisability } from '@/lib/format-disability'
import { formatEducation } from '@/lib/format-education'
import { formatFamilyIncome } from '@/lib/format-family-income'
import { formatGender } from '@/lib/format-gender'
import { formatTitleCase } from '@/lib/utils'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import type { CourseUserInfo } from '../../types'
import type { ContactUpdateStatus } from '../confirm-inscription-client'

interface ConfirmUserDataSlideProps {
  userInfo: CourseUserInfo
  userAuthInfo: {
    cpf: string
    name: string
  }
  contactUpdateStatus?: ContactUpdateStatus
  courseSlug?: string
}

export default function ConfirmUserDataSlide({
  userInfo,
  userAuthInfo,
  contactUpdateStatus,
  courseSlug = '',
}: ConfirmUserDataSlideProps) {
  const router = useRouter()

  const hasEmail = hasValidEmail(userInfo.email)
  const hasPhone = hasValidPhone(userInfo.phone)
  const hasAddress = !!(
    userInfo.address?.logradouro &&
    userInfo.address?.bairro &&
    userInfo.address?.municipio
  )
  const hasGender = !!userInfo.genero
  const hasEducation = !!userInfo.escolaridade
  const hasFamilyIncome = !!userInfo.renda_familiar
  const hasDisability = !!userInfo.deficiencia

  const [genderDrawerOpen, setGenderDrawerOpen] = useState(false)
  const [educationDrawerOpen, setEducationDrawerOpen] = useState(false)
  const [familyIncomeDrawerOpen, setFamilyIncomeDrawerOpen] = useState(false)
  const [disabilityDrawerOpen, setDisabilityDrawerOpen] = useState(false)

  const formatAddress = () => {
    if (!userInfo.address) return 'Endereço não cadastrado'
    const parts = [
      userInfo.address.logradouro,
      userInfo.address.numero,
      userInfo.address.bairro,
      userInfo.address.municipio,
      userInfo.address.estado,
    ].filter(Boolean)
    return parts.join(', ') || 'Endereço não cadastrado'
  }

  const handlePhoneClick = () => {
    const returnUrl = `/servicos/cursos/confirmar-informacoes/${courseSlug}?redirectFromCourses=${courseSlug}`
    router.push(
      `/meu-perfil/informacoes-pessoais/atualizar-telefone?redirectFromCourses=${courseSlug}&returnUrl=${encodeURIComponent(returnUrl)}`
    )
  }

  const handleEmailClick = () => {
    const returnUrl = `/servicos/cursos/confirmar-informacoes/${courseSlug}?redirectFromCourses=${courseSlug}`
    router.push(
      `/meu-perfil/informacoes-pessoais/atualizar-email?redirectFromCourses=${courseSlug}&returnUrl=${encodeURIComponent(returnUrl)}`
    )
  }

  const handleAddressClick = () => {
    const returnUrl = `/servicos/cursos/confirmar-informacoes/${courseSlug}?redirectFromCourses=${courseSlug}`
    router.push(
      `/meu-perfil/endereco/atualizar-endereco?redirectFromCourses=${courseSlug}&returnUrl=${encodeURIComponent(returnUrl)}`
    )
  }

  const handleGenderClick = () => {
    setGenderDrawerOpen(true)
  }

  const handleEducationClick = () => {
    setEducationDrawerOpen(true)
  }

  const handleFamilyIncomeClick = () => {
    setFamilyIncomeDrawerOpen(true)
  }

  const handleDisabilityClick = () => {
    setDisabilityDrawerOpen(true)
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="text-left flex-shrink-0 pb-5">
        <h2 className="text-3xl font-medium text-foreground mb-2 leading-9 tracking-tight">
          Para continuar com sua inscrição,{' '}
          <span className="text-primary">confirme suas informações</span>
        </h2>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="overflow-y-auto overflow-x-hidden h-full">
          {/* CPF */}
          <div className="pb-4">
            <p className="text-sm text-muted-foreground tracking-normal leading-5 font-normal">
              CPF
            </p>
            <p className="text-foreground font-normal">
              {formatCpf(userAuthInfo?.cpf)}
            </p>
          </div>

          <div className="h-px bg-border" />

          {/* Nome */}
          <div className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground tracking-normal leading-5 font-normal">
              Nome
            </p>
            <p className="text-foreground font-normal">
              {formatTitleCase(userAuthInfo?.name) || 'Informação indisponível'}
            </p>
          </div>

          <div className="h-px bg-border" />

          {/* Celular */}
          <div
            className={`pt-4 pb-4 cursor-pointer hover:bg-accent/30 rounded-lg px-2 -mx-2 transition-colors ${
              !hasPhone ? 'border-l-4 border-destructive pl-2' : ''
            }`}
            onClick={handlePhoneClick}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground tracking-normal leading-5 font-normal">
                  Celular {!hasPhone && '*'}
                </p>
                <p
                  className={`font-normal ${
                    hasPhone
                      ? 'text-foreground'
                      : 'text-sm md:text-base text-destructive'
                  }`}
                >
                  {!hasPhone
                    ? 'Informe seu celular'
                    : (getPhoneValue(userInfo.phone) as string)}
                </p>
              </div>
              <EditIcon className="h-5 w-5 mr-2 text-foreground flex-shrink-0 ml-2" />
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* E-mail */}
          <div
            className={`pt-4 pb-4 cursor-pointer hover:bg-accent/30 rounded-lg px-2 -mx-2 transition-colors ${
              !hasEmail ? 'border-l-4 border-destructive pl-2' : ''
            }`}
            onClick={handleEmailClick}
          >
            <div className="flex items-center justify-between min-w-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground tracking-normal leading-5 font-normal">
                  E-mail {!hasEmail && '*'}
                </p>
                <p
                  className={`font-normal min-w-0 truncate ${
                    hasEmail
                      ? 'text-foreground'
                      : 'text-sm md:text-base text-destructive'
                  }`}
                >
                  {!hasEmail
                    ? 'Informe seu e-mail'
                    : getEmailValue(userInfo.email)}
                </p>
              </div>
              <EditIcon className="h-5 w-5 mr-2 text-foreground flex-shrink-0 ml-2" />
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Endereço */}
          <div
            className={`pt-4 pb-4 cursor-pointer hover:bg-accent/30 rounded-lg px-2 -mx-2 transition-colors ${
              !hasAddress ? 'border-l-4 border-destructive pl-2' : ''
            }`}
            onClick={handleAddressClick}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground tracking-normal leading-5 font-normal">
                  Endereço {!hasAddress && '*'}
                </p>
                <p
                  className={`font-normal ${
                    hasAddress
                      ? 'text-foreground'
                      : 'text-sm md:text-base text-destructive'
                  }`}
                >
                  {hasAddress ? formatAddress() : 'Informe seu endereço'}
                </p>
              </div>
              <EditIcon className="h-5 w-5 mr-2 text-foreground flex-shrink-0 ml-2" />
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Gênero */}
          <div
            className={`pt-4 pb-4 cursor-pointer hover:bg-accent/30 rounded-lg px-2 -mx-2 transition-colors ${
              !hasGender ? 'border-l-4 border-destructive pl-2' : ''
            }`}
            onClick={handleGenderClick}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground tracking-normal leading-5 font-normal">
                  Gênero
                </p>
                <p
                  className={`font-normal ${
                    hasGender
                      ? 'text-foreground'
                      : 'text-sm md:text-base text-destructive'
                  }`}
                >
                  {hasGender
                    ? formatGender(userInfo.genero)
                    : 'Informe seu gênero'}
                </p>
              </div>
              <EditIcon className="h-5 w-5 mr-2 text-foreground flex-shrink-0 ml-2" />
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Escolaridade */}
          <div
            className={`pt-4 pb-4 cursor-pointer hover:bg-accent/30 rounded-lg px-2 -mx-2 transition-colors ${
              !hasEducation ? 'border-l-4 border-destructive pl-2' : ''
            }`}
            onClick={handleEducationClick}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground tracking-normal leading-5 font-normal">
                  Escolaridade
                </p>
                <p
                  className={`font-normal ${
                    hasEducation
                      ? 'text-foreground'
                      : 'text-sm md:text-base text-destructive'
                  }`}
                >
                  {hasEducation
                    ? formatEducation(userInfo.escolaridade)
                    : 'Informe sua escolaridade'}
                </p>
              </div>
              <EditIcon className="h-5 w-5 mr-2 text-foreground flex-shrink-0 ml-2" />
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Renda familiar */}
          <div
            className={`pt-4 pb-4 cursor-pointer hover:bg-accent/30 rounded-lg px-2 -mx-2 transition-colors ${
              !hasFamilyIncome ? 'border-l-4 border-destructive pl-2' : ''
            }`}
            onClick={handleFamilyIncomeClick}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground tracking-normal leading-5 font-normal">
                  Renda familiar
                </p>
                <p
                  className={`font-normal ${
                    hasFamilyIncome
                      ? 'text-foreground'
                      : 'text-sm md:text-base text-destructive'
                  }`}
                >
                  {hasFamilyIncome
                    ? formatFamilyIncome(userInfo.renda_familiar)
                    : 'Informe sua renda familiar'}
                </p>
              </div>
              <EditIcon className="h-5 w-5 mr-2 text-foreground flex-shrink-0 ml-2" />
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Deficiência */}
          <div
            className={`pt-4 pb-4 cursor-pointer hover:bg-accent/30 rounded-lg px-2 -mx-2 transition-colors ${
              !hasDisability ? 'border-l-4 border-destructive pl-2' : ''
            }`}
            onClick={handleDisabilityClick}
          >
            <div className="flex items-center pb-4 justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground tracking-normal leading-5 font-normal">
                  Você tem alguma deficiência?
                </p>
                <p
                  className={`font-normal ${
                    hasDisability
                      ? 'text-foreground'
                      : 'text-sm md:text-base text-destructive'
                  }`}
                >
                  {hasDisability
                    ? formatDisability(userInfo.deficiencia)
                    : 'Informe se você tem uma deficiência'}
                </p>
              </div>
              <EditIcon className="h-5 w-5 mr-2 text-foreground flex-shrink-0 ml-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sheets */}
      <BottomSheet
        open={genderDrawerOpen}
        onOpenChange={setGenderDrawerOpen}
        title="Gênero"
        showHandle
      >
        <GenderDrawerContent
          currentGender={userInfo.genero}
          onClose={() => setGenderDrawerOpen(false)}
        />
      </BottomSheet>

      <BottomSheet
        open={educationDrawerOpen}
        onOpenChange={setEducationDrawerOpen}
        title="Escolaridade"
        showHandle
      >
        <EducationDrawerContent
          currentEducation={userInfo.escolaridade}
          onClose={() => setEducationDrawerOpen(false)}
        />
      </BottomSheet>

      <BottomSheet
        open={familyIncomeDrawerOpen}
        onOpenChange={setFamilyIncomeDrawerOpen}
        title="Renda familiar"
        showHandle
      >
        <FamilyIncomeDrawerContent
          currentFamilyIncome={userInfo.renda_familiar}
          onClose={() => setFamilyIncomeDrawerOpen(false)}
        />
      </BottomSheet>

      <BottomSheet
        open={disabilityDrawerOpen}
        onOpenChange={setDisabilityDrawerOpen}
        title="Você tem alguma deficiência?"
        showHandle
      >
        <DisabilityDrawerContent
          currentDisability={userInfo.deficiencia}
          onClose={() => setDisabilityDrawerOpen(false)}
        />
      </BottomSheet>
    </div>
  )
}
