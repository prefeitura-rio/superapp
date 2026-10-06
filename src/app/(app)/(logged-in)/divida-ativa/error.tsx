'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'

export default function DividaAtivaError() {
  const router = useRouter()
  const hasHandled = useRef(false)

  useEffect(() => {
    if (hasHandled.current) return
    hasHandled.current = true
    toast.error('Ops... tente novamente mais tarde.')
    router.replace('/servicos')
  }, [router])

  return null
}
