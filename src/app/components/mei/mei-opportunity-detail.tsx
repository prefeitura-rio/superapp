'use client'

import { CalendarIcon, InfoIcon, MapPinIcon } from '@/assets/icons'
import { ClockIcon } from '@/assets/icons/clock-icon'
import { DepartmentIcon } from '@/assets/icons/department-icon'
import { Home2Icon } from '@/assets/icons/home2-icon'
import { WalletIcon } from '@/assets/icons/wallet-icon'
import { buildAuthUrl } from '@/constants/url'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'

import type { MeiAttachment } from './attachment-gallery'
import { AttachmentGallery } from './attachment-gallery'
import { ImageGalleryModal } from './image-gallery-modal'
import { MeiOpportunityHeader } from './mei-opportunity-header'
import { QuickInfoItem } from './quick-info-item'
import { MEI_LINKS } from '@/constants/mei-links'
import { deleteProposal } from './actions/delete-proposal'
import { hasCompatibleCnae } from '@/lib/mei-utils'
import toast from 'react-hot-toast'
import { CancelProposalDrawer } from './cancel-proposal-drawer'
import { ProposalStatusBadge } from './proposal-status-badge'
import {
  ServiceTypeDrawer,
  type UserMeiContext,
} from './service-type-drawer'

export interface MeiOpportunityDetailData {
  id: number
  slug: string
  title: string
  expiresAt: string
  coverImage?: string
  serviceType: string
  description: string
  organization: {
    name: string
    logo?: string
  }
  location: {
    name: string
    address: string
  }
  payment: {
    method: string
    deadline: string
  }
  executionDeadline: string
  attachments: MeiAttachment[]
  cnaeIds?: string[]
}

interface MeiOpportunityDetailClientProps {
  opportunity: MeiOpportunityDetailData
  userMeiContext: UserMeiContext
  userProposal?: { id: string; status: string } | null
}

