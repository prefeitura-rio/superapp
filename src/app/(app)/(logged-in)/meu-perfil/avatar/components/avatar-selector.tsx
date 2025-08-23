"use client";

import { CustomButton } from "@/components/ui/custom/custom-button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

interface AvailableAvatar {
  id: string
  url: string
  name: string
  is_active: boolean
  created_at: string
}

interface AvatarSelectorProps {
  avatars: AvailableAvatar[]
}

export function AvatarSelector({ avatars }: AvatarSelectorProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatar(avatarId);
  };

  const handleSaveAvatar = async () => {
    if (!selectedAvatar) {
      toast.error("Selecione um avatar primeiro");
      return;
    }

    setIsLoading(true);
  
    router.push("/meu-perfil");
  
  };

  return (
    <div className="px-4">
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6 justify-items-center place-items-center">
        {avatars.map((avatar) => {
          const isSelected = selectedAvatar === avatar.id;
          return (
            <div
              key={avatar.id}
              className={`w-full md:max-w-24 xl:max-w-32 aspect-square rounded-full border-2 bg-transparent flex items-center justify-center cursor-pointer transition-colors overflow-hidden group ${
                isSelected 
                  ? 'border-card-2' 
                  : 'border-border hover:border-card-2 focus:border-card-2'
              }`}
              onClick={() => handleAvatarSelect(avatar.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleAvatarSelect(avatar.id);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Selecionar ${avatar.name}`}
            >
              <Image 
                src={avatar.url} 
                alt={avatar.name} 
                className={`w-full h-full rounded-full object-contain transition-transform duration-300 ${
                  isSelected 
                    ? 'scale-110' 
                    : 'group-hover:scale-110 group-focus:scale-110'
                }`}
                width={120}
                height={120}
              />
            </div>
          );
        })}
      </div>
      
      {/* Save Button */}
      <div className="mt-10 md:mt-16 xl:mt-20">
        <CustomButton
          size="xl"
          className="rounded-full"
          variant="primary"
          fullWidth
          onClick={handleSaveAvatar}
          disabled={!selectedAvatar || isLoading}
        >
          {isLoading ? "Salvando..." : "Salvar"}
        </CustomButton>
      </div>
    </div>
  );
}
