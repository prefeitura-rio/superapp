'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'

export default function ConfirmInscriptionError() {
  const router = useRouter()
  const hasHandled = useRef(false)

  useEffect(() => {
    if (hasHandled.current) return
    hasHandled.current = true
    toast.error('Ops... tente novamente mais tarde.')
    router.replace('/servicos/cursos')
  }, [router])

  return null
}
