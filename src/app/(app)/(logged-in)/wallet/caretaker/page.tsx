import Calls from '@/app/components/calls'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { CaretakerCard } from '@/app/components/wallet-cards/caretaker-card'
import { GlobeIcon, PhoneIcon } from '@/assets/icons'
import { getCitizenCpfMaintenanceRequest } from '@/http/citizen/citizen'
import {
  formatMaintenanceRequestsCount,
  getMaintenanceRequestStats,
} from '@/lib/maintenance-requests-utils'
import { getUserInfoFromToken } from '@/lib/user-info'

export default async function CaretakerCardDetail() {
  const userAuthInfo = await getUserInfoFromToken()
  await new Promise(resolve => setTimeout(resolve, 5000))
  let maintenanceRequests

  if (userAuthInfo.cpf) {
    try {
      const maintenanceResponse = await getCitizenCpfMaintenanceRequest(
        userAuthInfo.cpf,
        {
          page: 1,
          per_page: 100, // Get all requests : TODO: paginate
        },
        {
          cache: 'force-cache',
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
  }

  // Calculate maintenance requests statistics
  const maintenanceStats = getMaintenanceRequestStats(maintenanceRequests)

  return (
    <div className="min-h-lvh max-w-xl mx-auto pt-26 pb-10">
      <SecondaryHeader title="Carteira" />
      <div className="z-50">
        <div className="px-4">
          <CaretakerCard
            href="/wallet/caretaker"
            title="CUIDADOS COM A CIDADE"
            name={formatMaintenanceRequestsCount(maintenanceStats.aberto)}
            primaryLabel="Total de chamados"
            primaryValue={maintenanceStats.total.toString()}
            secondaryLabel="Fechados"
            secondaryValue={maintenanceStats.fechados.toString()}
            enableFlip={false}
            showInitialShine
          />
        </div>
        {/* Icons Buttons Row */}
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex flex-row pl-5 gap-5 justify-start mt-8 min-w-max">
            <a href="tel:1746" className="flex flex-col items-center">
              <div className="rounded-full w-16 h-16 flex justify-center items-center bg-card hover:bg-card hover:text-black transition-colors">
                <PhoneIcon className="h-6.5" />
              </div>
              <div className="flex flex-col items-center">
                <span className="mt-2 text-foreground text-sm font-normal">
                  Chamado
                </span>
                <span className=" text-gray-300 text-xs font-normal">
                  telefone
                </span>
              </div>
            </a>
            <a
              href="https://1746.rio/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center"
            >
              <div className="rounded-full w-16 h-16 flex justify-center items-center bg-card hover:bg-card hover:text-black transition-colors">
                <GlobeIcon className="h-6.5" />
              </div>
              <div className="flex flex-col items-center">
                <span className="mt-2 text-foreground text-sm font-normal">
                  Chamado
                </span>
                <span className="text-gray-300 text-xs font-normal">
                  website
                </span>
              </div>
            </a>
          </div>
        </div>
      </div>
      <Calls maintenanceRequests={maintenanceRequests} />
    </div>
  )
}
