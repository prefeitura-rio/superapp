import { ThemeAwareVideo } from '@/components/ui/custom/theme-aware-video'
import { MOST_ACCESSED_SERVICES } from '@/constants/most-accessed-services'
import { VIDEO_SOURCES } from '@/constants/videos-sources'
import type { MostAccessedCard } from '@/lib/carta-servicos/home-featured'
import { MostAccessedServiceLink } from './most-accessed-service-link'

interface MostAccessedServiceCardsProps {
  limit?: number
  /** Lista já resolvida (constante ou `home_featured`). Sem ela, usa a constante. */
  services?: MostAccessedCard[]
}

export default function MostAccessedServiceCards({
  limit,
  services: servicesProp,
}: MostAccessedServiceCardsProps = {}) {
  const source = servicesProp ?? MOST_ACCESSED_SERVICES
  const services = limit ? source.slice(0, limit) : source

  if (services.length === 0) {
    return (
      <div className="px-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-md font-medium text-foreground">
            Mais acessados
          </h2>
        </div>
        <div className="flex flex-col items-center text-center justify-center py-8">
          <ThemeAwareVideo
            source={VIDEO_SOURCES.emptyAddress}
            containerClassName="mb-6 flex items-center justify-center h-[min(328px,40vh)] max-h-[328px]"
          />
          <p className="text-lg text-muted-foreground">
            Ops... nenhum serviço encontrado
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-md font-medium text-foreground">Mais acessados</h2>
      </div>
      {/* Cards: expand to fill width, same size, with horizontal scroll when needed */}
      <div className="relative w-full overflow-x-auto pb-2 no-scrollbar">
        <div className="flex gap-2 min-w-full">
          {services.map((service, index) => (
            <MostAccessedServiceLink
              key={`${service.id}-${index}`}
              service={service}
              position={index + 1}
              className="flex-1 min-w-[140px] basis-0"
            >
              <div
                className={`bg-card rounded-2xl p-4 hover:bg-card/50 transition-colors cursor-pointer flex flex-col items-start min-h-[140px] w-full h-full ${service.icon ? 'justify-between' : 'justify-end'}`}
              >
                {service.icon ? (
                  <div className="mb-0">
                    {/* Decorativo: o título visível no <h3> já nomeia o link. */}
                    <img src={service.icon} alt="" className="w-10 h-10" />
                  </div>
                ) : null}
                <div className="w-full">
                  <h3 className="text-sm font-normal break-words text-foreground leading-4.5 line-clamp-3">
                    {service.title}
                  </h3>
                  {/* <p className="text-foreground-light text-xs leading-4 break-words">
                    {service.description}
                  </p> */}
                </div>
              </div>
            </MostAccessedServiceLink>
          ))}
          {/* Spacer to ensure padding at the end */}
          <div className="flex-shrink-0 sm:hidden w-2" />
        </div>
      </div>
    </div>
  )
}
