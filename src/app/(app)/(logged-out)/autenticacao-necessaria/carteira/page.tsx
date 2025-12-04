import { FloatNavigation } from '@/app/components/float-navigation'
// import authReqWalletCards from '@/assets/auth-req-wallet-cards.png'
import govbrLogo from '@/assets/govbr.svg'
import { buildAuthUrl } from '@/constants/url'
import Image from 'next/image'
import Link from 'next/link'

const authReqWalletCardsPng = '/carteira-deslogada.png'

export default async function WalletAuthenticationRequired() {
  // Build auth URL that will redirect back to /carteira after login
  const authUrlWithReturn = buildAuthUrl('/carteira')
  return (
    <>
      <main className="flex max-w-xl mx-auto min-h-lvh flex-col bg-background text-foreground pb-32">
        {/* Header */}
        <div className="px-4 pt-8 pb-4">
          <h1 className="text-lg font-medium text-foreground">Carteira</h1>
        </div>

        {/* Main Content */}
        <div className="flex flex-col justify-center space-y-4">
          {/* Title and Description */}
          <div className="px-4 text-left space-y-2">
            <h2 className="text-4xl font-medium text-foreground leading-10 text-spacing-4 tracking-tight">
              Informações para você em um só lugar
            </h2>
            <p className="text-sm text-foreground-light leading-5">
              CadÚnico, Clínica da Família, Educação de Jovens e Adultos e
              Cuidados com a Cidade
            </p>
          </div>

          {/* Wallet Cards Image - Overflowing */}
          <div className="relative w-full overflow-hidden">
            <div className="flex justify-center">
              <Image
                src={authReqWalletCardsPng}
                alt="Cartões da carteira digital"
                width={800}
                height={300}
                className="w-[160%] max-w-none h-48 object-contain "
                priority
              />
            </div>
          </div>

          {/* Gov.br Login Section */}
          <div className="px-4 w-full space-y-2">
            <p className="text-center text-sm text-muted-foreground font-normal">
              Entre com a sua conta gov.br
            </p>

            {/* Gov.br Button - Figma Specs */}
            <div className="flex justify-center pb-2">
              <Link
                href={authUrlWithReturn}
                className="flex w-[216px] h-[55px] px-6 py-4 justify-center items-center gap-3 rounded-2xl bg-card-gov transition-colors"
              >
                <Image
                  src={govbrLogo}
                  alt="Gov.br"
                  width={80}
                  height={30}
                  className="object-contain"
                />
              </Link>
            </div>

            {/* Create Account Link */}
            <div className="text-center">
              <Link
                href={authUrlWithReturn}
                className="text-sm text-foreground-light font-normal"
              >
                Crie uma conta
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Float Navigation */}
      <FloatNavigation />
    </>
  )
}
