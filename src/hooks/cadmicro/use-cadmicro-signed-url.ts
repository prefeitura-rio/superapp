'use client'

import {
  CADMICRO_SIGNED_URL_TTL_MS,
  isGcsObjectUrl,
} from '@/lib/cadmicro/file-types'
import { requestCadmicroSignedRead } from '@/lib/cadmicro/request-signed-read'
import { useQuery, useQueryClient } from '@tanstack/react-query'

const STALE_BUFFER_MS = 60_000

export function cadmicroSignedReadQueryKey(
  objectUrl: string,
  vehicleId?: string | null
) {
  return ['cadmicro', 'signed-read', objectUrl, vehicleId ?? null] as const
}

export function useInvalidateCadmicroSignedUrl() {
  const queryClient = useQueryClient()

  return (objectUrl: string, vehicleId?: string | null) =>
    queryClient.invalidateQueries({
      queryKey: cadmicroSignedReadQueryKey(objectUrl, vehicleId),
    })
}

interface UseCadmicroSignedUrlOptions {
  vehicleId?: string
  enabled?: boolean
}

/**
 * Cached GCS signed-read. Fresh for ~14 min (1 min before the 15 min GCS TTL).
 * Non-GCS URLs are returned as-is without a network call.
 */
export function useCadmicroSignedUrl(
  objectUrl: string | null | undefined,
  options?: UseCadmicroSignedUrlOptions
) {
  const vehicleId = options?.vehicleId
  const isGcs = !!objectUrl && isGcsObjectUrl(objectUrl)
  const enabled = (options?.enabled ?? true) && isGcs

  const query = useQuery({
    queryKey: cadmicroSignedReadQueryKey(objectUrl ?? '', vehicleId),
    queryFn: () =>
      requestCadmicroSignedRead(objectUrl as string, {
        ...(vehicleId ? { vehicleId } : {}),
      }),
    enabled,
    staleTime: CADMICRO_SIGNED_URL_TTL_MS - STALE_BUFFER_MS,
    gcTime: CADMICRO_SIGNED_URL_TTL_MS,
    refetchOnWindowFocus: false,
    retry: 1,
  })

  if (!objectUrl) {
    return {
      url: null as string | null,
      isLoading: false,
      isError: false,
    }
  }

  if (!isGcs) {
    return {
      url: objectUrl,
      isLoading: false,
      isError: false,
    }
  }

  return {
    url: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  }
}
