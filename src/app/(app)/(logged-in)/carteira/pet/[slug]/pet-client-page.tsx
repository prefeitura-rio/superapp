import { MicroshippingStatusCard } from '@/app/(app)/(logged-in)/carteira/pet/components/microchipping-status-card'
import { TutorInfo } from '@/app/(app)/(logged-in)/carteira/pet/components/tutor-info'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { PetCard } from '@/app/components/wallet-cards/pet-wallet'
import { ChipIcon } from '@/assets/icons/chip-icon'
import { DogPaw2Icon } from '@/assets/icons/dog-paw2-icon'
import { ScissorsIcon } from '@/assets/icons/scissors-icon'
import { VaccineIcon } from '@/assets/icons/vaccine-icon'
import type { ModelsPet } from '@/http/models'

interface PetClientPageProps {
  pet: ModelsPet
  petClinicName: string
  petHasMicrochip: boolean
  tutorInfoObj?: {
    name: string
    cpf: string
    phone: string
    email: string
  }
}

const SMPDA_ATENDIMENTO_URL =
  'https://protecaoanimal.prefeitura.rio/postos-de-servicos-de-atendimento-medico-veterinario/'
const SMPDA_VACINACAO_URL =
  'https://protecaoanimal.prefeitura.rio/noticias/campanha-de-vacinacao-antirrabica-anual/'
const SMPDA_CASTRACAO_URL = 'https://protecaoanimal.prefeitura.rio/castracao/'
const SMPDA_MICROCHIP_URL =
  'https://protecaoanimal.prefeitura.rio/microchipagem-animal/'

export function PetClientPage({
  pet,
  petClinicName,
  petHasMicrochip,
  tutorInfoObj,
}: PetClientPageProps) {
  const showCastracao = pet.indicador_castrado !== true
  const showMicrochipActions = !petHasMicrochip

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
            petData={pet}
            enableFlip
            showInitialShine
          />
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <div className="flex flex-row pl-4 gap-3 justify-start mt-8 min-w-max">
            <a
              href={SMPDA_ATENDIMENTO_URL}
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
                <span className="text-gray-300 text-xs font-normal">
                  clínico
                </span>
              </div>
            </a>

            <a
              href={SMPDA_VACINACAO_URL}
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

            {showCastracao && (
              <a
                href={SMPDA_CASTRACAO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center"
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

            {showMicrochipActions && (
              <a
                href={SMPDA_MICROCHIP_URL}
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

      {showMicrochipActions && (
        <div className="mt-6 mb-2">
          <MicroshippingStatusCard href={SMPDA_MICROCHIP_URL} />
        </div>
      )}

      <div className="px-4 mt-6">
        <h3>Informação dos Tutores</h3>
      </div>

      <div className="mb-8">
        <TutorInfo
          name={tutorInfoObj?.name ?? ''}
          cpf={tutorInfoObj?.cpf ?? ''}
          phone={tutorInfoObj?.phone ?? ''}
          email={tutorInfoObj?.email ?? ''}
        />
      </div>
    </div>
  )
}
