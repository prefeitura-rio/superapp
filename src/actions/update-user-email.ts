'use server'

import { putCitizenCpfEmail } from '@/http/citizen/citizen';
import { ModelsSelfDeclaredEmailInput } from '@/http/models/modelsSelfDeclaredEmailInput';
import { getUserInfoFromToken } from '@/lib/user-info';
import { revalidateTag } from 'next/cache';

export async function updateUserEmail(emailData: ModelsSelfDeclaredEmailInput) {
  const userAuthInfo = await getUserInfoFromToken();
  try {
    const response = await putCitizenCpfEmail(userAuthInfo.cpf, emailData);
    if (response.status !== 200) {
      return {
        error: response.data.error || 'Failed to update email',
        status: response.status,
      };
    }
    revalidateTag('update-user-email');
    return { success: true, data: response.data };
  } catch (error) {
    return {
      error: 'An unexpected error occurred while updating the email',
      status: 500,
    };
  }
}
