import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type React from 'react'
import { SecondaryHeader } from '../../components/secondary-header'

export default function CategoryPage() {
  return (
    <div className="max-w-md mx-auto pt-24 flex flex-col space-y-6">
      <SecondaryHeader title="Categorias de Serviços" />
      <div className="min-h-screen text-white">
        <div className="max-w-md mx-auto px-5 pt-4 pb-20">
          <h1 className="text-xl font-semibold pb-4 text-foreground">IPTU</h1>
          <Separator className="bg-zinc-800" />

          <nav className="flex flex-col">
            <MenuItem href="/iptu/payment">
              <span className="text-card-foreground">Pagamento de IPTU</span>
              <Badge
                variant="outline"
                className="bg-orange-600 text-card border-none text-xs"
              >
                desconto no PIX
              </Badge>
            </MenuItem>

            <MenuItem href="/iptu/certificate">
              <span className="text-card-foreground">
                Certidão de situação fiscal e enfitêutica
              </span>
              <Badge
                variant="outline"
                className="bg-primary text-white border-none text-xs"
              >
                novo
              </Badge>
            </MenuItem>

            <MenuItem href="/iptu/previous-years">
              <span className="text-card-foreground">
                Pagamento de IPTU dos anos anteriores
              </span>
            </MenuItem>
            <MenuItem href="/iptu/previous-years">
              <span className="text-card-foreground">
                Parcelamento e emissão de boletos (DARM)
              </span>
            </MenuItem>
            <MenuItem href="/iptu/previous-years">
              <span className="text-card-foreground">
                Pagamento de IPTU dos anos anteriores
              </span>
            </MenuItem>
            <MenuItem href="/iptu/previous-years">
              <span className="text-card-foreground">
                Certidão de elementos cadastrais do imóvel
              </span>
            </MenuItem>
            <MenuItem href="/iptu/active-debt" disabled>
              <span className="text-card-foreground/20">
                Dívida ativa consultar débitos de...
              </span>
              <Badge
                variant="outline"
                className="bg-terciary text-card-foreground border-none text-xs"
              >
                em breve
              </Badge>
            </MenuItem>
          </nav>
        </div>
      </div>
    </div>
  )
}

interface MenuItemProps {
  href: string
  children: React.ReactNode
  disabled?: boolean
}

function MenuItem({ href, children, disabled = false }: MenuItemProps) {
  const content = (
    <div
      className={`flex items-center justify-between py-5 ${disabled ? 'opacity-70' : ''}`}
    >
      <div className="flex items-center justify-between flex-1 pr-4">
        {children}
      </div>
      <ChevronRight className="h-5 w-5 text-primary" />
    </div>
  )

  return (
    <>
      {disabled ? (
        <div className="cursor-not-allowed">{content}</div>
      ) : (
        <Link href={href} className="hover:brightness-90 transition-colors">
          {content}
        </Link>
      )}
      <Separator className="bg-zinc-800" />
    </>
  )
}
