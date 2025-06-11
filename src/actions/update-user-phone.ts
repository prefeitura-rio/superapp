"use server";
import { putCitizenCpfPhone } from "@/http/citizen/citizen";
import { ModelsSelfDeclaredPhoneInput } from "@/http/models/modelsSelfDeclaredPhoneInput";
import { getUserInfoFromToken } from "@/lib/user-info";
import { revalidateTag } from "next/cache";

export async function updateUserPhone(data: ModelsSelfDeclaredPhoneInput) {
  const user = await getUserInfoFromToken();
  if (!user.cpf) {
    return { success: false, error: "Usuário não autenticado" };
  }
  try {
    const response = await putCitizenCpfPhone(user.cpf, data);
    if (response.status === 200) {
      revalidateTag('update-user-phone-number');
      return { success: true };
    } else {
      return { success: false, error: response.data?.error || "Erro ao atualizar número" };
    }
  } catch (error: any) {
    return { success: false, error: error?.message || "Erro desconhecido" };
  }
}
