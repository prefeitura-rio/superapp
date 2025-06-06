import { jwtDecode } from 'jwt-decode';
import { cookies } from 'next/headers';

export interface UserInfo {
  cpf: string;
  name: string;
}

export async function getUserInfoFromToken(): Promise<UserInfo | null> {
  const cookieStore = cookies();
  const accessToken = (await cookieStore).get('access_token')?.value;
  if (!accessToken) return null;

  try {
    const decoded: any = jwtDecode(accessToken);
    // Adjust these keys if your token uses different claim names
    const cpf = decoded.cpf || decoded.CPF || decoded.preferred_username;
    const name = decoded.name || decoded.NOME || '';
    if (!cpf || !name) return null;
    return { cpf, name };
  } catch (e) {
    return null;
  }
}
