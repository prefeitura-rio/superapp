import { MOST_ACCESSED_SERVICES } from '@/constants/most-accessed-services'
import { MostAccessedServiceLink } from './most-accessed-service-link'

export default function MostAccessedServiceCards() {
  return (
    <>
      <div className="flex items-center justify-between mb-2 px-4">
        <h2 className="text-md font-medium text-foreground"> Mais acessados</h2>
      </div>
      <div className="relative w-full overflow-x-auto pb-2 no-scrollbar">
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex gap-2 px-4 w-max ">
            {MOST_ACCESSED_SERVICES.map((service, index) => (
              <MostAccessedServiceLink
                key={service.id}
                service={service}
                position={index + 1}
                aria-label={`Acessar o serviço ${service.title}`}
              >
                <div className="bg-card rounded-lg p-3.5 hover:bg-card/50 transition-colors cursor-pointer flex flex-col items-start justify-between min-w-[140px] max-w-[140px] min-h-[140px] max-h-[140px]">
                  <div className="mb-4">
                    <img
                      src={service.icon}
                      alt={`Ícone do serviço ${service.title}`}
                      className="w-10 h-10"
                    />
                  </div>
                  <div>
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
      </div>
    </>
  )
}
