'use client'

import { EditIcon, LogoutIcon, UserIcon, XIcon } from '@/assets/icons'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { buildGlobalMenu } from '@/constants/global-menu'
import { buildAuthUrl } from '@/constants/url'
import { useHeaderData } from '@/hooks/use-header-data'
import { useLogout } from '@/hooks/use-logout'
import { formatCpf } from '@/lib/format-cpf'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

const rowClassName =
  'flex w-full items-center gap-4 border-b border-border py-5 text-left text-base font-normal text-foreground transition-colors hover:bg-secondary/60'

interface GlobalMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GlobalMenu({ open, onOpenChange }: GlobalMenuProps) {
  const { data } = useHeaderData()
  const { isLoggedIn, userName, userCpf, userAvatarUrl, userAvatarName } = data

  const entries = useMemo(() => buildGlobalMenu(isLoggedIn), [isLoggedIn])
  const close = () => onOpenChange(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-0 left-0 h-dvh w-screen max-w-none translate-x-0 translate-y-0 gap-0 rounded-none border-0 bg-global-menu-header p-0 shadow-none data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100 sm:max-w-none"
      >
        <DialogTitle className="sr-only">Menu</DialogTitle>

        <div className="flex h-dvh flex-col">
          <div className="mx-auto w-full max-w-4xl shrink-0 px-4">
            <div className="flex items-center justify-between py-4">
              {isLoggedIn ? (
                <span />
              ) : (
                <a
                  href={buildAuthUrl('/')}
                  className="rounded-full bg-white/10 px-4 py-2.5 text-sm text-white transition-colors hover:bg-white/20"
                >
                  Faça seu login
                </a>
              )}

              <button
                type="button"
                onClick={close}
                className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
              >
                <XIcon className="h-5 w-5 text-white" />
                <span className="sr-only">Fechar menu</span>
              </button>
            </div>

            {isLoggedIn && (
              <Link
                href="/meu-perfil"
                onClick={close}
                className="flex items-center gap-4 pb-6"
              >
                <div className="relative">
                  <Avatar className="h-16 w-16 border-2 border-white/20 bg-card">
                    {userAvatarUrl ? (
                      <AvatarImage
                        src={userAvatarUrl}
                        alt={userAvatarName || 'Avatar do usuário'}
                      />
                    ) : null}
                    <AvatarFallback className="bg-background">
                      <UserIcon className="h-5 w-5 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute -right-0.5 -bottom-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-global-menu-accent">
                    <EditIcon className="h-3.5 w-3.5 text-white" />
                  </span>
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xl text-white">{userName}</p>
                  <p className="text-sm text-white/60">{formatCpf(userCpf)}</p>
                </div>
              </Link>
            )}
          </div>

          <div className="mx-auto min-h-0 w-full max-w-4xl flex-1 overflow-y-auto rounded-t-3xl bg-background">
            <nav className="px-4">
              <Accordion type="multiple">
                {entries.map(entry =>
                  entry.kind === 'link' ? (
                    <Link
                      key={entry.id}
                      href={entry.href ?? '#'}
                      onClick={close}
                      className={rowClassName}
                    >
                      {entry.icon}
                      {entry.label}
                    </Link>
                  ) : (
                    <AccordionItem key={entry.id} value={entry.id}>
                      <AccordionTrigger
                        className={cn(rowClassName, 'hover:no-underline')}
                        chevronClassName="size-5 shrink-0 translate-y-0 text-primary"
                      >
                        <span className="flex items-center gap-4">
                          {entry.icon}
                          {entry.label}
                        </span>
                      </AccordionTrigger>

                      <AccordionContent className="pb-0">
                        {entry.items.map(item => (
                          <Link
                            key={item.id}
                            href={item.href ?? '#'}
                            onClick={close}
                            className={cn(rowClassName, 'pl-10')}
                          >
                            {item.label}
                          </Link>
                        ))}
                        {entry.id === 'outros' && <ThemeToggleRow />}
                      </AccordionContent>
                    </AccordionItem>
                  )
                )}
              </Accordion>

              {isLoggedIn && <LogoutRow />}
            </nav>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ThemeToggleRow() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <div
      className={cn(rowClassName, 'justify-between pl-10 hover:bg-transparent')}
    >
      <label htmlFor="global-menu-theme" className="cursor-pointer select-none">
        Tema claro
      </label>
      <Switch
        id="global-menu-theme"
        className="large-switch"
        checked={mounted ? theme === 'light' : true}
        onCheckedChange={checked => setTheme(checked ? 'light' : 'dark')}
      />
    </div>
  )
}

function LogoutRow() {
  const { logout, isLoading } = useLogout()

  return (
    <button
      type="button"
      onClick={logout}
      disabled={isLoading}
      className={cn(
        rowClassName,
        'cursor-pointer border-b-0 disabled:opacity-50'
      )}
    >
      <LogoutIcon className="h-6 w-6 shrink-0 text-foreground" />
      Sair
    </button>
  )
}
