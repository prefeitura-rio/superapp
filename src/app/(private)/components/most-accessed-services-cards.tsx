import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard, MoveDiagonal } from "lucide-react";

export default function MostAccessedServiceCards() {
  return (
    <>
      <h2 className="text-md font-medium mb-4 px-5 pt-4">Mais acessados</h2>
      <div className="relative w-full overflow-x-auto pb-2 no-scrollbar">
        <div className="flex gap-4 px-5 w-max">
          {/* IPTU Card */}
          <div className="bg-zinc-900 rounded-lg p-5 hover:bg-zinc-800 transition-colors cursor-pointer flex flex-col items-start justify-between w-[180px] h-[180px] min-w-[180px] max-w-[180px] min-h-[180px] max-h-[180px] border border-muted">
            <div className="mb-4">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-1 break-words">IPTU</h3>
            <p className="text-zinc-400 text-sm break-words">
              Pague com desconto no PIX
            </p>
          </div>

          {/* CAD Rio Card */}
          <div className="bg-zinc-900 rounded-lg p-5 hover:bg-zinc-800 transition-colors cursor-pointer relative flex flex-col items-start justify-between w-[180px] h-[180px] min-w-[180px] max-w-[180px] min-h-[180px] max-h-[180px] border border-muted">
            <div className="mb-4 flex justify-between w-full">
              <Calendar className="w-8 h-8 text-white" />
              <Badge className="bg-[#A0BFF9] text-black text-xs px-3 py-0 rounded-full font-medium ml-2">
                novo
              </Badge>
            </div>
            <h3 className="text-xl font-semibold mb-1 break-words">CAD Rio</h3>
            <p className="text-zinc-400 text-sm break-words">
              Agende seu cadastro único
            </p>
          </div>

          {/* ITBI Card */}
          <div className="bg-zinc-900 rounded-lg p-5 hover:bg-zinc-800 transition-colors cursor-pointer flex flex-col items-start justify-between w-[180px] h-[180px] min-w-[180px] max-w-[180px] min-h-[180px] max-h-[180px] border border-muted">
            <div className="mb-4">
              <MoveDiagonal className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-1 break-words">ITBI</h3>
            <p className="text-zinc-400 text-sm break-words">
              Pague com desconto no PIX
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
