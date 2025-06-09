"use client"

import welcomeImage from '@/assets/welcome.svg'
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Image from "next/image"

export function EmptyAddress() {
  return (
    <div className="flex flex-col items-center justify-center py-4 px-6 text-center">
      {/* Empty state icon */}
      {/* <div className="w-32 h-32 bg-gray-200 rounded-full mb-8 flex items-center justify-center"> */}
      <Image
            src={welcomeImage}
            alt="Mensagem de sem endereço"
            width={250}
            height={250}
            style={{ objectFit: 'contain' }}
            priority
            />
        {/* </div> */}
      {/* Empty state message */}
      <h3 className="text-lg font-medium text-gray-900 my-10 max-w-xs px-4">Não há nenhum endereço cadastrado</h3>

      {/* Add button */}
      <Button
        size="lg"
        className="bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center gap-2"
        onClick={() => {
        }}
      >
        <Plus className="w-4 h-4" />
        Adicionar
      </Button>
    </div>
  )
}
