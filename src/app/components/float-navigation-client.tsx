'use client'

import { cn } from '@/lib/utils'

import { ServicesIcon, WalletIcon } from '@/assets/icons'
import { Home2Icon } from '@/assets/icons/home2-icon'
import { usePathname } from 'next/navigation'
import { NavigationLink } from './navigation-link'

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
}

interface FloatNavigationClientProps {
  walletUrl: string
}

export function FloatNavigationClient({
  walletUrl,
}: FloatNavigationClientProps) {
  const pathname = usePathname()

  // Create navigation items with the correct wallet URL
  const navItems: NavItem[] = [
    { href: '/', icon: Home2Icon, label: 'Home' },
    { href: '/servicos', icon: ServicesIcon, label: 'Servicos' },
    { href: walletUrl, icon: WalletIcon, label: 'Carteira' },
  ]

  return (
    <>
      <div className="w-full fixed bottom-0 left-1/2 -translate-x-1/2 z-50">
        <nav className="flex items-center shadow-float-navigation justify-center gap-5 bg-background px-2 py-2 backdrop-blur-sm">
          {navItems.map(item => {
            // Special case: wallet button should be active on both wallet routes
            const isActive =
              pathname === item.href ||
              (item.label === 'Carteira' &&
                (pathname === '/carteira' ||
                  pathname === '/autenticacao-necessaria/carteira'))
            const Icon = item.icon

            return (
              <NavigationLink key={item.href} item={item} isActive={isActive}>
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      'flex h-14 w-14 items-center justify-center rounded-2xl transition-colors',
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
                  <p
                    className={cn(
                      'text-sm leading-5 font-normal tracking-normal transition-opacity duration-150 text-primary',
                      isActive ? 'opacity-100' : 'opacity-0'
                    )}
                  >
                    {item.label}
                  </p>
                </div>
              </NavigationLink>
            )
          })}
        </nav>
      </div>
    </>
  )
}
