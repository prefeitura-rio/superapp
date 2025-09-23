import { SecondaryHeader } from '@/app/components/secondary-header'
import { PetCard } from '@/app/components/wallet-cards/pet-wallet'
import { ChipIcon } from '@/assets/icons/chip-icon'
import { DogPaw2Icon } from '@/assets/icons/dog-paw2-icon'
import { ScissorsIcon } from '@/assets/icons/scissors-icon'
import { VaccineIcon } from '@/assets/icons/vaccine-icon'
import { getUserInfoFromToken } from '@/lib/user-info'
import { MicroshippingStatusCard } from './components/microchipping-status-card'
import { TutorInfo } from './components/tutor-info'

export default async function HealthCardDetail() {
  const userAuthInfo = await getUserInfoFromToken()

  return (
    <div className="min-h-lvh max-w-xl mx-auto pt-26 pb-10">
      <SecondaryHeader title="Carteira" className="max-w-xl" />
      <div className="z-50">
        <div className="px-4">
          <PetCard enableFlip showInitialShine />
        </div>
        {/* Icons Buttons Row */}
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex flex-row pl-4 gap-3 justify-start mt-8 min-w-max">
            <a
              href="https://protecaoanimal.prefeitura.rio/postos-de-servicos-de-atendimento-medico-veterinario/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center pointer-events-none"
            >
              <div className="rounded-full w-16 h-16 flex justify-center items-center bg-card hover:bg-card hover:text-black transition-colors">
                <DogPaw2Icon className="h-6.5 text-foreground" />
              </div>
              <div className="flex flex-col items-center">
                <span className="mt-2 text-foreground text-sm font-normal">
                  Atendimento
                </span>
                <span className=" text-gray-300 text-xs font-normal">
                  clínico
                </span>
              </div>
            </a>
            <a
              href="https://protecaoanimal.prefeitura.rio/noticias/campanha-de-vacinacao-antirrabica-anual/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center pointer-events-none"
            >
              <div className="rounded-full w-16 h-16 flex justify-center items-center bg-card hover:bg-card hover:text-black transition-colors">
                <VaccineIcon className="h-6.5 text-foreground" />
              </div>
              <div className="flex flex-col items-center">
                <span className="mt-2 text-foreground text-sm font-normal">
                  Vacinação
                </span>
              </div>
            </a>
            <a
              href="https://protecaoanimal.prefeitura.rio/castracao/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center pointer-events-none"
            >
              <div className="rounded-full w-16 h-16 flex justify-center items-center bg-card hover:bg-card hover:text-black transition-colors">
                <ScissorsIcon className="h-6.5 text-foreground" />
              </div>
              <div className="flex flex-col items-center">
                <span className="mt-2 text-foreground text-sm font-normal">
                  Castração
                </span>
              </div>
            </a>
            <a
              href="https://protecaoanimal.prefeitura.rio/microchipagem-animal/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center"
            >
              <div className="rounded-full w-16 h-16 flex justify-center items-center bg-card hover:bg-card hover:text-black transition-colors">
                <ChipIcon className="h-6.5" />
              </div>
              <div className="flex flex-col items-center">
                <span className="mt-2 text-foreground text-sm font-normal">
                  Microchip
                </span>
              </div>
            </a>
          </div>
        </div>
      </div>

      <div className="mt-6 mb-8">
        <MicroshippingStatusCard />
      </div>

      <div className="px-4">
        <h3>Informação dos Tutores</h3>
      </div>

      <TutorInfo
        name="José Rangel Azevedo"
        cpf="398.765.432-60"
        phone="(21) 99876 5432"
        email="joserangel@gmail.com"
      />
    </div>
  )
}
