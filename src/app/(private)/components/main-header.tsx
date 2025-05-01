'use client'

import { Badge } from '@/components/ui/badge'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { cn } from '@/lib/utils'
import { Bell, Search, User } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface Notification {
  id: string
  message: string
  time: string
  read: boolean
}

export default function MainHeader() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      message: 'Prefeitura esta buscando um Marceneiro com o seu perfil!',
      time: '2 horas atrás',
      read: false,
    },
    {
      id: '2',
      message: 'Amanhã chega seu novo cartão do JAÉ',
      time: '15 horas atrás',
      read: false,
    },
    {
      id: '3',
      message: 'Não se esqueça de tirar o lixo da coleta seletiva',
      time: '2 dias atrás',
      read: true,
    },
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <header className="bg-background text-white px-4 py-3">
      <div className="mx-auto flex max-w-md items-center justify-between">
        <Link href="/user-profile" className="rounded-full bg-zinc-800 p-2">
          <User className="h-5 w-5" />
          {/* <span className="sr-only">User Settings</span> */}
        </Link>

        <div className="flex items-center space-x-4">
          <Link href="/search" className="p-1">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Link>

          <Drawer>
            <DrawerTrigger asChild>
              <div className="relative p-1 cursor-pointer">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-medium text-white">
                    {unreadCount}
                  </span>
                )}
                <span className="sr-only">Notifications</span>
              </div>
            </DrawerTrigger>
            <DrawerContent className="max-h-[85vh]">
              <div className="mx-auto w-full max-w-md">
                <DrawerHeader className="border-b px-4 py-3">
                  <DrawerTitle className="flex items-center">
                    Notificações
                    {unreadCount > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-2 bg-blue-600 text-white"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </DrawerTitle>
                </DrawerHeader>
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'px-4 py-3 relative',
                        !notification.read && 'font-medium'
                      )}
                    >
                      {!notification.read && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-blue-600 ml-1" />
                      )}
                      <p>{notification.message}</p>
                      <p className="text-sm text-blue-600 mt-1">
                        {notification.time}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </header>
  )
}
