import bolsaFamilia from '@/assets/bolsaFamilia.svg'
import icon1746 from '@/assets/icon1746.svg'
import Image from 'next/image'
import Link from 'next/link'
import MainHeader from '../components/main-header'

export default function Wallet() {
  return (
    <>
      <MainHeader />
      <main className="max-w-md mx-auto pt-15 text-white">
        <section className="px-5 relative h-full pb-26">
          <h2 className="text-2xl font-bold mb-6 sticky top-15 bg-background z-10 pt-6 pb-3">
            Carteira
          </h2>

          <div className="flex flex-col gap-4 overflow-y-auto h-full pt-2 -mt-4">
            {/* Card 1: Clínica da Família */}
            <Link
              href="/wallet/saude"
              className="block w-full bg-blue-100 rounded-3xl shadow-md text-black"
            >
              <div className="p-6 h-full flex flex-col">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Clínica da Família</h3>
                    <h2 className="text-lg font-semibold">
                      Maria Sebastiana de Oliveira
                    </h2>
                  </div>
                </div>
                <div className="mt-4 flex gap-8">
                  <div>
                    <span className="text-xs block">Situação</span>
                    <span className="text-sm font-medium">Normal</span>
                  </div>
                  <div>
                    <span className="text-xs block">
                      Horário de atendimento
                    </span>
                    <span className="text-sm font-medium">7h às 18h</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Card 2: Bolsa Família */}
            <Link
              href="/wallet/beneficios"
              className="block w-full bg-yellow-100 rounded-3xl shadow-md text-black"
            >
              <div className="p-6 h-full flex flex-col">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium">Bolsa Família</h3>
                    <h2 className="text-lg font-semibold">6352 7758 4323</h2>
                  </div>
                  <div className="h-10 w-20 relative">
                    <Image
                      src={bolsaFamilia}
                      alt="Bolsa Família"
                      width={80}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-2.5 sm:gap-8">
                  <div>
                    <span className="text-xs block">Status</span>
                    <span className="text-sm font-medium">
                      Atualizar cadastro
                    </span>
                  </div>
                  <div>
                    <span className="text-xs block">
                      Data de recadastramento
                    </span>
                    <span className="text-sm font-medium">17.06.2025</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Card 3: Zeladoria */}
            <Link
              href="/wallet/chamados"
              className="block w-full bg-green-100 rounded-3xl shadow-md text-black"
            >
              <div className="p-6 h-full flex flex-col">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-medium">Zeladoria</h3>
                  <div className="h-10 w-20 relative">
                    <Image
                      src={icon1746}
                      alt="Bolsa Família"
                      width={80}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-8">
                  <div>
                    <span className="text-xs block">Chamados</span>
                    <span className="text-sm font-medium">29</span>
                  </div>
                  <div>
                    <span className="text-xs block">Abertos</span>
                    <span className="text-sm font-medium">3</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
