'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'

export default function ProfileError() {
  const router = useRouter()
  const hasHandled = useRef(false)

  useEffect(() => {
    if (hasHandled.current) return
    hasHandled.current = true
    toast.error(
      'Não foi possível acessar o seu perfil. Tente novamente mais tarde.'
    )
    router.replace('/')
  }, [router])

  return null
}
