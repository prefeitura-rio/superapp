import alvaraIcon from '@/assets/icons/png/alvara-icon.png'
import cadrioIcon from '@/assets/icons/png/cadrio-icon.png'
import cadunicoIcon from '@/assets/icons/png/cadunico-icon.png'
import dividaativaIcon from '@/assets/icons/png/dividaativa-icon.png'
import iptuIcon from '@/assets/icons/png/iptu-icon.png'
import licencasanitariaIcon from '@/assets/icons/png/licencasanitaria-icon.png'
import multasIcon from '@/assets/icons/png/multas-icon.png'
import Link from 'next/link'

export default function MostAccessedServiceCards({
  showMore,
}: { showMore: boolean }) {
  return (
    <>
      <div className="flex items-center justify-between mb-2 px-4">
        <h2 className="text-md font-medium text-foreground"> Mais acessados</h2>
        {showMore && (
          <Link
            href="/services"
            className="text-md text-muted-foreground cursor-pointer font-normal"
          >
            Ver mais
          </Link>
        )}
      </div>
      <div className="relative w-full overflow-x-auto pb-2 no-scrollbar">
        <div className="flex gap-2 px-4 w-max">
          {/* IPTU Card */}
          <div className="bg-card rounded-lg p-3.5 hover:bg-card/50 transition-colors cursor-pointer flex flex-col items-start justify-between w-[140px] h-[140px] min-w-[140px] max-w-[140px] min-h-[140px] max-h-[140px]">
            <div className="mb-4">
              <img src={iptuIcon.src} alt="IPTU" className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-base font-medium break-words text-foreground">
                IPTU
              </h3>
              <p className="text-foreground-light text-xs leading-4 break-words">
                Pague com desconto no PIX
              </p>
            </div>
          </div>

          {/* CAD Rio Card */}
          <div className="bg-card  rounded-lg p-3.5 hover:bg-card/50  transition-colors cursor-pointer relative flex flex-col items-start justify-between w-[140px] h-[140px] min-w-[140px] max-w-[140px] min-h-[140px] max-h-[140px]">
            <div className="mb-4 flex justify-between w-full">
              <img src={cadrioIcon.src} alt="CAD Rio" className="w-10 h-10" />
              {/* <Badge className="bg-[#A0BFF9] text-black text-xs px-2 py-1 rounded-full font-medium ml-2 w-[44px] h-[20px]">
                novo
              </Badge> */}
            </div>
            <div>
              <h3 className="text-base font-medium break-words text-foreground">
                CAD Rio
              </h3>
              <p className="text-foreground-light text-xs leading-4 break-words">
                Agende seu atendimento
              </p>
            </div>
          </div>

          {/* Multas Card */}
          <div className="bg-card rounded-lg p-3.5 hover:bg-card/50  transition-colors cursor-pointer flex flex-col items-start justify-between w-[140px] h-[140px] min-w-[140px] max-w-[140px] min-h-[140px] max-h-[140px]">
            <div className="mb-4">
              <img src={multasIcon.src} alt="Multas" className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-base font-medium break-words text-foreground">
                Multas
              </h3>
              <p className="text-foreground-light text-xs leading-4 break-words">
                Consulta de multas de trânsito
              </p>
            </div>
          </div>
          {/* Alvará Card */}
          <div className="bg-card rounded-lg p-3.5 hover:bg-card/30 transition-colors cursor-pointer flex flex-col items-start justify-between w-[140px] h-[140px] min-w-[140px] max-w-[140px] min-h-[140px] max-h-[140px]">
            <div className="mb-4">
              <img src={alvaraIcon.src} alt="Alvará" className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-base font-medium break-words text-foreground">
                Alvará
              </h3>
              <p className="text-foreground-light text-xs leading-4 break-words">
                Consulta prévia de local
              </p>
            </div>
          </div>
          {/* Licença sanitária Card */}
          <div className="bg-card rounded-lg p-3.5 hover:bg-card/30 transition-colors cursor-pointer flex flex-col items-start justify-between w-[140px] h-[140px] min-w-[140px] max-w-[140px] min-h-[140px] max-h-[140px]">
            <div className="mb-4">
              <img
                src={licencasanitariaIcon.src}
                alt="Licença sanitária"
                className="w-10 h-10"
              />
            </div>
            <div>
              <h3 className="text-base font-medium break-words text-foreground">
                Licença Sani...
              </h3>
              <p className="text-foreground-light text-xs leading-4 break-words">
                Veja ou solicite o documento
              </p>
            </div>
          </div>
          {/* Cadúnico Card */}
          <div className="bg-card rounded-lg p-3.5 hover:bg-card/30 transition-colors cursor-pointer flex flex-col items-start justify-between w-[140px] h-[140px] min-w-[140px] max-w-[140px] min-h-[140px] max-h-[140px]">
            <div className="mb-4">
              <img
                src={cadunicoIcon.src}
                alt="Cadúnico"
                className="w-10 h-10"
              />
            </div>
            <div>
              <h3 className="text-base font-medium break-words text-foreground">
                CadÚnico
              </h3>
              <p className="text-foreground-light text-xs leading-4 break-words">
                Consulte e atualize seus dados
              </p>
            </div>
          </div>
          {/* Dívida ativa Card */}
          <div className="bg-card rounded-lg p-3.5 hover:bg-card/30 transition-colors cursor-pointer flex flex-col items-start justify-between w-[140px] h-[140px] min-w-[140px] max-w-[140px] min-h-[140px] max-h-[140px]">
            <div className="mb-4">
              <img
                src={dividaativaIcon.src}
                alt="Dívida ativa"
                className="w-10 h-10"
              />
            </div>
            <div>
              <h3 className="text-base font-medium break-words text-foreground">
                Dívida ativa
              </h3>
              <p className="text-foreground-light text-xs leading-4 break-words">
                Consulte dívidas de IPTU
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
