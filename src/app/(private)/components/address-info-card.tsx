"use client"

import { deleteUserAddress } from "@/actions/delete-user-address"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import type { ModelsEnderecoPrincipal } from "@/http/models/modelsEnderecoPrincipal"
import { MapPin, MoreVertical, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface AddressInfoCardProps {
  address: ModelsEnderecoPrincipal | null
  onEdit?: (address: ModelsEnderecoPrincipal) => void
  onDelete?: (address: ModelsEnderecoPrincipal) => void
}

export function AddressInfoCard({ address, onEdit, onDelete }: AddressInfoCardProps) {
  const [open, setOpen] = useState(false)

  // Helper to format address string
  let mainLine = "Endereço não disponível"
  if (address) {
    // Remove trailing comma/space and avoid duplicate number
    const logradouro = address.logradouro || ""
    const numero = address.numero || ""
    const tipo = address.tipo_logradouro || ""
    // Check if logradouro already ends with the number (with or without comma)
    const logradouroTrimmed = logradouro.trim().replace(/,$/, "")
    const numeroTrimmed = numero.trim()
    let showNumero = true
    if (numeroTrimmed && logradouroTrimmed.match(new RegExp(`\\b${numeroTrimmed}$`))) {
      showNumero = false
    }
    mainLine = `${tipo} ${logradouroTrimmed}${showNumero && numeroTrimmed ? ", " + numeroTrimmed : ""}`.trim()
  }
  const complemento = address?.complemento
  const bairroCidade = address
    ? `${address.bairro || ""}${address.bairro && address.municipio ? ", " : ""}${address.municipio || ""}${address.estado ? ", " + address.estado : ""}`.trim()
    : ""

  const handleEdit = () => {
    if (address && onEdit) {
      onEdit(address)
      setOpen(false)
    }
  }

  const handleDelete = async () => {
    if (address) {
      console.log("Deleting address:", address)
      await deleteUserAddress();
      setOpen(false);
    }
  }

  const displayAddress = address ? mainLine : "Endereço não disponível"

  return (
    <div className="min-h-screen p-4">
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <div className="bg-card rounded-2xl p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 pt-1">
                <MapPin className="w-6 h-6 text-gray-600" />
              </div>

              <div className="flex-1 space-y-1">
                <h2 className="font-medium text-card-foreground text-base">{mainLine}</h2>
                {complemento && <p className="text-foreground-light text-sm">{complemento}</p>}
                <p className="text-foreground-light text-sm">{bairroCidade}</p>

                <div className="pt-4">
                  <Badge variant="destructive" className="px-3 py-0.5 text-sm rounded-full">
                    Desatualizado
                  </Badge>
                </div>
              </div>

              <div className="flex-shrink-0">
                <div className="hover:text-gray-700 transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </DrawerTrigger>
        <DrawerContent className="px-4 max-w-md mx-auto pb-6 pt-4 !rounded-t-3xl">
          <div className="mx-auto w-12 h-1.5 bg-muted mb-6 rounded-full" />
          <DrawerHeader className="text-center p-0 mb-6">
            <DrawerTitle>{displayAddress}</DrawerTitle>
          </DrawerHeader>
          <div className="grid w-full px-10 grid-cols-2 gap-4 max-w-md mx-auto">
            <Button size="lg" asChild className="flex items-center justify-center gap-2 py-6" onClick={handleEdit}>
              <Link href={`/user-profile/user-address/address-form`}>
              <Pencil className="w-5 h-5" />
              Editar
              </Link>
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="flex items-center justify-center gap-2 py-6"
              onClick={handleDelete}
            >
              <Trash2 className="w-5 h-5" />
              Excluir
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
