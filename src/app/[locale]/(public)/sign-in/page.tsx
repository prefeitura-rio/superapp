'use client'

import Image from 'next/image'
import { v4 as uuidv4 } from 'uuid'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

import govbr from '@/assets/govbr.svg'
import prefeitura from '@/assets/prefeitura.svg'
import { Button } from '@/components/ui/button'

export default function LoginScreen() {
  const t = useTranslations('auth')
  const tPrivacy = useTranslations('privacy')
  
  const handleGovbrLogin = () => {
    const state = uuidv4()
    const scope = `${encodeURIComponent('openid+profile+address+phone+roles')}`
    const redirectUri = process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_REDIRECT_URI
    const clientId = process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_CLIENT_ID
    const idCariocaBaseUrl = process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL

    if (!redirectUri || !clientId || !idCariocaBaseUrl) {
      console.error('Missing environment variables for GovBR login')
      return
    }

    window.location.href = `${idCariocaBaseUrl}/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}`
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
          <h1 className="text-2xl text-foreground font-semibold">{t('signIn')}</h1>
          <p className="text-sm text-gray-400 font-normal">
            {t('loginMessage')}
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
              {t('accessWith')}
            </span>
            <Image src={govbr} alt="Gov br" width={64} height={25} />
          </span>
        </Button>

        {/* Privacy */}
        <div className="w-full text-center">
          <Link href="/privacy-policy" className="text-xs text-gray-100">
            {tPrivacy('title')}
          </Link>
        </div>
      </div>
    </div>
  )
}
