import updateEmail from '@/assets/updateEmail.svg'
import updateNumber from '@/assets/updateNumber.svg'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex max-w-md mx-auto flex-col bg-background text-white">
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

        <div className="relative h-[410px] w-full">
          {/* Overlapping cards */}
          <Link
            href="/wallet/chamados"
            className="absolute top-[200px] left-0 right-0 h-[200px] bg-[#d0f7e6] rounded-3xl z-30 shadow-md"
          >
            <div className="p-6 text-black">
              <h3 className="text-lg font-medium">Chamados do 1746</h3>
            </div>
          </Link>

          <Link
            href="/wallet/beneficios"
            className="absolute top-[100px] left-0 right-0 h-[200px] bg-[#fff2cc] rounded-3xl z-20 shadow-md"
          >
            <div className="p-6 text-black">
              <h3 className="text-lg font-medium">Benefícios sociais</h3>
            </div>
          </Link>

          <Link
            href="/wallet/saude"
            className="absolute top-0 left-0 right-0 h-[200px] bg-[#d6e8ff] rounded-3xl z-10 shadow-md"
          >
            <div className="p-6 text-black">
              <h3 className="text-lg font-medium">Saúde</h3>
            </div>
          </Link>
        </div>
      </section>
    </main>
  )
}
