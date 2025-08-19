// Data Access Layer (DAL)
// This file is used to cache the data fetching functions

import {
  getCitizenCpf,
  getCitizenCpfFirstlogin,
  getCitizenCpfMaintenanceRequest,
  getCitizenCpfWallet,
} from '@/http/citizen/citizen'
import { getHealthUnitInfo, getHealthUnitRisk } from '@/lib/health-unit'
import { revalidateTag, unstable_cache } from 'next/cache'

// Recommended caching strategy for high traffic (500K+ users/month)
// 30-minute cache provides optimal balance of performance and data freshness
export async function getDalCitizenCpfWallet(cpf: string) {
  return await getCitizenCpfWallet(cpf, {
    cache: 'force-cache',
    next: {
      revalidate: 1800, // 30 minutes - optimal for high traffic
      tags: [`wallet-${cpf}`], // Tag for selective revalidation
    },
  })
}

// User info caching (user-specific data)
// 30-minute cache since user info can be updated frequently
export async function getDalCitizenCpf(cpf: string) {
  return await getCitizenCpf(cpf, {
    cache: 'force-cache',
    next: {
      revalidate: 1800, // 30 minutes - optimal for high traffic
      tags: [`user-info-${cpf}`], // Tag for selective revalidation
    },
  })
}

// First login status caching (user-specific data)
// 30-minute cache since first login status can change once per user
export async function getDalCitizenCpfFirstlogin(cpf: string) {
  return await getCitizenCpfFirstlogin(cpf, {
    cache: 'force-cache',
    next: {
      revalidate: 1800, // 30 minutes - optimal for high traffic
      tags: [`firstlogin-${cpf}`], // Tag for selective revalidation
    },
  })
}

// Maintenance requests caching (user-specific data)
// 30-minute cache since maintenance requests can be updated frequently
export async function getDalCitizenCpfMaintenanceRequest(
  cpf: string,
  params?: { page?: number; per_page?: number }
) {
  return await getCitizenCpfMaintenanceRequest(cpf, params, {
    cache: 'force-cache',
    next: {
      revalidate: 1800, // 30 minutes - optimal for high traffic
      tags: [`maintenance-${cpf}`], // Tag for selective revalidation
    },
  })
}

// Health unit info caching (shared across all users)
// 1 hour cache since health unit info doesn't change frequently
export const getDalHealthUnitInfo = unstable_cache(
  async (cnes: string) => {
    return await getHealthUnitInfo(cnes)
  },
  ['health-unit-info'],
  {
    revalidate: 3600, // 1 hour
    tags: ['health-unit-info'],
  }
)

// Health unit risk caching (shared across all users)
// 5 minutes cache since risk status can change more frequently
export const getDalHealthUnitRisk = unstable_cache(
  async (cnes: string) => {
    return await getHealthUnitRisk(cnes)
  },
  ['health-unit-risk'],
  {
    revalidate: 300, // 5 minutes
    tags: ['health-unit-risk'],
  }
)

// Helper function to revalidate wallet data when needed
export async function revalidateDalCitizenCpfWallet(cpf: string) {
  // This would be called from a Server Action or API route
  // to invalidate cache when data changes
  // Example: after user updates their profile
  revalidateTag(`wallet-${cpf}`)
}

// Helper function to revalidate user info when needed
export async function revalidateDalCitizenCpf(cpf: string) {
  // This would be called from a Server Action or API route
  // to invalidate cache when user info changes
  // Example: after user updates their profile
  revalidateTag(`user-info-${cpf}`)
}

// Helper function to revalidate maintenance requests when needed
export async function revalidateDalCitizenCpfMaintenanceRequest(cpf: string) {
  // This would be called from a Server Action or API route
  // to invalidate cache when maintenance requests change
  // Example: after user creates a new maintenance request
  revalidateTag(`maintenance-${cpf}`)
}

// Helper function to revalidate first login status when needed
export async function revalidateDalCitizenCpfFirstlogin(cpf: string) {
  // This would be called from a Server Action or API route
  // to invalidate cache when first login status changes
  // Example: after user completes onboarding
  revalidateTag(`firstlogin-${cpf}`)
}
