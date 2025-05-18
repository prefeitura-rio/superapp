'use client'

import Image from 'next/image'
import Link from 'next/link'

import govbr from '@/assets/govbr.svg'
import prefeitura from '@/assets/prefeitura.svg'
import { Button } from '@/components/ui/button'

export default function LoginScreen() {
  const handleGovbrLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_GOVBR_URL}/auth?client_id=${process.env.NEXT_PUBLIC_GOVBR_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_GOVBR_REDIRECT_URI}&response_type=code&scope=openid
    `
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background text-white p-4">
      <div className="flex flex-col items-start gap-6">
        {/* Logo */}
        <div className="w-full flex justify-center">
          <Image src={prefeitura} alt="Prefeitura RIO" width={87} height={45} />
        </div>

        {/* Login Header */}
        <div className="space-y-1">
          <h1 className="text-2xl text-foreground font-semibold">Login</h1>
          <p className="text-sm text-gray-400 font-normal">
            Faça login com a sua conta Gov.br para acessar os serviços da
            <br />
            Prefeitura do Rio de Janeiro.
          </p>
        </div>

        {/* Gov.br Button */}
        <Button
          variant="default"
          className="w-full h-12 rounded-full bg-gray-200 hover:bg-zinc-700 text-foreground cursor-pointer"
          onClick={handleGovbrLogin}
        >
          <span className="flex items-center justify-center w-full">
            <span className="pr-2 text-foreground font-medium">
              Acessar com
            </span>
            <Image src={govbr} alt="Gov br" width={64} height={25} />
          </span>
        </Button>

        {/* Privacy */}
        <div className="w-full text-center">
          <Link href="/privacy-policy" className="text-xs text-gray-100">
            Aviso de privacidade
          </Link>
        </div>
      </div>
    </div>
  )
}
