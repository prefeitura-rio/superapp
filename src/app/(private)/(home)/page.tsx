import bolsaFamilia from '@/assets/bolsaFamilia.svg'
import icon1746 from '@/assets/icon1746.svg'
import updateEmail from '@/assets/updateEmail.svg'
import updateNumber from '@/assets/updateNumber.svg'
import Image from 'next/image'
import Link from 'next/link'
import MainHeader from '../components/main-header'

export default function Home() {
  return (
    <main className="flex max-w-md mx-auto pt-15 flex-col bg-background text-white">
      <MainHeader />
      {/* Header */}
      <header className="p-5">
        <h1 className="text-2xl font-bold">Olá, Marina</h1>
        <p className="text-sm text-gray-300">
          Seja bem-vinda à Prefeitura do Rio
        </p>
      </header>

      {/* Horizontal scrolling cards */}
      <div className="relative w-full overflow-x-auto pb-4 no-scrollbar">
        <div className="flex gap-4 px-5 w-max">
          <div className="w-[200px] h-[160px] bg-zinc-800 rounded-lg overflow-hidden flex flex-col">
            <div className="flex-1 p-4 flex items-center justify-center">
              <Image
                src={updateNumber}
                alt="Pessoa sentada em uma poltrona azul"
                className="h-20 w-auto"
              />
            </div>
            <div className="p-4 pt-0">
              <p className="text-sm font-medium">
                Atualize
                <br />
                seu celular
              </p>
            </div>
          </div>

          <div className="w-[200px] h-[160px] bg-zinc-800 rounded-lg overflow-hidden flex flex-col">
            <div className="flex-1 p-4 flex items-center justify-center">
              <Image
                src={updateEmail}
                alt="Pessoa sentada em uma mesa com computador"
                className="h-20 w-auto"
              />
            </div>
            <div className="p-4 pt-0">
              <p className="text-sm font-medium">
                Atualize
                <br />
                seu email
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Carteira section */}
      <section className="px-5 mt-6">
        <h2 className="text-xl font-bold mb-4">Carteira</h2>

        <div className="relative h-[470px] w-full">
          {/* Overlapping cards */}
          <Link
            href="/wallet/chamados"
            className="absolute top-[180px] left-0 right-0 h-[200px] bg-green-100 rounded-3xl z-30 shadow-md"
          >
            <div className="p-6 text-black h-full flex flex-col">
              <div className="flex justify-between">
                <h3 className="text-lg font-medium">Zeladoria</h3>
                <Image
                  src={icon1746} // Replace with your image path
                  alt="Zeladoria"
                  width={50}
                  height={19}
                  className="h-8 w-auto"
                />
              </div>
              <div className="mt-auto">
                <div className="flex gap-12">
                  <div className="flex flex-col items-left">
                    <span className="text-sm">Chamados</span>
                    <span className="text-lg font-medium">29</span>
                  </div>
                  <div className="flex flex-col items-left">
                    <span className="text-sm">Abertos</span>
                    <span className="text-lg font-medium">3</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          <Link
            href="/wallet/beneficios"
            className="absolute top-[90px] left-0 right-0 h-[200px] bg-yellow-100 rounded-3xl z-20 shadow-md"
          >
            <div className="p-6 text-black h-full flex flex-col">
              <div className="flex justify-between">
                <div>
                  <h1 className="text-md font-medium">Bolsa Família</h1>
                  <h3 className="text-xl font-medium">6352 7758 4323</h3>
                </div>
                <Image
                  src={bolsaFamilia} // Replace with your image path
                  alt="Bolsa Família"
                  width={60}
                  height={60}
                  className="h-12 w-auto"
                />
              </div>
            </div>
          </Link>

          <Link
            href="/wallet/saude"
            className="absolute top-0 left-0 right-0 h-[200px] bg-blue-100 rounded-3xl z-10 shadow-md"
          >
            <div className="p-6 text-black h-full flex flex-col">
              <div className="flex justify-between">
                <div>
                  <h1 className="text-md font-medium">Clínica da Família</h1>
                  <h3 className="text-xl font-medium">Marina Sebastiana</h3>
                </div>
                {/* <Image
                  src="/path-to-your-image.png" // Replace with your image path
                  alt="Clínica da Família"
                  width={60}
                  height={60}
                  className="h-12 w-auto"
                /> */}
              </div>
              <div className="mt-auto">
                <span className="text-sm">PROCEAMA</span>
                <span className="text-sm block">Família</span>
              </div>
            </div>
          </Link>
        </div>
      </section>
    </main>
  )
}
