import { revalidatePath } from 'next/cache'

export function revalidateRiomobPaths(vehicleId?: string) {
  revalidatePath('/carteira')
  if (vehicleId) {
    revalidatePath(`/carteira/riomob/${vehicleId}`)
    revalidatePath(`/carteira/riomob/${vehicleId}/editar`)
  }
}

export function actionErrorMessage(
  response: { data?: unknown },
  fallback: string
): string {
  const data = response.data
  if (data && typeof data === 'object' && 'message' in data) {
    const message = (data as { message?: unknown }).message
    if (typeof message === 'string' && message.trim()) return message
  }
  return fallback
}
