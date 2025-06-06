'use server';

import { putCitizenCpfFirstlogin } from '@/http/citizen/citizen';

export async function setFirstLoginFalse(cpf: string) {
  return putCitizenCpfFirstlogin(cpf);
}
