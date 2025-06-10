"use client"

import welcomeImage from '@/assets/welcome.svg'
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Image from "next/image"
import Link from 'next/link'

export function EmptyAddress() {
  return (
    <div style={{ height: 'calc(100vh - 100px)' }} className="flex max-h-[80vh] flex-col overflow-hidden items-center justify-between py-8 px-6 text-center">
      {/* Centered image */}
      <div className="flex-1 flex items-center justify-center w-full min-h-0">
        <Image
          src={welcomeImage}
          alt="Mensagem de sem endereço"
          width={250}
          height={250}
          style={{ objectFit: 'contain', maxHeight: '40vh' }}
          priority
        />
      </div>
      {/* Bottom section with heading and button */}
      <div className="w-full flex flex-col items-center mb-8">
        <h3 className="text-lg font-medium text-card-foreground my-2 leading-5 max-w-xs px-4">Não há nenhum endereço cadastrado</h3>
        <Button
          asChild
          size="lg"
          className="bg-primary hover:bg-primary/90 rounded-lg flex items-center gap-2 mt-4"
          onClick={() => {
          }}
        >
          <Link href={`/user-profile/user-address/address-form`}>
          <Plus className="w-4 h-4" />
          Adicionar
          </Link>
        </Button>
      </div>
    </div>
  )
}
