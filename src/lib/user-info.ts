import { jwtDecode } from 'jwt-decode';
import { cookies } from 'next/headers';

export interface UserInfo {
  cpf: string;
  name: string;
}

export async function getUserInfoFromToken(): Promise<UserInfo | { cpf: '', name: '' }> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  if (!accessToken) return { cpf: '', name: '' };

  try {
    const decoded: any = jwtDecode(accessToken);
    const cpf = decoded.cpf || decoded.CPF || decoded.preferred_username;
    const name = decoded.name || decoded.NOME || '';
    if (!cpf || !name) return { cpf: '', name: '' };
    return { cpf, name };
  } catch (e) {
    return { cpf: '', name: '' };
  }
}
