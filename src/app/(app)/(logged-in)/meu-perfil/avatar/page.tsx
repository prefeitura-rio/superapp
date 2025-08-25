import { SecondaryHeader } from "@/app/components/secondary-header";
import { getV1Avatars, getV1CitizenCpfAvatar } from "@/http/avatars/avatars";
import type { ModelsAvatarsListResponse } from "@/http/models";
import { getUserInfoFromToken } from "@/lib/user-info";
import { AvatarSelector } from "./components/avatar-selector";

// Revalidate this page when needed
export const revalidate = 0;

export default async function AvatarPage() {
  const userInfo = await getUserInfoFromToken();
  
  let avatars: ModelsAvatarsListResponse = { data: [], total: 0, page: 1, per_page: 12, total_pages: 0 };
  let currentUserAvatar: string | null = null;
  let error = null;

  try {
    // Fetch available avatars
    const avatarsResponse = await getV1Avatars();
    if (avatarsResponse.status === 200) {
      avatars = avatarsResponse.data;
    } else {
      error = "Erro ao carregar avatares";
    }

    // Fetch user's current avatar if avatars were loaded successfully
    if (!error && userInfo.cpf) {
      try {
        const userAvatarResponse = await getV1CitizenCpfAvatar(userInfo.cpf);
        if (userAvatarResponse.status === 200 && userAvatarResponse.data.avatar_id) {
          currentUserAvatar = userAvatarResponse.data.avatar_id;
        }
        console.log(userAvatarResponse.data)
      } catch (avatarErr) {
        // Silently fail for current avatar - not critical
        console.log("Could not fetch current user avatar:", avatarErr);
      }
    }
  } catch (err) {
    error = "Erro ao carregar avatares";
    console.error("Error fetching avatars:", err);
  }

  if (error) {
    return (
      <div className="pt-20 pb-4 min-h-lvh max-w-xl mx-auto text-foreground flex flex-col">
        <SecondaryHeader title="Escolha seu avatar" route="/meu-perfil" className="max-w-xl" />
        <div className="px-4 mt-6 text-center">
          <p className="text-destructive">{error}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Tente novamente mais tarde
          </p>
        </div>
      </div>
    );
  }

  // Filter out inactive avatars, ensure required fields exist, and only show Avatar 1-12
  const availableAvatars = avatars.data?.filter(avatar => 
    avatar.is_active && 
    avatar.id && 
    avatar.url && 
    avatar.name &&
    /^Avatar (1[0-2]|[1-9])$/.test(avatar.name)
  ) || [];

  if (availableAvatars.length === 0) {
    return (
      <div className="pt-20 pb-4 min-h-lvh max-w-xl mx-auto text-foreground flex flex-col">
        <SecondaryHeader title="Escolha seu avatar" route="/meu-perfil" className="max-w-xl" />
        <div className="px-4 mt-6 text-center">
          <p className="text-muted-foreground">Nenhum avatar disponível no momento</p>
          <p className="text-sm text-muted-foreground mt-2">
            Tente novamente mais tarde
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="pt-20 pb-4 min-h-lvh max-w-xl mx-auto text-foreground flex flex-col">
      {/* Header */}
      <SecondaryHeader title="Escolha seu avatar" route="/meu-perfil" className="max-w-xl" />
      
      {/* Avatar Grid */}
      <AvatarSelector 
        avatars={availableAvatars} 
        currentAvatarId={currentUserAvatar}
      />
    </div>
  );
}   