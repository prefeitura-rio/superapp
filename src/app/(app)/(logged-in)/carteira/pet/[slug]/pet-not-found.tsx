import { SecondaryHeader } from '@/app/components/secondary-header'
import petsEmptyImage from '@/assets/dog-pet.svg'
import { CustomButton } from '@/components/ui/custom/custom-button'
import Image from 'next/image'
import Link from 'next/link'

export function PetNotFound() {
  return (
    <div className="min-h-screen bg-background max-w-xl mx-auto">
      <SecondaryHeader title="" route="/carteira" className="max-w-xl" />

      <main className="max-w-xl pt-20 mx-auto px-4 pb-10">
        <div className="flex flex-col items-center pt-6">
          <Image
            src={petsEmptyImage}
            alt=""
            width={112}
            height={200}
            className="object-contain"
            priority
          />

          <div className="mt-4 px-4 text-left w-full">
            <h2 className="text-3xl font-medium text-foreground leading-9">
              Pet não encontrado
            </h2>

            <p className="mt-2 text-sm font-normal text-muted-foreground leading-5">
              O pet que você está procurando não existe ou não está cadastrado na
              sua carteira.
            </p>

            <div className="mt-6">
              <CustomButton
                size="xl"
                fullWidth
 className="rounded-full"              >
                <Link href="/carteira?pets=true">Voltar para carteira</Link>
              </CustomButton>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
