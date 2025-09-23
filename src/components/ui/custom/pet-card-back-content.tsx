'use client'

interface PetCardBackContentProps {
  birthDate?: string
  castrated?: string
  registrationDate?: string
  communityAnimal?: string
  breed?: string
}

export function PetCardBackContent({
  birthDate,
  castrated,
  registrationDate,
  communityAnimal,
  breed,
}: PetCardBackContentProps) {
  return (
    <div className="h-[140px]">
      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
        <div>
          <span className="text-xs text-[#2A2D32] opacity-70 block">
            Data de Nascimento
          </span>
          <span className="text-sm text-[#2A2D32] block leading-5">
            {birthDate || 'Não disponível'}
          </span>
        </div>
        <div>
          <span className="text-xs text-[#2A2D32] opacity-70 block">
            Castrado
          </span>
          <span className="text-sm text-[#2A2D32] block leading-5">
            {castrated || 'Não disponível'}
          </span>
        </div>

        <div>
          <span className="text-xs text-[#2A2D32] opacity-70 block">
            Data do Registro
          </span>
          <span className="text-sm text-[#2A2D32] block leading-5">
            {registrationDate || 'Não disponível'}
          </span>
        </div>
        <div>
          <span className="text-xs text-[#2A2D32] opacity-70 block">
            Animal Comunitário
          </span>
          <span className="text-sm text-[#2A2D32] block leading-5">
            {communityAnimal || 'Não disponível'}
          </span>
        </div>
      </div>

      <div className="mt-2">
        <span className="text-xs text-[#2A2D32] opacity-70 block">Raça</span>
        <span className="text-sm text-[#2A2D32] block leading-5">
          {breed || 'Não disponível'}
        </span>
      </div>
    </div>
  )
}
