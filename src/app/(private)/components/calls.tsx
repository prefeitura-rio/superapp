import type { ModelsMaintenanceRequest } from '@/http/models'
import { CallsAccordion } from './calls-accordion'

interface CallsProps {
  maintenanceRequests?: ModelsMaintenanceRequest[]
}

export default function Calls({ maintenanceRequests }: CallsProps) {
  // Show fallback if no data
  if (!maintenanceRequests || maintenanceRequests.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-2">
          <h2 className="font-medium text-foreground">Meus chamados</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">
            Nenhum chamado encontrado
          </p>
        </div>
      </div>
    )
  }

  // Sort requests by data_inicio (newest first)
  const sortedRequests = [...maintenanceRequests].sort((a, b) => {
    const dateA = a.data_inicio ? new Date(a.data_inicio).getTime() : 0
    const dateB = b.data_inicio ? new Date(b.data_inicio).getTime() : 0
    return dateB - dateA // Descending order (newest first)
  })

  return (
    <div className="p-6">
      <div className="mb-2">
        <h2 className="font-medium text-foreground">Meus chamados</h2>
      </div>
      <CallsAccordion requests={sortedRequests} />
    </div>
  )
}
