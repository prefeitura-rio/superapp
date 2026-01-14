'use client'

import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { MeiDataItem } from './mei-data-item'
import type { MeiCompanyFullData, MeiCompanyStatus } from './types'

interface MeiCompanyDetailsProps {
  data: MeiCompanyFullData
}

function StatusBadge({ status }: { status: MeiCompanyStatus }) {
  const isActive = status === 'Ativa'
  return (
    <Badge
      className={
        isActive ? 'bg-success text-white' : 'bg-destructive text-white'
      }
    >
      {status}
    </Badge>
  )
}

export function MeiCompanyDetails({ data }: MeiCompanyDetailsProps) {
  const router = useRouter()
  const formattedPhone =
    data.telefone.ddd && data.telefone.valor
      ? `(${data.telefone.ddd}) ${data.telefone.valor}`
      : 'Não informado'

  const handlePhoneEdit = () => {
    const returnUrl = '/servicos/mei/meu-mei'
    router.push(
      `/meu-perfil/informacoes-pessoais/atualizar-telefone?returnUrl=${encodeURIComponent(returnUrl)}`
    )
  }

  const handleEmailEdit = () => {
    const returnUrl = '/servicos/mei/meu-mei'
    router.push(
      `/meu-perfil/informacoes-pessoais/atualizar-email?returnUrl=${encodeURIComponent(returnUrl)}`
    )
  }

  // Format CNAE with code and description (only add separator if description exists)
  const formatCnae = (cnae: { codigo: string; descricao: string }) => {
    if (cnae.descricao) {
      return `${cnae.codigo} – ${cnae.descricao}`
    }
    return cnae.codigo
  }

  // Get all secondary CNAEs as array of formatted strings
  const secondaryCnaes = data.cnaesSecundarios.map(formatCnae)

  return (
    <div className="flex flex-col">
      {/* Header with company name */}
      <h1 className="text-2xl font-medium text-foreground leading-tight mb-4">
        {data.razaoSocial}
      </h1>

      {/* Status badge */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm text-foreground-light">
          Situação cadastral
        </span>
        <StatusBadge status={data.situacaoCadastral} />
      </div>

      {/* Data items */}
      <div className="flex flex-col">
        <MeiDataItem label="CNPJ" value={data.cnpj} />

        {data.nomeFantasia && (
          <MeiDataItem label="Nome fantasia" value={data.nomeFantasia} />
        )}

        <MeiDataItem
          label="Celular"
          value={formattedPhone}
          showInfo
          showEdit
          infoTitle="Celular"
          infoContent="Esse número de telefone será usado apenas no PrefRio. Ele não altera seu celular cadastrado no registro formal de sua empresa."
          onEditClick={handlePhoneEdit}
        />

        <MeiDataItem
          label="E-mail"
          value={data.email || 'Não informado'}
          showInfo
          showEdit
          infoTitle="E-mail"
          infoContent="Esse email será usado apenas no PrefRio. Ele não altera seu email cadastrado no registro formal de sua empresa."
          onEditClick={handleEmailEdit}
        />

        <MeiDataItem
          label="Natureza jurídica"
          value={data.naturezaJuridica}
        />

        <MeiDataItem
          label="CNAE principal"
          value={formatCnae(data.cnaePrincipal)}
        />

        {secondaryCnaes.length > 0 && (
          <MeiDataItem
            label="CNAE secundário"
            value={secondaryCnaes}
          />
        )}
      </div>
    </div>
  )
}
