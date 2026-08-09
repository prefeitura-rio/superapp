'use client'

import {
  RIOMOB_SIGNED_URL_TTL_MS,
  isGcsObjectUrl,
} from '@/lib/riomob/file-types'
import { requestRiomobSignedRead } from '@/lib/riomob/request-signed-read'
import { useQuery, useQueryClient } from '@tanstack/react-query'

const STALE_BUFFER_MS = 60_000

export function riomobSignedReadQueryKey(
  objectUrl: string,
  vehicleId?: string | null
) {
  return ['riomob', 'signed-read', objectUrl, vehicleId ?? null] as const
}

export function useInvalidateRiomobSignedUrl() {
  const queryClient = useQueryClient()

  return (objectUrl: string, vehicleId?: string | null) =>
    queryClient.invalidateQueries({
      queryKey: riomobSignedReadQueryKey(objectUrl, vehicleId),
    })
}

interface UseRiomobSignedUrlOptions {
  vehicleId?: string
  enabled?: boolean
}

/**
 * Cached GCS signed-read. Fresh for ~14 min (1 min before the 15 min GCS TTL).
 * Non-GCS URLs are returned as-is without a network call.
 */
export function useRiomobSignedUrl(
  objectUrl: string | null | undefined,
  options?: UseRiomobSignedUrlOptions
) {
  const vehicleId = options?.vehicleId
  const isGcs = !!objectUrl && isGcsObjectUrl(objectUrl)
  const enabled = (options?.enabled ?? true) && isGcs

  const query = useQuery({
    queryKey: riomobSignedReadQueryKey(objectUrl ?? '', vehicleId),
    queryFn: () =>
      requestRiomobSignedRead(objectUrl as string, {
        ...(vehicleId ? { vehicleId } : {}),
      }),
    enabled,
    staleTime: RIOMOB_SIGNED_URL_TTL_MS - STALE_BUFFER_MS,
    gcTime: RIOMOB_SIGNED_URL_TTL_MS,
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
