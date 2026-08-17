'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'

/**
 * Diferente do error boundary da raiz do módulo, que devolve o cidadão para `/servicos`:
 * uma falha aqui dentro é falha de um serviço específico, então o retorno natural é a
 * landing do módulo, de onde ele consegue tentar outro caminho.
 */
export default function MeusImoveisError() {
  const router = useRouter()
  const hasHandled = useRef(false)

  useEffect(() => {
    if (hasHandled.current) return
    hasHandled.current = true
    toast.error('Não foi possível carregar seus imóveis. Tente novamente.')
    router.replace('/divida-ativa')
  }, [router])

  return null
}
