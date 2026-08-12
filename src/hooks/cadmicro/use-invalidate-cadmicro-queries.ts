'use client'

import {
  cadmicroInvitationsQueryKey,
  cadmicroVehicleQueryKey,
  cadmicroVehiclesQueryKey,
} from '@/lib/cadmicro/query-keys'
import { useQueryClient } from '@tanstack/react-query'

export function useInvalidateCadmicroQueries() {
  const queryClient = useQueryClient()

  return {
    vehicles: () =>
      queryClient.invalidateQueries({ queryKey: cadmicroVehiclesQueryKey() }),
    vehicle: (vehicleId: string) =>
      queryClient.invalidateQueries({
        queryKey: cadmicroVehicleQueryKey(vehicleId),
      }),
    invitations: () =>
      queryClient.invalidateQueries({
        queryKey: cadmicroInvitationsQueryKey(),
      }),
    afterCreate: async () => {
      await queryClient.invalidateQueries({
        queryKey: cadmicroVehiclesQueryKey(),
      })
    },
    afterUpdate: async (vehicleId: string) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: cadmicroVehicleQueryKey(vehicleId),
        }),
        queryClient.invalidateQueries({
          queryKey: cadmicroVehiclesQueryKey(),
        }),
      ])
    },
    afterDelete: async (vehicleId: string) => {
      queryClient.removeQueries({
        queryKey: cadmicroVehicleQueryKey(vehicleId),
      })
      await queryClient.invalidateQueries({
        queryKey: cadmicroVehiclesQueryKey(),
      })
    },
    afterConductorChange: async (vehicleId: string) => {
      await queryClient.invalidateQueries({
        queryKey: cadmicroVehicleQueryKey(vehicleId),
      })
    },
    afterAcceptInvitation: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: cadmicroInvitationsQueryKey(),
        }),
        queryClient.invalidateQueries({
          queryKey: cadmicroVehiclesQueryKey(),
        }),
      ])
    },
    afterRejectInvitation: async () => {
      await queryClient.invalidateQueries({
        queryKey: cadmicroInvitationsQueryKey(),
      })
    },
  }
}
