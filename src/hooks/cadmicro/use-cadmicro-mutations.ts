'use client'

import {
  createVehicle,
  deleteVehicle,
  inviteConductor,
  leaveVehicle,
  removeConductor,
  respondInvitation,
  updateVehicle,
} from '@/actions/cadmicro'
import type { InviteConductorPayload } from '@/app/(app)/(logged-in)/carteira/cadmicro/[vehicleId]/adicionar-condutor/schema'
import type { UpdateVehiclePayload } from '@/app/(app)/(logged-in)/carteira/cadmicro/[vehicleId]/editar/schema'
import type { CreateVehiclePayload } from '@/app/(app)/(logged-in)/carteira/cadmicro/adicionar-veiculo/schema'
import { useInvalidateCadmicroQueries } from '@/hooks/cadmicro/use-invalidate-cadmicro-queries'
import type { ModelsInvitationResponseStatus } from '@/http/models/modelsInvitationResponseStatus'
import { useMutation } from '@tanstack/react-query'

export function useCreateVehicleMutation() {
  const invalidate = useInvalidateCadmicroQueries()

  return useMutation({
    mutationFn: (payload: CreateVehiclePayload) => createVehicle(payload),
    onSuccess: async result => {
      if (result.success) await invalidate.afterCreate()
    },
  })
}

export function useUpdateVehicleMutation(vehicleId: string) {
  const invalidate = useInvalidateCadmicroQueries()

  return useMutation({
    mutationFn: (payload: UpdateVehiclePayload) =>
      updateVehicle(vehicleId, payload),
    onSuccess: async result => {
      if (result.success) await invalidate.afterUpdate(vehicleId)
    },
  })
}

export function useDeleteOrLeaveVehicleMutation() {
  const invalidate = useInvalidateCadmicroQueries()

  return useMutation({
    mutationFn: async ({
      vehicleId,
      isConductor,
    }: {
      vehicleId: string
      isConductor: boolean
    }) => (isConductor ? leaveVehicle(vehicleId) : deleteVehicle(vehicleId)),
    onSuccess: async (result, variables) => {
      if (result.success) await invalidate.afterDelete(variables.vehicleId)
    },
  })
}

export function useInviteConductorMutation(vehicleId: string) {
  const invalidate = useInvalidateCadmicroQueries()

  return useMutation({
    mutationFn: (payload: InviteConductorPayload) => inviteConductor(payload),
    onSuccess: async result => {
      if (result.success) await invalidate.afterConductorChange(vehicleId)
    },
  })
}

export function useRemoveConductorMutation(vehicleId: string) {
  const invalidate = useInvalidateCadmicroQueries()

  return useMutation({
    mutationFn: (conductorId: string) =>
      removeConductor(vehicleId, conductorId),
    onSuccess: async result => {
      if (result.success) await invalidate.afterConductorChange(vehicleId)
    },
  })
}

export function useRespondInvitationMutation() {
  const invalidate = useInvalidateCadmicroQueries()

  return useMutation({
    mutationFn: ({
      conductorId,
      status,
      vehicleId,
    }: {
      conductorId: string
      status: ModelsInvitationResponseStatus
      vehicleId?: string
    }) => respondInvitation(conductorId, status, vehicleId),
    onSuccess: async (result, variables) => {
      if (!result.success) return
      if (variables.status === 'accepted') {
        await invalidate.afterAcceptInvitation()
      } else {
        await invalidate.afterRejectInvitation()
      }
    },
  })
}
