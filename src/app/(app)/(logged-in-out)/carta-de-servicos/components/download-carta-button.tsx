'use client'

import { DownloadIcon } from '@/assets/icons/download-icon'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { type MouseEvent, useState } from 'react'
import toast from 'react-hot-toast'

/**
 * O PDF nasce no servidor e leva alguns segundos nos órgãos grandes. Com JS, o botão
 * baixa via fetch para mostrar o "gerando" e tratar erro; sem JS, o `<a download>`
 * continua funcionando sozinho.
 */
export function DownloadCartaButton({
  href,
  fileName,
}: {
  href: string
  fileName: string
}) {
  const [loading, setLoading] = useState(false)

  async function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    if (loading) return
    setLoading(true)

    try {
      const response = await fetch(href)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 30_000)
    } catch (error) {
      console.error('[carta-de-servicos] falha no download', error)
      toast.error('Não foi possível gerar o documento. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <a
      href={href}
      download={fileName}
      onClick={handleClick}
      aria-busy={loading}
      className={cn(
        'flex w-full items-center justify-between gap-4 rounded-2xl bg-primary px-4 py-4 text-sm leading-5 text-primary-foreground transition-colors',
        'hover:bg-primary-focused active:bg-primary-focused focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        loading && 'pointer-events-none bg-primary-focused'
      )}
    >
      <span>{loading ? 'Gerando documento…' : 'Baixar documento'}</span>
      {loading ? (
        <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden />
      ) : (
        <DownloadIcon
          className="h-5 w-5 shrink-0 text-primary-foreground"
          aria-hidden
        />
      )}
    </a>
  )
}
