import { SecondaryHeader } from '@/app/components/secondary-header'
import { CustomButton } from '@/components/ui/custom/custom-button'
import Link from 'next/link'

export function PetNotFound() {
  return (
    <div className="min-h-screen bg-background max-w-xl mx-auto">
      <SecondaryHeader title="" route="/carteira" className="max-w-xl" />

      <main className="max-w-xl mx-auto px-4 pt-12">
        <div className="flex flex-col items-center justify-center text-center py-12">
          <div className="w-24 h-24 mb-6 rounded-full bg-muted flex items-center justify-center">
            {/* X Icon */}
            <svg
              className="w-12 h-12 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            Pet não encontrado
          </h1>

          <p className="text-muted-foreground mb-8 max-w-sm">
            O pet que você está procurando não existe ou não está cadastrado na
            sua carteira.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <CustomButton
              variant="outline"
              className="border-muted-foreground text-foreground"
            >
              <Link href="/carteira">Voltar para carteira</Link>
            </CustomButton>
          </div>
        </div>
      </main>
    </div>
  )
}
