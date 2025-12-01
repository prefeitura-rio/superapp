import { MOST_ACCESSED_SERVICES } from '@/constants/most-accessed-services'
import { MostAccessedServiceLink } from './most-accessed-service-link'

interface MostAccessedServiceCardsProps {
  limit?: number
}

export default function MostAccessedServiceCards({
  limit,
}: MostAccessedServiceCardsProps = {}) {
  const services = limit
    ? MOST_ACCESSED_SERVICES.slice(0, limit)
    : MOST_ACCESSED_SERVICES

  return (
    <>
      <div className="flex items-center justify-between mb-2 px-4">
        <h2 className="text-md font-medium text-foreground">Mais acessados</h2>
      </div>
      {/* Cards: expand to fill width, same size, with horizontal scroll when needed */}
      <div className="relative w-full overflow-x-auto pb-2 no-scrollbar">
        <div className="flex gap-2 px-4 min-w-full">
          {services.map((service, index) => (
            <MostAccessedServiceLink
              key={service.id}
              service={service}
              position={index + 1}
              className="flex-1 min-w-[140px] basis-0"
            >
              <div className="bg-card rounded-lg p-3.5 hover:bg-card/50 transition-colors cursor-pointer flex flex-col items-start justify-end min-h-[140px] w-full h-full">
                <div className="w-full">
                  <h3 className="text-base font-medium break-words text-foreground">
                    {service.title}
                  </h3>
                  <p className="text-foreground-light text-xs leading-4 break-words">
                    {service.description}
                  </p>
                </div>
              </div>
            </MostAccessedServiceLink>
          ))}
        </div>
      </div>
    </>
  )
}
