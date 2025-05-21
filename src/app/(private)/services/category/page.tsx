import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type React from 'react'

export default function CategoryPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container max-w-md mx-auto p-4">
        <h1 className="text-xl font-semibold py-4">IPTU</h1>
        <Separator className="bg-zinc-800" />

        <nav className="flex flex-col">
          <MenuItem href="/iptu/payment">
            <span>Pagamento de IPTU</span>
            <Badge
              variant="outline"
              className="bg-orange-600 text-white border-none text-xs"
            >
              desconto no PIX
            </Badge>
          </MenuItem>

          <MenuItem href="/iptu/certificate">
            <span>Certidão de situação fiscal e enfitêutica</span>
            <Badge
              variant="outline"
              className="bg-blue-500 text-white border-none text-xs"
            >
              novo
            </Badge>
          </MenuItem>

          <MenuItem href="/iptu/previous-years">
            <span>Pagamento de IPTU dos anos anteriores</span>
          </MenuItem>

          <MenuItem href="/iptu/installments">
            <span>Parcelamento e emissão de boletos (DARM)</span>
          </MenuItem>

          <MenuItem href="/iptu/property-info">
            <span>Certidão de elementos cadastrais do imóvel</span>
          </MenuItem>

          <MenuItem href="/iptu/active-debt" disabled>
            <span>Dívida ativa consultar débitos de...</span>
            <Badge
              variant="outline"
              className="bg-zinc-700 text-white border-none text-xs"
            >
              em breve
            </Badge>
          </MenuItem>
        </nav>
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
      <div className="flex items-center gap-2 flex-1">{children}</div>
      <ChevronRight className="h-5 w-5 text-blue-500" />
    </div>
  )

  return (
    <>
      {disabled ? (
        <div className="cursor-not-allowed">{content}</div>
      ) : (
        <Link href={href} className="hover:bg-zinc-900 transition-colors">
          {content}
        </Link>
      )}
      <Separator className="bg-zinc-800" />
    </>
  )
}
