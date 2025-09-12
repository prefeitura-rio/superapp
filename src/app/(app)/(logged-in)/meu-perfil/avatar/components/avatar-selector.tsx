'use client'

import { updateUserAvatar } from '@/actions/update-user-avatar'
import { CustomButton } from '@/components/ui/custom/custom-button'
import type { ModelsAvatarResponse } from '@/http/models'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface AvatarSelectorProps {
  avatars: ModelsAvatarResponse[]
  currentAvatarId?: string | null
}

// Type for avatars with guaranteed required fields
type ValidAvatar = {
  id: string
  url: string
  name: string
  is_active?: boolean
  created_at?: string
}

export function AvatarSelector({
  avatars,
  currentAvatarId,
}: AvatarSelectorProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Pre-select current avatar if available
  useEffect(() => {
    if (currentAvatarId) {
      setSelectedAvatar(currentAvatarId)
    }
  }, [currentAvatarId])

  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatar(avatarId)
  }

  const handleSaveAvatar = async () => {
    if (!selectedAvatar) {
      toast.error('Selecione um avatar primeiro')
      return
    }

    // Don't save if the avatar hasn't changed
    if (selectedAvatar === currentAvatarId) {
      toast.success('Avatar já está selecionado')
      router.push('/meu-perfil')
      return
    }

    setIsLoading(true)

    try {
      const result = await updateUserAvatar(selectedAvatar)

      if (result.success) {
        toast.success('Avatar atualizado com sucesso!')
        router.push('/meu-perfil')
      } else {
        toast.error(result.error || 'Erro ao atualizar avatar')
        router.push('/meu-perfil')
      }
    } catch (error) {
      toast.error('Erro ao atualizar avatar')
      router.push('/meu-perfil')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter out any avatars with missing required data and type them properly
  const validAvatars: ValidAvatar[] = avatars.filter(
    (avatar): avatar is ValidAvatar =>
      Boolean(avatar.id && avatar.url && avatar.name)
  )

  if (validAvatars.length === 0) {
    return (
      <div className="px-4 mt-6 text-center">
        <p className="text-muted-foreground">Nenhum avatar válido encontrado</p>
      </div>
    )
  }

  const isCurrentAvatarSelected = selectedAvatar === currentAvatarId

  return (
    <div className="px-4">
      <div className="text-base text-foreground pb-8 pt-3 font-medium">
        Escolha sua foto de perfil
      </div>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 justify-items-center place-items-center">
        {validAvatars.map(avatar => {
          const isSelected = selectedAvatar === avatar.id
          return (
            <div
              key={avatar.id}
              className={`w-full bg-card md:max-w-24 xl:max-w-32 aspect-square rounded-full border-2 border-border flex items-center justify-center cursor-pointer transition-colors overflow-hidden group relative ${
                isSelected
                  ? 'border-card-2'
                  : 'border-border hover:border-card-2 focus:border-card-2'
              }`}
              onClick={() => handleAvatarSelect(avatar.id)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleAvatarSelect(avatar.id)
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
          )
        })}
      </div>

      {/* Save Button */}
      <div className="mt-10 md:mt-16 xl:mt-20 mb-12">
        <CustomButton
          size="xl"
          className="rounded-full"
          variant="primary"
          fullWidth
          onClick={handleSaveAvatar}
          disabled={!selectedAvatar || isLoading}
        >
          {isLoading
            ? 'Salvando...'
            : isCurrentAvatarSelected
              ? 'Voltar'
              : 'Salvar'}
        </CustomButton>
      </div>
    </div>
  )
}
