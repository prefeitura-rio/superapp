'use client'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { cn } from '@/lib/utils'
import { Home, LayoutGrid, MessageCircle, Wallet } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as React from 'react'

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
}

const navItems: NavItem[] = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/services', icon: LayoutGrid, label: 'Dashboard' },
  { href: '/wallet', icon: Wallet, label: 'Wallet' },
]

export function FloatNavigation() {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-50">
        <nav className="flex items-center justify-center gap-3 rounded-full bg-background px-4 py-3 backdrop-blur-sm">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center justify-center"
                aria-label={item.label}
              >
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full transition-colors',
                    isActive
                      ? 'bg-muted'
                      : 'bg-muted/30 hover:bg-muted'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-6 w-6 transition-colors',
                      isActive
                        ? 'text-card-foreground'
                        : 'text-card-foreground/30 group-hover:text-white'
                    )}
                  />
                </div>
              </Link>
            )
          })}

          {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
          <div
            onClick={() => setOpen(true)}
            className="group flex cursor-pointer h-12 w-12 items-center justify-center rounded-full bg-muted/30 hover:bg-muted transition-colors"
          >
            <MessageCircle className="h-6 w-6 text-gray-400 group-hover:text-white" />
          </div>
        </nav>
      </div>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="p-6 pt-0">
          <div className="mx-auto mb-4 mt-2 h-1.5 w-12 rounded-full bg-muted" />
          <DrawerHeader>
            <DrawerTitle>Você será direcionado</DrawerTitle>
            <DrawerDescription>
              para o Whatsapp da Prefeitura do Rio
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="flex justify-end gap-2">
            <Button
              onClick={() =>
                window.open('https://wa.me/552100000000', '_blank')
              }
              className="bg-blue-900 text-white"
            >
              Confirmar
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}
