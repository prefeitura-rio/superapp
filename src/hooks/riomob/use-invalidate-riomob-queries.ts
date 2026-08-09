'use client'

import {
  riomobInvitationsQueryKey,
  riomobVehicleQueryKey,
  riomobVehiclesQueryKey,
} from '@/lib/riomob/query-keys'
import { useQueryClient } from '@tanstack/react-query'

export function useInvalidateRiomobQueries() {
  const queryClient = useQueryClient()

  return {
    vehicles: () =>
      queryClient.invalidateQueries({ queryKey: riomobVehiclesQueryKey() }),
    vehicle: (vehicleId: string) =>
      queryClient.invalidateQueries({
        queryKey: riomobVehicleQueryKey(vehicleId),
      }),
    invitations: () =>
      queryClient.invalidateQueries({ queryKey: riomobInvitationsQueryKey() }),
    afterCreate: async () => {
      await queryClient.invalidateQueries({
        queryKey: riomobVehiclesQueryKey(),
      })
    },
    afterUpdate: async (vehicleId: string) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: riomobVehicleQueryKey(vehicleId),
        }),
        queryClient.invalidateQueries({
          queryKey: riomobVehiclesQueryKey(),
        }),
      ])
    },
    afterDelete: async (vehicleId: string) => {
      queryClient.removeQueries({ queryKey: riomobVehicleQueryKey(vehicleId) })
      await queryClient.invalidateQueries({
        queryKey: riomobVehiclesQueryKey(),
      })
    },
    afterConductorChange: async (vehicleId: string) => {
      await queryClient.invalidateQueries({
        queryKey: riomobVehicleQueryKey(vehicleId),
      })
    },
    afterAcceptInvitation: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: riomobInvitationsQueryKey(),
        }),
        queryClient.invalidateQueries({
          queryKey: riomobVehiclesQueryKey(),
        }),
      ])
    },
    afterRejectInvitation: async () => {
      await queryClient.invalidateQueries({
        queryKey: riomobInvitationsQueryKey(),
      })
    },
  }
}
