'use client'

import { cn } from '@/lib/utils'

import { HomeIcon, ServicesIcon, WalletIcon } from '@/assets/icons'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as React from 'react'

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
}

const navItems: NavItem[] = [
  { href: '/', icon: HomeIcon, label: 'Home' },
  { href: '/services', icon: ServicesIcon, label: 'Dashboard' },
  { href: '/wallet', icon: WalletIcon, label: 'Wallet' },
]

export function FloatNavigation() {
  const pathname = usePathname()

  const [open, setOpen] = React.useState(false)

  return (
    <>
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-50">
        <nav className="flex items-center shadow-md justify-center gap-2 rounded-full bg-background px-2 py-2 backdrop-blur-sm">
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
                    isActive ? 'bg-primary' : 'hover:bg-card'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-6 w-6 transition-colors text-foreground',
                      isActive && 'text-background'
                    )}
                  />
                </div>
              </Link>
            )
          })}

          {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
          {/* <div
            onClick={() => setOpen(true)}
            className="group flex cursor-pointer h-12 w-12 items-center justify-center rounded-full bg-card/30 hover:bg-card transition-colors"
          >
            <MessageCircle className="h-6 w-6 text-card-foreground/30 group-hover:text-card-foreground/20" />
          </div> */}
        </nav>
      </div>

      {/* <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title={
          <>
            Você será direcionado <br /> para o Whatsapp da Prefeitura do Rio
          </>
        }
      >
        <BottomSheetFooter>
          <Button
            onClick={() => window.open('https://wa.me/5521991952121', '_blank')}
            className={cn(
              'flex-1 py-5',
              'bg-[#1447E6] hover:bg-[#1447E6]/80 text-white',
              'dark:bg-white dark:hover:bg-white/80 dark:text-black'
            )}
          >
            Confirmar
          </Button>
          <BottomSheetClose asChild>
            <Button
              variant="outline"
              className={cn(
                'flex-1 py-5',
                'bg-white border-2 hover:text-foreground/80 text-foreground',
                'dark:bg-zinc-900 dark:border-2 dark:!border-[#323232] dark:hover:text-white/80 dark:text-white'
              )}
            >
              Cancelar
            </Button>
          </BottomSheetClose>
        </BottomSheetFooter>
      </BottomSheet> */}
    </>
  )
}
