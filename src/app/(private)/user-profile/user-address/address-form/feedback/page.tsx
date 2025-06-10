"use client"

import welcomeImage from '@/assets/welcome.svg'
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from 'next/link'

export default function UpdatedAddressFeedback() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-evenly bg-background px-4">
      <h1 className="text-4xl font-medium leading-10 text-center mb-6">Endereço <br/>atualizado!</h1>
      <Image
        src={welcomeImage}
        alt="Endereço atualizado"
        width={260}
        height={320}
        className="mx-auto mb-10"
        style={{ objectFit: 'contain', maxHeight: '320px' }}
        priority
      />
      <Button
        asChild
        size="lg"
        className="w-full max-w-xs mt-8 bg-primary hover:bg-primary/90 rounded-lg font-normal"
      >
        <Link href="/user-profile/user-address">Finalizar</Link>
      </Button>
    </div>
  )
}
