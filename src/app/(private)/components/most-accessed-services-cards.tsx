import { Badge } from '@/components/ui/badge'
import {
  Book,
  Briefcase,
  Calendar,
  CreditCard,
  MoveDiagonal,
} from 'lucide-react'

export default function MostAccessedServiceCards() {
  return (
    <>
      <h2 className="text-md font-medium mb-4 px-5 pt-4">Mais acessados</h2>
      <div className="relative w-full overflow-x-auto pb-2 no-scrollbar">
        <div className="flex gap-4 px-5 w-max">
          {/* IPTU Card */}
          <div className="bg-zinc-900 rounded-lg p-3.5 hover:bg-zinc-800 transition-colors cursor-pointer flex flex-col items-start justify-between w-[150px] h-[150px] min-w-[150px] max-w-[150px] min-h-[150px] max-h-[150px] border border-muted">
            <div className="mb-4">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold break-words">IPTU</h3>
              <p className="text-zinc-400 text-sm break-words">
                Pague com desconto no PIX
              </p>
            </div>
          </div>

          {/* CAD Rio Card */}
          <div className="bg-zinc-900 rounded-lg p-3.5 hover:bg-zinc-800 transition-colors cursor-pointer relative flex flex-col items-start justify-between w-[150px] h-[150px] min-w-[150px] max-w-[150px] min-h-[150px] max-h-[150px] border border-muted">
            <div className="mb-4 flex justify-between w-full">
              <Calendar className="w-8 h-8 text-white" />
              <Badge className="bg-[#A0BFF9] text-black text-xs px-3 py-0 rounded-full font-medium ml-2">
                novo
              </Badge>
            </div>
            <div>
              <h3 className="text-xl font-semibold break-words">CAD Rio</h3>
              <p className="text-zinc-400 text-sm break-words">
                Agende seu cadastro único
              </p>
            </div>
          </div>

          {/* ITBI Card */}
          <div className="bg-zinc-900 rounded-lg p-3.5 hover:bg-zinc-800 transition-colors cursor-pointer flex flex-col items-start justify-between w-[150px] h-[150px] min-w-[150px] max-w-[150px] min-h-[150px] max-h-[150px] border border-muted">
            <div className="mb-4">
              <MoveDiagonal className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold break-words">ITBI</h3>
              <p className="text-zinc-400 text-sm break-words">
                Pague com desconto no PIX
              </p>
            </div>
          </div>
          {/* Cursos Card */}
          <div className="bg-zinc-900 rounded-lg p-3.5 hover:bg-zinc-800 transition-colors cursor-pointer flex flex-col items-start justify-between w-[150px] h-[150px] min-w-[150px] max-w-[150px] min-h-[150px] max-h-[150px] border border-muted">
            <div className="mb-4">
              <Book className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold break-words">Cursos</h3>
              <p className="text-zinc-400 text-sm break-words">
                Amplie suas habilidades
              </p>
            </div>
          </div>
          {/* Empregos Card */}
          <div className="bg-zinc-900 rounded-lg p-3.5 hover:bg-zinc-800 transition-colors cursor-pointer flex flex-col items-start justify-between w-[150px] h-[150px] min-w-[150px] max-w-[150px] min-h-[150px] max-h-[150px] border border-muted">
            <div className="mb-4">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold break-words">Empregos</h3>
              <p className="text-zinc-400 text-sm break-words">
                Oportunidades de trabalho
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
