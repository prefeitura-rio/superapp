import { MicroshippingStatusCard } from '@/app/(app)/(logged-in)/carteira/pet/components/microchipping-status-card'
import { TutorInfo } from '@/app/(app)/(logged-in)/carteira/pet/components/tutor-info'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { PetCard } from '@/app/components/wallet-cards/pet-wallet'
import { ChipIcon } from '@/assets/icons/chip-icon'
import { DogPaw2Icon } from '@/assets/icons/dog-paw2-icon'
import { ScissorsIcon } from '@/assets/icons/scissors-icon'
import { VaccineIcon } from '@/assets/icons/vaccine-icon'

interface PetClientPageProps {
  pet: any
  petClinicName: string
  petHasMicrochip: boolean
  tutorInfoObj?: {
    name: string
    cpf: string
    phone: string
    email: string
  }
}

export function PetClientPage({
  pet,
  petClinicName,
  petHasMicrochip,
  tutorInfoObj,
}: PetClientPageProps) {
  return (
    <div className="min-h-lvh max-w-xl mx-auto pb-10">
      <SecondaryHeader
        title="Carteira"
        route="/carteira"
        className="max-w-xl"
      />
      <div className="pt-25">
        <div className="px-4 flex flex-col gap-4">
          <PetCard
            key={pet.id_animal}
            petData={{ ...pet }}
            enableFlip
            showInitialShine
          />
        </div>
        {/* Icons Buttons Row */}
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex flex-row pl-4 gap-3 justify-start mt-8 min-w-max">
            <a
              href="https://protecaoanimal.prefeitura.rio/postos-de-servicos-de-atendimento-medico-veterinario/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center"
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
              className="flex flex-col items-center"
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
            {!petHasMicrochip && (
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
            )}
            {!petHasMicrochip && (
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
            )}
          </div>
        </div>
      </div>

      {!petHasMicrochip && (
        <div className="mt-6 mb-2">
          <MicroshippingStatusCard />
        </div>
      )}

      <div className="px-4 mt-6">
        <h3>Informação dos Tutores</h3>
      </div>

      <div className="mb-8">
        <TutorInfo
          name={tutorInfoObj?.name!}
          cpf={tutorInfoObj?.cpf!}
          phone={tutorInfoObj?.phone!}
          email={tutorInfoObj?.email!}
        />
      </div>
    </div>
  )
}
