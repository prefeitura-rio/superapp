"use server";
import { postCitizenCpfPhoneValidate } from "@/http/citizen/citizen";
import { ModelsPhoneVerificationValidateRequest } from "@/http/models/modelsPhoneVerificationValidateRequest";
import { getUserInfoFromToken } from "@/lib/user-info";

export async function validateUserPhoneToken(data: ModelsPhoneVerificationValidateRequest) {
  const user = await getUserInfoFromToken();
  if (!user.cpf) {
    return { success: false, error: "Usuário não autenticado" };
  }
  try {
    const response = await postCitizenCpfPhoneValidate(user.cpf, data);
    if (response.status === 200) {
      return { success: true };
    } else {
      return { success: false, error: response.data?.error || "Token inválido" };
    }
  } catch (error: any) {
    return { success: false, error: error?.message || "Erro desconhecido" };
  }
}
