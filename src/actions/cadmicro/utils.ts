import { revalidatePath } from 'next/cache'
import type { ZodType } from 'zod'

export function revalidateCadmicroPaths(vehicleId?: string) {
  revalidatePath('/carteira')
  if (vehicleId) {
    revalidatePath(`/carteira/cadmicro/${vehicleId}`)
    revalidatePath(`/carteira/cadmicro/${vehicleId}/editar`)
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

export function parseActionPayload<T>(
  schema: ZodType<T>,
  payload: unknown,
  fallbackError = 'Dados inválidos'
): { success: true; data: T } | { success: false; error: string } {
  const parsed = schema.safeParse(payload)
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message
    return { success: false, error: first || fallbackError }
  }
  return { success: true, data: parsed.data }
}
