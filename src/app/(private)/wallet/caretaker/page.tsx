import { getCitizenCpfMaintenanceRequest } from '@/http/citizen/citizen'
import {
  formatMaintenanceRequestsCount,
  getMaintenanceRequestStats,
} from '@/lib/maintenance-requests-utils'
import { getUserInfoFromToken } from '@/lib/user-info'
import { Globe, Phone } from 'lucide-react'
import Calls from '../../components/calls'
import { SecondaryHeader } from '../../components/secondary-header'
import { WalletCaretakerCard } from '../../components/wallet-caretaker-card'

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
    <div className="min-h-lvh max-w-md mx-auto pt-26 pb-10">
      <SecondaryHeader title="Carteira" />
      <div className="z-50">
        <div className="px-5">
          <WalletCaretakerCard
            href="/wallet/caretaker"
            title="CUIDADOS COM A CIDADE"
            name={formatMaintenanceRequestsCount(maintenanceStats.aberto)}
            statusLabel="Total de chamados"
            statusValue={maintenanceStats.total.toString()}
            extraLabel="Fechados"
            extraValue={maintenanceStats.fechados.toString()}
          />
        </div>
        {/* Icons Buttons Row */}
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex flex-row pl-5 gap-5 justify-start mt-8 min-w-max">
            <a href="tel:1746" className="flex flex-col items-center">
              <div className="rounded-full w-16 h-16 flex justify-center items-center bg-card hover:bg-card hover:text-black transition-colors">
                <Phone className="h-5" />
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
                <Globe className="h-5" />
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
