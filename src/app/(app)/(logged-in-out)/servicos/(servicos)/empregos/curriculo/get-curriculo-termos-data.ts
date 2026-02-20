import { getApiV1EmpregabilidadeTermosUsoCpf } from '@/http-courses/empregabilidade-termos-uso/empregabilidade-termos-uso'

/**
 * Verifica no server se o usuário já aceitou os termos de uso.
 * Usar apenas em Server Components.
 */
export async function getCurriculoTermosAceitos(cpf: string): Promise<boolean> {
  const normalizedCpf = cpf.replace(/\D/g, '')
  if (!normalizedCpf) return false

  try {
    const res = await getApiV1EmpregabilidadeTermosUsoCpf(normalizedCpf)
    if (res.status !== 200 || !res.data) return false
    const data = res.data as Record<string, unknown>
    if (typeof data !== 'object' || data === null) return false
    return Object.values(data).some((v) => v === true)
  } catch {
    return false
  }
}
