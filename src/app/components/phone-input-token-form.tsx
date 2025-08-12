'use client'

import { updateUserPhone } from '@/actions/update-user-phone'
import { Button } from '@/components/ui/button'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'

interface PhoneInputTokenFormProps {
  value: string
  onChange: (value: string) => void
  resendParams?: {
    ddd: string
    ddi: string
    valor: string
  }
  error?: string | null
}

export default function PhoneInputTokenForm({
  value,
  onChange,
  resendParams,
  error,
}: PhoneInputTokenFormProps) {
  const [timer, setTimer] = useState(60)
  const [isResending, setIsResending] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (timer === 0 && intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (timer > 0 && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => (prev > 0 ? prev - 1 : 0))
      }, 1000)
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [timer])

  // Reset timer when component mounts (after first server action)
  useEffect(() => {
    setTimer(60)
  }, [])

  async function handleResend() {
    if (!resendParams) return
    setIsResending(true)
    await updateUserPhone({
      valor: resendParams.valor,
      ddd: resendParams.ddd,
      ddi: resendParams.ddi,
    })
    toast.success('Token reenviado!')
    setTimer(60)
    setIsResending(false)
  }

  return (
    <>
      <form className="w-full flex flex-col gap-4 items-start">
        <InputOTP
          className="w-full"
          maxLength={6}
          value={value}
          onChange={onChange}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
          </InputOTPGroup>
          <InputOTPGroup>
            <InputOTPSlot index={1} />
          </InputOTPGroup>
          <InputOTPGroup>
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPGroup>
            <InputOTPSlot index={3} />
          </InputOTPGroup>
          <InputOTPGroup>
            <InputOTPSlot index={4} />
          </InputOTPGroup>
          <InputOTPGroup>
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <div>
          <span className="text-sm text-card-foreground mt-1 block text-left">
            Não recebeu o código?
            <Button
              className={`pl-2 font-normal ${timer === 0 ? 'text-primary' : 'text-muted-foreground'}`}
              variant="link"
              onClick={handleResend}
              disabled={timer > 0 || isResending}
            >
              {isResending ? 'Reenviando...' : 'Reenviar'}
            </Button>
          </span>
          <span className="text-sm text-muted-foreground block text-left">
            {timer > 0
              ? `Você pode solicitar outro código em ${timer}s`
              : 'Você pode solicitar outro código'}
          </span>
          {error && <p className="text-destructive text-sm mt-4">{error}</p>}
        </div>
      </form>
    </>
  )
}
