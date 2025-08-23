import { SecondaryHeader } from "@/app/components/secondary-header";
import { AvatarSelector } from "./components/avatar-selector";

export default function AvatarPage() {
  const avatars = {
    data: [
      {
        "id": "1",
        "name": "Avatar 1",
        "url": "https://storage.googleapis.com/rj-escritorio-dev-public/superapp/png/avatars/avatar1.png",
        "is_active": true,
        "created_at": "2025-08-22T10:19:09.942Z"
      },
      {
        "id": "2",
        "name": "Avatar 2",
        "url": "https://storage.googleapis.com/rj-escritorio-dev-public/superapp/png/avatars/avatar2.png",
        "is_active": true,
        "created_at": "2025-08-22T10:18:30.236Z"
      },
      {
        "id": "3",
        "name": "Avatar 3",
        "url": "https://storage.googleapis.com/rj-escritorio-dev-public/superapp/png/avatars/avatar3.png",
        "is_active": true,
        "created_at": "2025-08-22T10:17:40.519Z"
      },
      {
        "id": "4",
        "name": "Avatar 4",
        "url": "https://storage.googleapis.com/rj-escritorio-dev-public/superapp/png/avatars/avatar4.png",
        "is_active": true,
        "created_at": "2025-08-22T09:54:44.859Z"
      },
      {
        "id": "5",
        "name": "Avatar 5",
        "url": "https://storage.googleapis.com/rj-escritorio-dev-public/superapp/png/avatars/avatar5.png",
        "is_active": true,
        "created_at": "2025-08-22T09:54:44.859Z"
      },
      {
        "id": "6",
        "name": "Avatar 6",
        "url": "https://storage.googleapis.com/rj-escritorio-dev-public/superapp/png/avatars/avatar6.png",
        "is_active": true,
        "created_at": "2025-08-22T09:54:44.859Z"
      },
      {
        "id": "7",
        "name": "Avatar 7",
        "url": "https://storage.googleapis.com/rj-escritorio-dev-public/superapp/png/avatars/avatar7.png",
        "is_active": true,
        "created_at": "2025-08-22T09:54:44.859Z"
      },
      {
        "id": "8",
        "name": "Avatar 8",
        "url": "https://storage.googleapis.com/rj-escritorio-dev-public/superapp/png/avatars/avatar8.png",
        "is_active": true,
        "created_at": "2025-08-22T09:54:44.859Z"
      },
      {
        "id": "9",
        "name": "Avatar 9",
        "url": "https://storage.googleapis.com/rj-escritorio-dev-public/superapp/png/avatars/avatar9.png",
        "is_active": true,
        "created_at": "2025-08-22T09:54:44.859Z"
      },
      {
        "id": "10",
        "name": "Avatar 10",
        "url": "https://storage.googleapis.com/rj-escritorio-dev-public/superapp/png/avatars/avatar10.png",
        "is_active": true,
        "created_at": "2025-08-22T09:54:44.859Z"
      },
      {
        "id": "11",
        "name": "Avatar 11",
        "url": "https://storage.googleapis.com/rj-escritorio-dev-public/superapp/png/avatars/avatar11.png",
        "is_active": true,
        "created_at": "2025-08-22T09:54:44.859Z"
      },
      {
        "id": "12",
        "name": "Avatar 12",
        "url": "https://storage.googleapis.com/rj-escritorio-dev-public/superapp/png/avatars/avatar12.png",
        "is_active": true,
        "created_at": "2025-08-22T09:54:44.859Z"
      }
    ],
    "total": 12,
    "page": 1,
    "per_page": 20,
    "total_pages": 1
  };
  
  return (
    <div className="pt-20 pb-4 min-h-lvh max-w-xl mx-auto text-foreground flex flex-col">
      {/* Header */}
      <SecondaryHeader title="Escolha seu avatar" route="/meu-perfil" className="max-w-xl" />
      
      {/* Avatar Grid */}
      <AvatarSelector avatars={avatars.data} />
    </div>
  );
}   