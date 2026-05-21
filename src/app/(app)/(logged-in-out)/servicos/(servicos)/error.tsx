'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'

export default function ServicosError() {
  const router = useRouter()
  const hasHandled = useRef(false)

  useEffect(() => {
    if (hasHandled.current) return
    hasHandled.current = true
    toast.error('Verifique a sua conexão')
    router.replace('/')
  }, [router])

  return null
}
