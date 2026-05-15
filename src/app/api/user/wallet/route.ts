import { getCitizenCpfPets } from '@/http/citizen/citizen'
import type { ModelsPet } from '@/http/models'
import {
  getDalCitizenCpfMaintenanceRequest,
  getDalCitizenCpfWallet,
  getDalHealthUnitInfo,
  getDalHealthUnitRisk,
} from '@/lib/dal'
import { getUserInfoFromToken } from '@/lib/user-info'
import { NextResponse } from 'next/server'

const NO_CACHE_HEADERS = {
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

export async function GET() {
  try {
    const userAuthInfo = await getUserInfoFromToken()
    const isLoggedIn = !!(userAuthInfo.cpf && userAuthInfo.name)

    if (!isLoggedIn) {
      return NextResponse.json(
        {
          walletData: null,
          maintenanceRequests: null,
          healthUnitData: null,
          healthUnitRiskData: null,
          pets: [],
        },
        { headers: NO_CACHE_HEADERS }
      )
    }

    let walletData
    let maintenanceRequests
    let healthUnitData
    let healthUnitRiskData
    let pets: ModelsPet[] = []

    // Fetch wallet data
    try {
      const walletResponse = await getDalCitizenCpfWallet(userAuthInfo.cpf)
      if (walletResponse.status === 200) {
        walletData = walletResponse.data
      } else {
        console.error(
          'Failed to fetch wallet data status:',
          walletResponse.data
        )
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error)
    }

    // Fetch health unit info and risk if CNES is available
    const cnes = walletData?.saude?.clinica_familia?.id_cnes
    if (cnes) {
      try {
        const [unitResponse, riskResponse] = await Promise.all([
          getDalHealthUnitInfo(cnes),
          getDalHealthUnitRisk(cnes),
        ])
        if (unitResponse.status === 200) {
          healthUnitData = unitResponse.data
        } else {
          console.error('Failed to fetch health unit data:', unitResponse.data)
        }
        if (riskResponse.status === 200) {
          healthUnitRiskData = riskResponse.data
        } else {
          console.error(
            'Failed to fetch health unit risk data:',
            riskResponse.data
          )
        }
      } catch (error) {
        console.error('Error fetching health unit data:', error)
      }
    }

    // Fetch maintenance requests data
    try {
      const maintenanceResponse = await getDalCitizenCpfMaintenanceRequest(
        userAuthInfo.cpf,
        {
          page: 1,
          per_page: 100, // Get all requests for counting
        }
      )
      if (maintenanceResponse.status === 200) {
        maintenanceRequests = maintenanceResponse.data.data
      } else {
        console.error(
          'Failed to fetch maintenance requests status:',
          maintenanceResponse.data
        )
      }
    } catch (error) {
      console.error('Error fetching maintenance requests:', error)
    }

    // Fetch pets associated with the logged-in CPF
    try {
      const petsResponse = await getCitizenCpfPets(userAuthInfo.cpf)

      if (
        petsResponse.status === 200 &&
        petsResponse.data?.data &&
        Array.isArray(petsResponse.data.data)
      ) {
        pets = petsResponse.data.data
      } else {
        pets = []
      }
    } catch (error) {
      console.error('Error fetching pets:', error)
      pets = []
    }

    return NextResponse.json(
      {
        walletData,
        maintenanceRequests,
        healthUnitData,
        healthUnitRiskData,
        pets,
      },
      { headers: NO_CACHE_HEADERS }
    )
  } catch (error) {
    console.error('Error in wallet API route:', error)
    return NextResponse.json(
      {
        walletData: null,
        maintenanceRequests: null,
        healthUnitData: null,
        healthUnitRiskData: null,
        pets: [],
        error: 'Failed to fetch wallet data',
      },
      { status: 500, headers: NO_CACHE_HEADERS }
    )
  }
}
