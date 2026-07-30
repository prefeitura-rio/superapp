import Link from 'next/link'

export default function RequestsSectionCards() {
  return (
    <>
      <div className="px-4 pb-4">
        <div className="flex flex-col gap-2 p-4 rounded-2xl bg-card">
          <h2 className="text-md font-medium text-foreground">Solicitações</h2>

          {/* Row: Minhas Solicitações + Consulta de Protocolo */}
          <div className="flex gap-2">
            <Link href="/minhas-solicitacoes" className="flex-1">
              <div className="flex flex-col justify-end items-start gap-4 h-22.25 p-4 rounded-2xl bg-background hover:bg-secondary transition-colors cursor-pointer">
                <span className="text-sm font-normal text-foreground leading-snug">
                  Minhas
                  <br />
                  Solicitações
                </span>
              </div>
            </Link>
            <Link href="/consulta-protocolo" className="flex-1">
              <div className="flex flex-col justify-end items-start gap-4 h-22.25 p-4 rounded-2xl bg-background hover:bg-secondary transition-colors cursor-pointer">
                <span className="text-sm font-normal text-foreground leading-snug">
                  Consulta de
                  <br />
                  Protocolo
                </span>
              </div>
            </Link>
          </div>

          {/* Full-width: Ouvidoria */}
          <Link href="/ouvidoria">
            <div className="flex flex-col items-start gap-2 p-4 rounded-2xl bg-background hover:bg-secondary transition-colors cursor-pointer">
              <span className="text-sm font-normal text-foreground leading-snug">
                Ouvidoria
              </span>
            </div>
          </Link>

          {/* Full-width: Lei de acesso à informação */}
          <Link href="/acesso-a-informacao">
            <div className="flex flex-col items-start gap-2 p-4 rounded-2xl bg-background hover:bg-secondary transition-colors cursor-pointer">
              <span className="text-sm font-normal text-foreground leading-snug">
                Lei de acesso à informação
              </span>
            </div>
          </Link>
        </div>
      </div>
    </>
  )
}
