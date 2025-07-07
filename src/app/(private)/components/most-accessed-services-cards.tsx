import { Badge } from '@/components/ui/badge'
import {
  Book,
  Briefcase,
  Calendar,
  CreditCard,
  MoveDiagonal,
} from 'lucide-react'
import Link from 'next/link'

export default function MostAccessedServiceCards() {
  return (
    <>
      <div className="flex items-center justify-between mb-4 px-4 pt-5 ">
        <h2 className="text-md font-medium text-foreground"> Mais acessados</h2>
        <Link
          href="/services"
          className="text-md text-muted-foreground cursor-pointer font-normal"
        >
          Ver mais
        </Link>
      </div>
      <div className="relative w-full overflow-x-auto pb-2 no-scrollbar">
        <div className="flex gap-4 px-4 w-max">
          {/* IPTU Card */}
          <div className="bg-card/45 rounded-lg p-3.5 hover:bg-card/30 transition-colors cursor-pointer flex flex-col items-start justify-between w-[150px] h-[150px] min-w-[150px] max-w-[150px] min-h-[150px] max-h-[150px] border-2 border-card">
            <div className="mb-4">
              <CreditCard className="w-8 h-8 text-card-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-semibold break-words text-foreground">
                IPTU
              </h3>
              <p className="text-foreground/50 text-sm break-words">
                Pague com desconto no PIX
              </p>
            </div>
          </div>

          {/* CAD Rio Card */}
          <div className="bg-card/45  rounded-lg p-3.5 hover:bg-card/30  transition-colors cursor-pointer relative flex flex-col items-start justify-between w-[150px] h-[150px] min-w-[150px] max-w-[150px] min-h-[150px] max-h-[150px] border-2 border-card">
            <div className="mb-4 flex justify-between w-full">
              <Calendar className="w-8 h-8 text-card-foreground" />
              <Badge className="bg-[#A0BFF9] text-black text-xs px-2 py-1 rounded-full font-medium ml-2 w-[44px] h-[20px]">
                novo
              </Badge>
            </div>
            <div>
              <h3 className="text-xl font-semibold break-words text-foreground">
                CAD Rio
              </h3>
              <p className="text-foreground/50 text-sm break-words">
                Agende seu cadastro único
              </p>
            </div>
          </div>

          {/* ITBI Card */}
          <div className="bg-card/45  rounded-lg p-3.5 hover:bg-card/30  transition-colors cursor-pointer flex flex-col items-start justify-between w-[150px] h-[150px] min-w-[150px] max-w-[150px] min-h-[150px] max-h-[150px] border-2 border-card">
            <div className="mb-4">
              <MoveDiagonal className="w-8 h-8 text-card-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-semibold break-words text-foreground">
                ITBI
              </h3>
              <p className="text-foreground/50 text-sm break-words">
                Pague com desconto no PIX
              </p>
            </div>
          </div>
          {/* Cursos Card */}
          <div className="bg-card/45  rounded-lg p-3.5 hover:bg-card/30 transition-colors cursor-pointer flex flex-col items-start justify-between w-[150px] h-[150px] min-w-[150px] max-w-[150px] min-h-[150px] max-h-[150px] border-2 border-card">
            <div className="mb-4">
              <Book className="w-8 h-8 text-card-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-semibold break-words text-foreground">
                Cursos
              </h3>
              <p className="text-foreground/50 text-sm break-words">
                Amplie suas habilidades
              </p>
            </div>
          </div>
          {/* Empregos Card */}
          <div className="bg-card/45  rounded-lg p-3.5 hover:bg-card/30 transition-colors cursor-pointer flex flex-col items-start justify-between w-[150px] h-[150px] min-w-[150px] max-w-[150px] min-h-[150px] max-h-[150px] border-2 border-card">
            <div className="mb-4">
              <Briefcase className="w-8 h-8 text-card-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-semibold break-words text-foreground">
                Empregos
              </h3>
              <p className="text-foreground/50 text-sm break-words">
                Oportunidades de trabalho
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
