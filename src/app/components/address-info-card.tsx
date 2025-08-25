'use client'

import { deleteUserAddress } from '@/actions/delete-user-address'
import {
  EditIcon,
  MapPinIcon,
  MoreVerticalIcon,
  TrashIcon,
} from '@/assets/icons'
import { Badge } from '@/components/ui/badge'
import { BottomSheet } from '@/components/ui/custom/bottom-sheet'
import { CustomButton } from '@/components/ui/custom/custom-button'
import type { ModelsEnderecoPrincipal } from '@/http/models/modelsEnderecoPrincipal'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface AddressInfoCardProps {
  address: ModelsEnderecoPrincipal
  onEdit?: (address: ModelsEnderecoPrincipal) => void
  onDelete?: (address: ModelsEnderecoPrincipal) => void
  showBadge?: boolean
  badgeText?: string
}

export function AddressInfoCard({
  address,
  onEdit,
  onDelete,
  showBadge = false,
  badgeText = 'Atualizar',
}: AddressInfoCardProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  // Helper to format address string
  let mainLine = 'Endereço não disponível'
  if (address) {
    // Remove trailing comma/space and avoid duplicate number
    const logradouro = address.logradouro || ''
    const numero = address.numero || ''
    const tipo = address.tipo_logradouro || ''
    // Check if logradouro already ends with the number (with or without comma)
    const logradouroTrimmed = logradouro.trim().replace(/,$/, '')
    const numeroTrimmed = numero.trim()
    let showNumero = true
    if (
      numeroTrimmed &&
      logradouroTrimmed.match(new RegExp(`\\b${numeroTrimmed}$`))
    ) {
      showNumero = false
    }
    mainLine =
      `${tipo} ${logradouroTrimmed}${showNumero && numeroTrimmed ? `, ${numeroTrimmed}` : ''}`.trim()
  }
  const complemento = address?.complemento
  const bairroCidade = address
    ? `${address.bairro || ''}${address.bairro && address.municipio ? ', ' : ''}${address.municipio || ''}${address.estado ? `, ${address.estado}` : ''}`.trim()
    : ''

  const handleEdit = () => {
    if (address && onEdit) {
      onEdit(address)
      setOpen(false)
    }
  }

  const handleDelete = async () => {
    if (address) {
      try {
        console.log('Deleting address:', address)
        await deleteUserAddress()
        setOpen(false)
      } catch (error: any) {
        // Redirect to session expired page on any error
        router.push('/sessao-expirada')
      }
    }
  }

  const displayAddress = address ? mainLine : 'Endereço não disponível'

  return (
    <div className="p-4">
      <div
        onClick={() => setOpen(true)}
        className="bg-card rounded-2xl p-4 cursor-pointer hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 pt-1">
            <MapPinIcon className="w-6 h-6 text-card-foreground" />
          </div>

          <div className="flex-1 space-y-1">
            <h2 className="font-medium text-card-foreground text-base">
              {mainLine}
            </h2>
            {complemento && (
              <p className="text-foreground-light text-sm">{complemento}</p>
            )}
            <p className="text-foreground-light text-sm">{bairroCidade}</p>

            {showBadge && (
              <div className="pt-4">
                <Badge
                  variant="destructive"
                  className="px-3 py-0.5 text-sm rounded-full"
                >
                  {badgeText}
                </Badge>
              </div>
            )}
          </div>

          <div className="flex-shrink-0">
            <div className="hover:text-gray-700 transition-colors">
              <MoreVerticalIcon className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title={displayAddress}
        headerClassName="text-center p-0 mb-6"
      >
        <div className="text-center p-4">
          <h2 className="text-md">{displayAddress}</h2>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 max-w-4xl mx-auto">
          <Link href="/meu-perfil/endereco/atualizar-endereco">
            <CustomButton
              variant="primary"
              size="lg"
              icon={EditIcon}
              className="py-6 w-full"
              onClick={handleEdit}
            >
              Editar
            </CustomButton>
          </Link>

          <CustomButton
            variant="secondary"
            size="lg"
            icon={TrashIcon}
            className="py-6"
            onClick={handleDelete}
          >
            Excluir
          </CustomButton>
        </div>
      </BottomSheet>
    </div>
  )
}
