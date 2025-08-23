import { SecondaryHeader } from "@/app/components/secondary-header";
import autofalante2 from "@/assets/autofalante2.png";
import autofalante3 from "@/assets/autofalante3.png";
import { ChevronRightIcon } from "@/assets/icons/chevron-right-icon";
import Image from "next/image";
import Link from "next/link";

export default function ReclamacaoPage() {
   return (
    <div className="pt-20 pb-4 min-h-lvh max-w-xl mx-auto text-foreground flex flex-col">
      {/* Header */}
      <SecondaryHeader title="" className="max-w-xl" />

      <section className="relative">
        <div className="flex flex-col mb-6 pt-2 ">
          <span className="text-sm px-4 font-normal text-muted-foreground bg-background z-10">
            Reclamação
          </span>
          <h2 className="text-3xl px-4 font-medium leading-9 text-foreground bg-background z-10">
            Você já fez uma  <br /> reclamação sobre este <br/> assunto? 
          </h2>
        </div>
      </section>

      {/* Feedback Cards */}
      <div className="px-4 space-y-2">
        {/* Elogio Card */}
        <Link  target="_blank"
          rel="noopener noreferrer"
          className="block" href="https://www.1746.rio/hc/pt-br/articles/13791438677787-Cr%C3%ADtica">
        <div className="bg-card rounded-2xl p-4 xl:p-6 hover:bg-card/50 transition-colors">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
            <Image src={autofalante2} alt="Elogio" width={40} height={40} />
            <div className="text-left">
              <h3 className="font-normal leading-5 text-sm text-foreground">Primeira reclamação</h3>
              <p className="text-xs text-muted-foreground">
               Para críticas sobre serviços ou políticas públicas
              </p>
            </div>
            <div className="text-muted-foreground">
              <ChevronRightIcon />
            </div>
          </div>
        </div>
        </Link>

        {/* Sugestão Card */}
        <Link  target="_blank"
          rel="noopener noreferrer"
          className="block" href="https://www.1746.rio/hc/pt-br/articles/13790696897051-Reclama%C3%A7%C3%A3o">
        <div className="bg-card rounded-2xl p-4 xl:p-6 hover:bg-card/50 transition-colors">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
            <Image src={autofalante3} alt="Elogio" width={40} height={40} />
            <div className="text-left">
              <h3 className="font-normal leading-5 text-sm text-foreground">Já fiz uma reclamação</h3>
              <p className="text-xs text-muted-foreground">
                Para acompanhar reclamações  já feitas              </p>
            </div>
            <div className="text-muted-foreground">
              <ChevronRightIcon />
            </div>
          </div>
        </div>
        </Link>
      </div>
    </div>
  );
}   
