import { NextResponse } from 'next/server'
import {
  getDalCitizenCpfWallet,
  getDalCitizenCpfMaintenanceRequest,
  getDalHealthUnitInfo,
  getDalHealthUnitRisk,
} from '@/lib/dal'
import { getUserInfoFromToken } from '@/lib/user-info'
import { getHealthUnitRiskStatus } from '@/lib/health-unit-utils'
import {
  formatHealthOperatingHours,
  getHealthOperatingStatus,
} from '@/lib/operating-status'

export async function GET() {
  try {
    const userAuthInfo = await getUserInfoFromToken()
    const isLoggedIn = !!(userAuthInfo.cpf && userAuthInfo.name)

    if (!isLoggedIn) {
      return NextResponse.json({
        walletData: null,
        maintenanceRequests: null,
        healthCardData: null,
        shouldShowWallet: false,
      })
    }

    let walletData
    let maintenanceRequests
    let healthUnitData
    let healthUnitRiskData

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

    // healthCardData - only create if clinica_familia exists and indicador is true
    let healthCardData = undefined
    if (
      walletData?.saude?.clinica_familia &&
      walletData?.saude?.clinica_familia?.indicador === true
    ) {
      // Use wallet data as primary source, only supplement with API data for specific fields
      const clinicaFamilia = walletData.saude.clinica_familia

      // Only use health unit API for operating hours and current status
      const operatingHours = healthUnitData
        ? formatHealthOperatingHours(healthUnitData.funcionamento_dia_util)
        : 'Não informado'

      const statusValue = healthUnitData
        ? getHealthOperatingStatus(healthUnitData.funcionamento_dia_util)
        : 'Não informado'

      // Only use health unit API for risk status
      const riskStatus = healthUnitRiskData
        ? getHealthUnitRiskStatus(healthUnitRiskData)
        : null

      healthCardData = {
        href: '/carteira/clinica-da-familia',
        title: 'CLÍNICA DA FAMÍLIA',
        name: clinicaFamilia.nome || 'Nome não disponível',
        statusLabel: 'Status',
        statusValue,
        extraLabel: 'Horário de atendimento',
        extraValue: operatingHours,
        address: clinicaFamilia.endereco || 'Endereço não disponível',
        phone: clinicaFamilia.telefone,
        email: clinicaFamilia.email,
        risco: riskStatus?.risco,
      }
    }

    return NextResponse.json({
      walletData,
      maintenanceRequests,
      healthCardData,
    })
  } catch (error) {
    console.error('Error in wallet API route:', error)
    return NextResponse.json(
      {
        walletData: null,
        maintenanceRequests: null,
        healthCardData: null,
        error: 'Failed to fetch wallet data',
      },
      { status: 500 }
    )
  }
}

