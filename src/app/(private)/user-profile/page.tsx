import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { formatCpf } from '@/lib/format-cpf';
import { getUserInfoFromToken } from '@/lib/user-info';
import {
  CheckCircle,
  MapIcon,
  Settings,
  User
} from 'lucide-react';
import { LogoutButton } from '../components/logout-button';
import { MenuItem } from '../components/menu-item';
import { SecondaryHeader } from '../components/secondary-header';

export default async function ProfilePage() {

  const userInfo = await getUserInfoFromToken();

  return (
    <div className="pt-20 max-w-md mx-auto text-foreground flex flex-col">
      {/* Header */}
      <SecondaryHeader title="Perfil" />

      {/* Profile Info */}
      <div className="flex flex-col items-center mt-6 mb-10">
        <Avatar className="h-24 w-24 mb-4 border-2 border-border">
          <AvatarFallback className="bg-background">
            <User className="h-6 w-6 text-primary" />
          </AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-semibold mb-1">{userInfo.name}</h2>
        <p className="text-sm text-primary">{formatCpf(userInfo.cpf)}</p>
      </div>

      {/* Menu Items */}
      <div className="flex-1 px-5">
        <nav className="space-y-1">
          <MenuItem
            icon={<User className="h-5 w-5" />}
            label="Informações pessoais"
            href="/user-profile/user-personal-info"
            isFirst={true}
          />
          {/* <MenuItem
            icon={<Briefcase className="h-5 w-5" />}
            label="Trabalho"
            href="/user-profile/user-job-info"
          /> */}
          <MenuItem
            icon={<MapIcon className="h-5 w-5" />}
            label="Endereço"
            href="/user-profile/user-address"
          />
          <MenuItem
            icon={<CheckCircle className="h-5 w-5" />}
            label="Autorizações"
            href="/user-profile/user-authorizations"
          />
          <MenuItem
            icon={<Settings className="h-5 w-5" />}
            label="Configurações"
            href="/user-profile/user-settings"
          />

          <LogoutButton />
        </nav>
      </div>
    </div>
  )
}

