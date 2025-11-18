'use client'

import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { Check, Copy } from 'lucide-react'
import toast from 'react-hot-toast'

interface CopyableItemProps {
  text: string
  truncate?: boolean
}

export function CopyableItem({ text, truncate = false }: CopyableItemProps) {
  const { copy, isCopied } = useCopyToClipboard()

  const handleCopy = async () => {
    const success = await copy(text)
    if (success) {
      toast.success('Copiado!')
    } else {
      toast.error('Erro ao copiar')
    }
  }

  const textClass = truncate ? 'truncate' : ''

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`flex items-center justify-between bg-card rounded-2xl py-4 px-6 w-full text-left hover:bg-secondary cursor-pointer transition-colors group`}
    >
      <span
        className={`text-foreground pr-4 leading-5 font-normal text-sm ${textClass}`}
      >
        {text}
      </span>
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