function formatExpirationTime(expiresAt: string): string {
  const now = new Date()
  const expirationDate = new Date(expiresAt)
  const diffMs = expirationDate.getTime() - now.getTime()

  if (diffMs <= 0) {
    return 'Expirado'
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) {
    return `${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`
  }

  return `${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
}

export function MeiOpportunityDetailClient({
  opportunity,
  userMeiContext,
  userProposal,
}: MeiOpportunityDetailClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const loginUrl = buildAuthUrl(`/servicos/mei/${opportunity.slug}`)

  const [isServiceTypeDrawerOpen, setIsServiceTypeDrawerOpen] = useState(false)
  const [isCancelDrawerOpen, setIsCancelDrawerOpen] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  const handleEditProposal = () => {
    if (!userProposal) return
    // Apenas propostas com status 'submitted' podem ser editadas
    if (userProposal.status === 'submitted') {
      router.push(`/servicos/mei/${opportunity.slug}/proposta?mode=edit`)
    }
  }

  const handleCancelProposal = async () => {
    if (!userProposal) return

    setIsCancelling(true)
    try {
      const result = await deleteProposal(opportunity.id, userProposal.id)
      if (result.success) {
        toast.success('Proposta cancelada')
        setIsCancelDrawerOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || 'Erro ao cancelar proposta')
      }
    } catch (error) {
      toast.error('Erro ao cancelar proposta')
    } finally {
      setIsCancelling(false)
    }
  }

  const isGalleryOpen = searchParams.get('gallery') === 'true'
  const currentImageIndex = Number.parseInt(
    searchParams.get('image') || '0',
    10
  )

  const openGallery = useCallback(
    (index: number) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('gallery', 'true')
      params.set('image', index.toString())
      router.push(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const closeGallery = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('gallery')
    params.delete('image')
    const queryString = params.toString()
    router.push(queryString ? `?${queryString}` : window.location.pathname, {
      scroll: false,
    })
  }, [router, searchParams])

  const navigateGallery = useCallback(
    (index: number) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('image', index.toString())
      router.push(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  // Mapeia status da API para o tipo do badge
  const getProposalBadgeStatus = (
    apiStatus: string
  ): 'submitted' | 'approved' | 'rejected' => {
    if (apiStatus === 'approved') return 'approved'
    if (apiStatus === 'rejected') return 'rejected'
    return 'submitted'
  }

  const ActionButton = () => {
    const buttonClasses =
      'block w-full py-3 text-center rounded-full bg-primary text-background hover:brightness-90 transition text-sm'

    // Se já tem proposta, não mostrar botão
    if (userProposal) {
      return null
    }

    const { isLoggedIn, hasMei, situacaoCadastral, userCnaes } = userMeiContext

    // 1. Não logado → Login
    if (!isLoggedIn) {
      return (
        <Link href={loginUrl} className={buttonClasses}>
          Fazer login para enviar proposta
        </Link>
      )
    }

    // 2. Sem MEI → Redireciona direto para site de abertura
    if (!hasMei) {
      return (
        <a
          href={MEI_LINKS.REGISTRATION}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses}
        >
          Abrir MEI para enviar proposta
        </a>
      )
    }

    // 3. Situação irregular → Redireciona para regularização
    if (situacaoCadastral && situacaoCadastral !== 'Ativa') {
      return (
        <a
          href={MEI_LINKS.REGULARIZATION}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses}
        >
          Regularizar situação para enviar proposta
        </a>
      )
    }

    // 4. CNAE incompatível → Abre drawer explicando
    if (opportunity.cnaeIds?.length && userCnaes?.length) {
      const isCompatible = hasCompatibleCnae(userCnaes, opportunity.cnaeIds)
      if (!isCompatible) {
        return (
          <button
            type="button"
            onClick={() => setIsServiceTypeDrawerOpen(true)}
            className={buttonClasses}
          >
            Enviar proposta
          </button>
        )
      }
    }

    // 5. Tudo OK → Enviar proposta normalmente
    return (
      <Link
        href={`/servicos/mei/${opportunity.slug}/proposta`}
        className={buttonClasses}
      >
        Enviar proposta
      </Link>
    )
  }

  return (
    <div className="flex flex-col items-center pb-20">
      <div className="w-full max-w-3xl">
        <MeiOpportunityHeader
          title={opportunity.title}
          coverImage={opportunity.coverImage}
          showEditButton={!!userProposal && userProposal.status === 'submitted'}
          showDeleteButton={!!userProposal && userProposal.status === 'submitted'}
          onEditClick={handleEditProposal}
          onDeleteClick={() => setIsCancelDrawerOpen(true)}
        />

        <div className="px-4 py-4 flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => setIsServiceTypeDrawerOpen(true)}
              className="flex items-center gap-2 hover:opacity-70 transition-opacity"
            >
              <span className="text-sm text-foreground-light">
                Tipo de serviço
              </span>
              <InfoIcon className="w-4 h-4 text-foreground-light" />
            </button>
            <span className="text-sm text-foreground">
              {opportunity.serviceType}
            </span>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="text-sm text-foreground-light">Expira em</span>
            <span className="text-sm font-medium text-foreground">
              {formatExpirationTime(opportunity.expiresAt)}
            </span>
          </div>
        </div>

        <ServiceTypeDrawer
          open={isServiceTypeDrawerOpen}
          onOpenChange={setIsServiceTypeDrawerOpen}
          opportunityCnaeIds={opportunity.cnaeIds}
          userContext={userMeiContext}
        />

        {/* Status da proposta - aparece antes das informações */}
        {userProposal && (
          <div className="px-4 pb-4">
            <ProposalStatusBadge
              status={getProposalBadgeStatus(userProposal.status)}
              deadlineDate={
                userProposal.status === 'approved'
                  ? opportunity.executionDeadline
                  : undefined
              }
            />
          </div>
        )}

        <div className="px-4 pb-6">
          <p className="text-sm text-foreground-light whitespace-pre-line leading-relaxed">
            {opportunity.description}
          </p>
        </div>

        {/* Botão de ação - não aparece se já tem proposta */}
        {!userProposal && (
          <div className="px-4 pb-6">
            <ActionButton />
          </div>
        )}

        <div className="px-4 space-y-4 pb-6">
          <QuickInfoItem
            icon={DepartmentIcon}
            label="Órgão"
            value={opportunity.organization.name}
          />
          <QuickInfoItem
            icon={Home2Icon}
            label="Local"
            value={opportunity.location.name}
          />
          <QuickInfoItem
            icon={MapPinIcon}
            label="Endereço"
            value={opportunity.location.address}
          />
          <QuickInfoItem
            icon={WalletIcon}
            label="Forma de pagamento"
            value={opportunity.payment.method}
          />
          <QuickInfoItem
            icon={ClockIcon}
            label="Prazo de pagamento"
            value={opportunity.payment.deadline}
          />
          <QuickInfoItem
            icon={CalendarIcon}
            label="Data limite para execução do serviço"
            value={opportunity.executionDeadline}
          />
        </div>

        <div className="py-6">
          <AttachmentGallery
            attachments={opportunity.attachments}
            onImageClick={openGallery}
          />
        </div>

        <ImageGalleryModal
          attachments={opportunity.attachments}
          currentIndex={currentImageIndex}
          isOpen={isGalleryOpen}
          onClose={closeGallery}
          onNavigate={navigateGallery}
        />

        <CancelProposalDrawer
          open={isCancelDrawerOpen}
          onOpenChange={setIsCancelDrawerOpen}
          onConfirm={handleCancelProposal}
          isPending={isCancelling}
        />
      </div>
    </div>
  )
}
