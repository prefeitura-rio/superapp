import bolsaFamilia from '@/assets/bolsaFamilia.svg'
import icon1746 from '@/assets/icon1746.svg'
import Image from 'next/image'
import Link from 'next/link'

export default function CarteiraSection() {
  return (
    <section className="px-5 mt-6 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-md font-medium">Carteira</h2>
        <Link
          href="/wallet"
          className="text-md text-[#A2A2A2] cursor-pointer font-medium"
        >
          ver tudo
        </Link>
      </div>

      <div className="flex flex-col gap-4 w-full">
        <Link
          href="/wallet/saude"
          className="h-[200px] bg-blue-100 rounded-3xl shadow-md"
        >
          <div className="p-6 text-black h-full flex flex-col">
            <div className="flex justify-between">
              <div>
                <h1 className="text-md font-medium">Clínica da Família</h1>
                <h3 className="text-xl font-medium">Marina Sebastiana</h3>
              </div>
            </div>
            <div className="mt-auto">
              <div className="flex gap-12">
                <div className="flex flex-col items-left">
                  <span className="text-xs">Situação</span>
                  <span className="text-sm font-medium">Normal</span>
                </div>
                <div className="flex flex-col items-left">
                  <span className="text-xs truncate max-w-[150px]">
                    Horário de Atendimento{' '}
                  </span>
                  <span className="text-sm font-medium">7h às 18h</span>
                </div>
              </div>
            </div>
          </div>
        </Link>

        <Link
          href="/wallet/beneficios"
          className="h-[200px] bg-yellow-100 rounded-3xl shadow-md"
        >
          <div className="p-6 text-black h-full flex flex-col">
            <div className="flex justify-between">
              <div>
                <h1 className="text-md font-medium">Bolsa Família</h1>
                <h3 className="text-xl font-medium">6352 7758 4323</h3>
              </div>
              <Image
                src={bolsaFamilia}
                alt="Bolsa Família"
                width={60}
                height={60}
                className="h-12 w-auto"
              />
            </div>
            <div className="mt-auto">
              <div className="flex gap-3">
                <div className="flex flex-col items-left">
                  <span className="text-xs">Status</span>
                  <span className="text-sm font-medium truncate max-w-[150px]">
                    Atualizar Cadastro
                  </span>
                </div>
                <div className="flex flex-col items-left">
                  <span className="text-xs truncate max-w-[150px]">
                    Data de recadastramento
                  </span>
                  <span className="text-sm font-medium">17.06.2025</span>
                </div>
              </div>
            </div>
          </div>
        </Link>

        <Link
          href="/wallet/chamados"
          className="h-[200px] bg-green-100 rounded-3xl shadow-md"
        >
          <div className="p-6 text-black h-full flex flex-col">
            <div className="flex justify-between">
              <h3 className="text-lg font-medium">Zeladoria</h3>
              <Image
                src={icon1746}
                alt="Zeladoria"
                width={50}
                height={19}
                className="h-8 w-auto"
              />
            </div>
            <div className="mt-auto">
              <div className="flex gap-12">
                <div className="flex flex-col items-left">
                  <span className="text-xs">Chamados</span>
                  <span className="text-sm font-medium">29</span>
                </div>
                <div className="flex flex-col items-left">
                  <span className="text-xs">Abertos</span>
                  <span className="text-sm font-medium">3</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  )
}
