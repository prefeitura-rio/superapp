import { PetCard } from '@/app/components/wallet-cards/pet-wallet'
import { getCitizenCpfPets } from '@/http/citizen/citizen'
import { getUserInfoFromToken } from '@/lib/user-info'

export default async function PetsCardsDetail() {
  const userAuthInfo = await getUserInfoFromToken()
  const petsResponse = await getCitizenCpfPets(userAuthInfo.cpf)

  const pets =
    petsResponse.status === 200 &&
    'data' in petsResponse.data &&
    Array.isArray(petsResponse.data.data)
      ? petsResponse.data.data
      : []

  if (pets.length === 0) {
    return (
      <div className="min-h-lvh max-w-xl mx-auto pb-10">
        <div className="px-4 flex items-center justify-center py-16">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">
              Nenhum pet cadastrado ainda
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-lvh max-w-xl mx-auto pb-10">
      <div className="z-50">
        <div className="px-4 flex flex-col gap-4">
          {pets.map(pet => (
            <PetCard
              key={pet.id_animal}
              petData={{ ...pet }}
              enableFlip={false}
              asLink
              showInitialShine
              href={`/carteira/pet/${pet.id_animal}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
