// import authReqWalletCards from '@/assets/auth-req-wallet-cards.png'
import Image from 'next/image'
import { SearchButton } from './search-button'

const authReqWalletCardsPng =
  'https://storage.googleapis.com/rj-escritorio-dev-public/superapp/png/carteira/carteira-deslogada.png'

export default function EmptyWallet() {
  return (
    <>
      {/* Main Content */}
      <main className="flex max-w-xl mx-auto min-h-lvh flex-col bg-background text-foreground">
        {/* Header */}
        <div className="px-4 sm:px-0 flex items-start justify-between pt-6 pb-3">
          <h2 className="relative text-2xl font-bold bg-background z-10 text-foreground">
            Carteira
          </h2>

          <SearchButton />
        </div>

        {/* Main Content */}
        <div className="flex flex-col justify-center space-y-4">
          {/* Title and Description */}
          <div className="px-4 sm:px-0 text-left space-y-2">
            <h2 className="text-4xl font-medium text-foreground leading-10 text-spacing-4 tracking-tight">
              Sem informação disponível.
            </h2>
            <p className="text-sm text-foreground-light leading-5 pb-6">
              Mantenha sempre os seus dados atualizados para acessar a sua
              carteira digital.
            </p>
          </div>

          {/* Wallet Cards Image - Overflowing */}
          <div className="relative w-full overflow-hidden">
            <div className=" flex justify-center">
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
          {/* <div className="px-4 w-full space-y-2">
            <div className="flex justify-center pt-2">
              <Button
                asChild
                size="lg"
                className="h-14 w-36.5 bg-primary hover:bg-primary/90 rounded-full flex items-center gap-2 mt-4 text-background"
              >
                <Link href={'/'}>
                  <Undo2 className="w-5 h-5 text-background" />
                  Voltar ao app
                </Link>
              </Button>
            </div>
          </div> */}
        </div>
      </main>
    </>
  )
}
