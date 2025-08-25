"use server";

import { putV1CitizenCpfAvatar } from "@/http/avatars/avatars";
import { revalidateDalCitizenCpfAvatar } from "@/lib/dal";
import { getUserInfoFromToken } from "@/lib/user-info";

export async function updateUserAvatar(avatarId: string) {
  try {
    const userInfo = await getUserInfoFromToken();
    
    if (!userInfo.cpf) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const response = await putV1CitizenCpfAvatar(userInfo.cpf, {
      avatar_id: avatarId
    });

    if (response.status === 200) {
      // Revalidate the user's avatar cache using DAL
      await revalidateDalCitizenCpfAvatar(userInfo.cpf);
      return { success: true, data: response.data };
    } else {
      return { success: false, error: "Erro ao atualizar avatar" };
    }
  } catch (error) {
    console.error("Error updating user avatar:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}
