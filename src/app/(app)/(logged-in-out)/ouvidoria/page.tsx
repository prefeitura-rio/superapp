import { SecondaryHeader } from "@/app/components/secondary-header";
import autofalante from "@/assets/autofalante.png";
import { ChevronRightIcon } from "@/assets/icons/chevron-right-icon";
import joia from "@/assets/joinha.png";
import lampada from "@/assets/lampada.png";
import Image from "next/image";
import Link from "next/link";

export default function OuvidoriaPage() {
   return (
    <div className="pt-20 pb-4 min-h-lvh max-w-xl mx-auto text-foreground flex flex-col">
      {/* Header */}
      <SecondaryHeader title="" className="max-w-xl" />

      <section className="relative">
        <div className="flex flex-col mb-6 pt-2 ">
          <span className="text-sm px-4 font-normal text-muted-foreground bg-background z-10">
            Bem-vindo à Ouvidoria
          </span>
        
          <h2 className="text-3xl px-4 font-medium leading-9 text-foreground bg-background z-10">
            Sua voz é importante <br /> para <span className="text-primary">melhorarmos os serviços da cidade </span> 
          </h2>
        </div>
      </section>

      {/* Feedback Cards */}
      <div className="px-4 space-y-2">
        {/* Elogio Card */}
        <Link 
          href="https://www.1746.rio/hc/pt-br/articles/13791534748187-Elogio"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <div className="bg-card rounded-2xl p-4 xl:p-6 hover:bg-card/50 transition-colors">
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
              <Image src={joia} alt="Elogio" width={40} height={40} />
              <div className="text-left">
                <h3 className="font-normal leading-5 text-sm text-foreground">Elogio</h3>
                <p className="text-xs text-muted-foreground">
                  Conte para gente o que lhe agradou em nossos serviços
                </p>
              </div>
              <div className="text-muted-foreground">
                <ChevronRightIcon />
              </div>
            </div>
          </div>
        </Link>

        {/* Sugestão Card */}
        <Link 
          href="https://www.1746.rio/hc/pt-br/articles/13791513095451-Sugest%C3%A3o"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <div className="bg-card rounded-2xl p-4 xl:p-6 hover:bg-card/50 transition-colors">
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
              <Image src={lampada} alt="Sugestão" width={40} height={40} />
              <div className="text-left">
                <h3 className="font-normal leading-5 text-sm text-foreground">Sugestão</h3>
                <p className="text-xs text-muted-foreground">
                 Queremos sua contribuição para melhorar nossos serviços e políticas públicas.          
               </p>
              </div>
              <div className="text-muted-foreground">
                <ChevronRightIcon />
              </div>
            </div>
          </div>
        </Link>

        {/* Reclamação Card */}
        <Link 
          href="/ouvidoria/reclamacao"
          className="block"
        >
          <div className="bg-card rounded-2xl p-4 xl:p-6 hover:bg-card/50 transition-colors">
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
              <Image src={autofalante} alt="Reclamação" width={40} height={40} />
              <div className="text-left">
                <h3 className="font-normal leading-5 text-sm text-foreground">Reclamação</h3>
                <p className="text-xs text-muted-foreground">
                 Diga o que não funcionou bem para buscarmos uma solução
                </p>
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
