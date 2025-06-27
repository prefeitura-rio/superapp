import boyStudying from "@/assets/boyStudying.svg";
import smilingWoman from "@/assets/smilingWoman.svg";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export default function SuggestionCards() {
  return (
    <div className="relative w-full overflow-x-auto pb-4 no-scrollbar">
      <div className="flex gap-4 px-5 w-max">
        <div className="w-[85vw] max-w-[350px] h-[152px] bg-[#A0BFF9] rounded-lg overflow-hidden flex flex-col relative">
          <Badge className="bg-[#F65600] font-normal text-white z-10 absolute top-5 left-6">
            com desconto
          </Badge>
          <p className="text-xl font-medium z-10 absolute bottom-3 text-black left-6">
            Pague seu <br />
            <span className="font-bold">IPTU</span> no PIX
          </p>
          <Image
            src={smilingWoman}
            alt="Pessoa sentada em uma poltrona azul"
            className="h-38 w-auto absolute -bottom-4 -right-4 z-20"
          />
        </div>
        <div className="w-[85vw] max-w-[350px] bg-[#B3DDE9] h-[152px] rounded-lg overflow-hidden flex flex-col relative">
          <p className="text-xl text-black font-medium z-10 absolute bottom-3 left-6">
            Encontre
            <br />
            seu <span className="font-bold">Curso</span>
          </p>
          <Image
            src={boyStudying}
            alt="Pessoa sentada em uma poltrona azul"
            className="h-36 w-auto absolute -bottom-4 -right-0 z-20"
          />
        </div>
      </div>
    </div>
  );
}
