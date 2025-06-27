import { SecondaryHeader } from '../components/secondary-header'

interface NotificationProps {
  message: string
  timeAgo: string
  isUnread?: boolean
}

const notifications: NotificationProps[] = [
  {
    message: 'A Prefeitura está buscando um Marceneiro com o seu perfil!',
    timeAgo: '2 horas atrás',
    isUnread: true,
  },
  {
    message: 'Seu endereço precisa ser atualizado',
    timeAgo: '15 horas atrás',
    isUnread: true,
  },
  {
    message: 'Não se esqueça de atualizar seu celular',
    timeAgo: '2 dias atrás',
    isUnread: false,
  },
  {
    message: 'Atualização de email pendente',
    timeAgo: '4 dias atrás',
    isUnread: false,
  },
]

function NotificationItem({
  message,
  timeAgo,
  isUnread = false,
}: NotificationProps) {
  return (
    <div
      className={`flex items-start justify-between gap-4 p-4 py-6 w-full ${isUnread ? 'bg-input' : ''}`}
    >
      <div className="space-y-1">
        <p className="text-base font-medium text-white">{message}</p>
        <p className="text-sm text-primary">{timeAgo}</p>
      </div>
      {isUnread && (
        <div className="mt-1.5 h-2 w-2 min-w-2 min-h-2 flex-shrink-0 aspect-square rounded-full bg-primary" />
      )}
    </div>
  )
}

export default function Notifications() {
  return (
    <div className="max-w-md min-h-lvh mx-auto pt-24 flex flex-col">
      <SecondaryHeader title="Notificações" />

      {notifications.map((notification, index) => (
        <NotificationItem key={index} {...notification} />
      ))}
    </div>
  )
}
