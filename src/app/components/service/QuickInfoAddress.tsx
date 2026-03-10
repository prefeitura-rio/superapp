'use client'

import { AddressLink } from '@/components/ui/custom/address-link'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { buildGoogleMapsUrl } from '@/lib/google-maps-utils'
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  MapPin,
} from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface QuickInfoAddressProps {
  addresses: string[]
}

interface AddressItemProps {
  address: string
}

function AddressItem({ address }: AddressItemProps) {
  const { copy, isCopied } = useCopyToClipboard()
  const mapsUrl = buildGoogleMapsUrl(address)

  const handleCopy = async () => {
    const success = await copy(address)
    if (success) {
      toast.success('Copiado!')
    } else {
      toast.error('Erro ao copiar')
    }
  }

  const handleOpenMaps = () => {
    if (mapsUrl) {
      window.open(mapsUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="flex items-center gap-3 bg-card/50 rounded-xl p-3 w-full hover:bg-card/80 transition-colors group">
      {/* Pin icon - decorativo */}
      <div className="flex-shrink-0 -ml-2">
        <MapPin className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Endereço com link para Maps */}
      <AddressLink
        address={address}
        className="flex-1 pr-3 text-sm text-foreground hover:underline"
      >
        <span>{address}</span>
      </AddressLink>

      {mapsUrl && (
        <button
          type="button"
          onClick={handleOpenMaps}
          className="flex-shrink-0 p-1 hover:bg-card rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Abrir no Google Maps"
        >
          <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
        </button>
      )}

      <button
        type="button"
        onClick={handleCopy}
        className="flex-shrink-0 p-1 hover:bg-card rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Copiar endereço"
      >
        {isCopied ? (
          <Check className="w-4 h-4 text-green-600 animate-in zoom-in-50 duration-200" />
        ) : (
          <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
        )}
      </button>
    </div>
  )
}

export function QuickInfoAddress({ addresses }: QuickInfoAddressProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { copy, isCopied } = useCopyToClipboard()

  // If no addresses, don't render anything
  if (!addresses || addresses.length === 0) {
    return null
  }

  // Single address - show with copy functionality
  if (addresses.length === 1) {
    const mapsUrl = buildGoogleMapsUrl(addresses[0])

    const handleCopy = async () => {
      const success = await copy(addresses[0])
      if (success) {
        toast.success('Copiado!')
      } else {
        toast.error('Erro ao copiar')
      }
    }

    const handleOpenMaps = () => {
      if (mapsUrl) {
        window.open(mapsUrl, '_blank', 'noopener,noreferrer')
      }
    }

    return (
      <div className="flex items-center gap-4 bg-card rounded-2xl p-4 w-full hover:bg-card/80 transition-colors group">
        <div className="flex-shrink-0 text-foreground">
          <MapPin className="w-5 h-5 text-foreground-light" />
        </div>

        <AddressLink
          address={addresses[0]}
          className="flex flex-col flex-1 min-w-0 items-start"
        >
          <span className="text-xs font-normal text-foreground-light">
            Endereço
          </span>
          <span className="text-sm text-primary font-normal leading-5 tracking-normal text-left group-hover:underline">
            {addresses[0]}
          </span>
        </AddressLink>

        {mapsUrl && (
          <button
            type="button"
            onClick={handleOpenMaps}
            className="flex-shrink-0 p-2 hover:bg-background/50 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Abrir no Google Maps"
          >
            <ExternalLink className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
          </button>
        )}

        {/* Botão Copy isolado */}
        <button
          type="button"
          onClick={handleCopy}
          className="flex-shrink-0 p-2 hover:bg-background/50 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Copiar endereço"
        >
          {isCopied ? (
            <Check className="w-5 h-5 text-green-600 animate-in zoom-in-50 duration-200" />
          ) : (
            <Copy className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
          )}
        </button>
      </div>
    )
  }

  // Multiple addresses - show expandable list
  return (
    <div className="bg-card rounded-2xl p-4 w-full">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-4 w-full focus:outline-none cursor-pointer"
      >
        <div className="flex-shrink-0 text-foreground">
          <MapPin className="w-5 h-5 text-foreground-light" />
        </div>

        <div className="flex flex-col flex-1 min-w-0 text-left">
          <span className="text-xs text-foreground-light">Endereços</span>
          <span className="text-sm text-primary font-normal leading-5">
            {isExpanded
              ? 'Clique aqui para recolher'
              : 'Clique aqui para visualizar'}
          </span>
        </div>

        <div className="flex-shrink-0 text-foreground-light transition-transform duration-200">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-2 animate-in slide-in-from-top-2 fade-in duration-200">
          {addresses.map((address, index) => (
            <AddressItem key={index} address={address} />
          ))}
        </div>
      )}
    </div>
  )
}
