'use client'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { cn } from '@/lib/utils'
import { Home, LayoutGrid, MessageCircle, Wallet } from 'lucide-react'
import { useTheme } from 'next-themes'
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
  const { theme } = useTheme()
  const [open, setOpen] = React.useState(false)

  const getConfirmBtnClass = () => {
    return theme === 'dark'
      ? 'bg-white hover:bg-white/80 text-black'
      : 'bg-[#1447E6] hover:bg-[#1447E6]/80 text-white'
  }

  const getCloseBtnClass = () => {
    return theme === 'dark'
      ? 'bg-zinc-900 border-2 !border-[#323232] hover:text-white/80 text-white'
      : 'bg-white border-2 hover:text-foreground/80 text-foreground'
  }

  return (
    <>
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-50">
        <nav className="flex items-center justify-center gap-3 rounded-full bg-background px-4 py-3 backdrop-blur-sm">
          {navItems.map(item => {
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
                    isActive ? 'bg-card' : 'bg-card/30 hover:bg-card'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-6 w-6 transition-colors',
                      isActive
                        ? 'text-card-foreground'
                        : 'text-card-foreground/30 group-hover:text-card-foreground/20'
                    )}
                  />
                </div>
              </Link>
            )
          })}

          {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
          <div
            onClick={() => setOpen(true)}
            className="group flex cursor-pointer h-12 w-12 items-center justify-center rounded-full bg-card/30 hover:bg-card transition-colors"
          >
            <MessageCircle className="h-6 w-6 text-card-foreground/30 group-hover:text-card-foreground/20" />
          </div>
        </nav>
      </div>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="p-4 max-w-md! mx-auto rounded-t-3xl!">
          <div className="mx-auto mb-4 h-1 w-6 rounded-full bg-[#323232]" />
          <DrawerHeader className="text-center px-4">
            <DrawerTitle className="text-md">
              Você será direcionado <br /> para o Whatsapp da Prefeitura do Rio
            </DrawerTitle>
          </DrawerHeader>
          <DrawerFooter className="flex-row gap-3  pb-10 px-4 md:px-10">
            <Button
              onClick={() =>
                window.open('https://wa.me/5521991952121', '_blank')
              }
              className={cn('flex-1 py-5', getConfirmBtnClass())}
            >
              Confirmar
            </Button>
            <DrawerClose asChild>
              <Button
                variant="outline"
                className={cn('flex-1 py-5', getCloseBtnClass())}
              >
                Cancelar
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}
