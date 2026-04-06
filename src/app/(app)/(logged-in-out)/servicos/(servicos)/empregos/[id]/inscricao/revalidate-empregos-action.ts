'use server'

import { revalidatePath } from 'next/cache'

/**
 * Revalida a página de empregos para forçar re-fetch de candidaturas.
 * Usado após candidatura bem-sucedida para atualizar o card "Candidaturas enviadas".
 */
export async function revalidateEmpregosPage() {
  revalidatePath('/servicos/empregos', 'page')
}
