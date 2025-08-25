"use server";

import { putV1CitizenCpfAvatar } from "@/http/avatars/avatars";
import { getUserInfoFromToken } from "@/lib/user-info";
import { revalidatePath } from "next/cache";

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
      // Revalidate the profile page to show the new avatar
      revalidatePath("/meu-perfil");
      revalidatePath("/");
      revalidatePath("/meu-perfil/avatar");
      return { success: true, data: response.data };
    } else {
      return { success: false, error: "Erro ao atualizar avatar" };
    }
  } catch (error) {
    console.error("Error updating user avatar:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}
