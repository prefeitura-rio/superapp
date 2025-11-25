'use client'

import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { Check, ChevronDown, ChevronUp, Copy, MapPin } from 'lucide-react'
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

  const handleCopy = async () => {
    const success = await copy(address)
    if (success) {
      toast.success('Copiado!')
    } else {
      toast.error('Erro ao copiar')
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-3 bg-card/50 rounded-xl p-3 w-full text-left hover:bg-card/80 transition-colors group"
    >
      {/* Pin icon muted */}
      <div className="flex-shrink-0 -ml-2">
        <MapPin className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Address text */}
      <span className="text-sm text-foreground flex-1 pr-3">{address}</span>

      {/* Copy/Check icon */}
      <div className="flex-shrink-0">
        {isCopied ? (
          <Check className="w-4 h-4 text-green-600 animate-in zoom-in-50 duration-200" />
        ) : (
          <Copy className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        )}
      </div>
    </button>
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
    const handleCopy = async () => {
      const success = await copy(addresses[0])
      if (success) {
        toast.success('Copiado!')
      } else {
        toast.error('Erro ao copiar')
      }
    }

    return (
      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center gap-4 bg-card rounded-2xl p-4 w-full cursor-pointer hover:bg-card/80 transition-colors focus:outline-none group"
      >
        <div className="flex-shrink-0 text-foreground">
          <MapPin className="w-5 h-5 text-foreground-light" />
        </div>

        <div className="flex flex-col flex-1 min-w-0 items-start">
          <span className="text-xs font-normal text-foreground-light">
            Endereço
          </span>
          <span className="text-sm text-primary font-normal leading-5 tracking-normal">
            {addresses[0]}
          </span>
        </div>

        <div className="flex-shrink-0">
          {isCopied ? (
            <Check className="w-5 h-5 text-green-600 animate-in zoom-in-50 duration-200" />
          ) : (
            <Copy className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          )}
        </div>
      </button>
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
