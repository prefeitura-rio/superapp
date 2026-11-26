import Image from 'next/image'
import Link from 'next/link'
import { bannerCursosIcon, bannerTrabalhoIcon } from '@/constants/bucket/banners'

function BannerCursos() {
  return (
    <Link
      href="/servicos/cursos"
      className="relative flex h-60 sm:h-40 flex-1 flex-col items-start gap-6 overflow-hidden rounded-2xl p-4"
      style={{ background: 'hsl(214.2857deg 43.75% 87.451%)' }}
    >
      {/* Grupo mobile: quadrados + imagem centralizados horizontalmente como unidade */}
      <div
        className="pointer-events-none absolute sm:hidden"
        style={{ inset: 0 }}
      >
        {/* Quadrado maior (atrás) */}
        <div
          style={{
            position: 'absolute',
            width: '142.833px',
            height: '142.833px',
            right: 'calc(50% - 117.42px)',
            bottom: '-49.75px',
            borderRadius: '16px',
            background: 'hsl(214.0541deg 38.9474% 81.3725%)',
            boxShadow: '2px -2px 6px 0 rgba(0,0,0,0.15)',
            transform: 'rotate(-135deg)',
          }}
        />
        {/* Quadrado menor (frente) */}
        <div
          style={{
            position: 'absolute',
            width: '102.295px',
            height: '102.295px',
            right: 'calc(50% - 97.3px)',
            bottom: '-29.48px',
            borderRadius: '16px',
            background: 'hsl(214.6667deg 32.3741% 72.7451%)',
            boxShadow: '2px -2px 6px 0 rgba(0,0,0,0.15)',
            transform: 'rotate(-135deg)',
          }}
        />
        {/* Imagem */}
        <Image
          src={bannerCursosIcon}
          alt=""
          width={92}
          height={166}
          style={{
            position: 'absolute',
            right: 'calc(50% - 46px)',
            bottom: '-49px',
          }}
        />
      </div>

      {/* Grupo desktop: quadrados + imagem ancorados à direita como unidade */}
      <div
        className="pointer-events-none absolute hidden sm:block"
        style={{ position: 'absolute', right: '0', top: '0', bottom: '0', left: '0' }}
      >
        {/* Quadrado maior (atrás) */}
        <div
          style={{
            position: 'absolute',
            width: '205.061px',
            height: '205.061px',
            right: '-20.56px',
            top: '49.5px',
            borderRadius: '22.971px',
            background: 'hsl(214.0541deg 38.9474% 81.3725%)',
            boxShadow: '2px -2px 6px 0 rgba(0,0,0,0.15)',
            transform: 'rotate(-135deg)',
          }}
        />
        {/* Quadrado menor (frente) */}
        <div
          style={{
            position: 'absolute',
            width: '136.52px',
            height: '136.52px',
            right: '13.77px',
            top: '83.7px',
            borderRadius: '22.971px',
            background: 'hsl(214.6667deg 32.3741% 72.7451%)',
            boxShadow: '2px -2px 6px 0 rgba(0,0,0,0.15)',
            transform: 'rotate(-135deg)',
          }}
        />
        {/* Imagem */}
        <Image
          src={bannerCursosIcon}
          alt=""
          width={132}
          height={239}
          style={{
            position: 'absolute',
            right: '69.15px',
            top: '15.13px',
          }}
        />
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 flex flex-col">
        <p className="text-sm sm:text-base font-medium text-foreground leading-4 sm:leading-5 tracking-normal">
          Cursos Gratuitos
        </p>
        <p className="text-xs sm:text-sm font-normal leading-4 sm:leading-5 tracking-normal" style={{ color: '#45556C' }}>
          Aulas presenciais e online
        </p>
        <span
          className="inline-flex items-center rounded-full bg-white self-start text-xs sm:text-sm font-normal leading-4 sm:leading-5 tracking-normal mt-4.25"
          style={{ padding: '2px 12px', color: '#1D293D' }}
        >
          Ver cursos
        </span>
      </div>
    </Link>
  )
}

function BannerTrabalho() {
  return (
    <Link
      href="/servicos/trabalho"
      className="relative flex h-60 sm:h-40 flex-1 flex-col items-start gap-6 overflow-hidden rounded-2xl p-4"
      style={{ background: 'hsl(214.0909deg 37.2881% 53.7255%)' }}
    >
      {/* Bolas + imagem — grupo desktop ancorado à direita */}
      <div
        className="pointer-events-none absolute hidden sm:block"
        style={{ inset: 0 }}
      >
        {/* Bola maior — mesmo centro da bola menor */}
        <div
          style={{
            position: 'absolute',
            width: '222.829px',
            height: '218.417px',
            right: '25.1px',
            top: '31.47px',
            borderRadius: '1242.403px',
            background: 'rgba(255,255,255,0.15)',
            boxShadow: '1.244px 1.244px 9.079px 0 rgba(255,255,255,0.13) inset, 0 4.975px 41.04px 0 rgba(255,255,255,0.25)',
            transform: 'rotate(45deg)',
          }}
        />
        {/* Bola menor */}
        <div
          style={{
            position: 'absolute',
            width: '158.889px',
            height: '155.743px',
            right: '57.07px',
            top: '62.81px',
            borderRadius: '1242.403px',
            background: 'rgba(255,255,255,0.15)',
            boxShadow: '1.244px 1.244px 9.079px 0 rgba(255,255,255,0.13) inset, 0 4.975px 41.04px 0 rgba(255,255,255,0.25)',
            transform: 'rotate(45deg)',
          }}
        />
        {/* Imagem */}
        <Image
          src={bannerTrabalhoIcon}
          alt=""
          width={152}
          height={275}
          style={{
            position: 'absolute',
            right: '60.51px',
            top: '5.37px',
          }}
        />
      </div>

      {/* Bola menor — mobile */}
      <div
        className="pointer-events-none absolute sm:hidden"
        style={{
          width: '127.761px',
          height: '125.231px',
          left: '50%',
          top: '146.82px',
          borderRadius: '999px',
          background: 'rgba(255,255,255,0.15)',
          boxShadow: '1px 1px 7.3px 0 rgba(255,255,255,0.13) inset, 0 4px 33px 0 rgba(255,255,255,0.25)',
          transform: 'translateX(-50%) rotate(45deg)',
        }}
      />
      {/* Bola maior — mobile */}
      <div
        className="pointer-events-none absolute sm:hidden"
        style={{
          width: '179.174px',
          height: '175.626px',
          left: '50%',
          top: '121.63px',
          borderRadius: '999px',
          background: 'rgba(255,255,255,0.15)',
          boxShadow: '1px 1px 7.3px 0 rgba(255,255,255,0.13) inset, 0 4px 33px 0 rgba(255,255,255,0.25)',
          transform: 'translateX(-50%) rotate(45deg)',
        }}
      />
      {/* Imagem da personagem — mobile */}
      <Image
        src={bannerTrabalhoIcon}
        alt=""
        width={119}
        height={216}
        className="pointer-events-none absolute object-cover sm:hidden"
        style={{ left: '50%', bottom: '-96px', transform: 'translateX(-50%)' }}
      />

      {/* Conteúdo */}
      <div className="relative z-10 flex flex-col">
        <p className="text-sm sm:text-base font-medium text-white leading-4 sm:leading-5 tracking-normal">
          Vagas de Trabalho
        </p>
        <p className="text-xs sm:text-sm font-normal leading-4 sm:leading-5 tracking-normal text-white/80">
          Cadastre o seu currículo
        </p>
        <span
          className="inline-flex items-center rounded-full bg-white self-start text-xs sm:text-sm font-normal leading-4 sm:leading-5 tracking-normal mt-4.25"
          style={{ padding: '2px 12px', color: '#1D293D' }}
        >
          Ver vagas
        </span>
      </div>
    </Link>
  )
}

export function OportunidadesCariocas() {
  return (
    <div className="px-4 mt-6">
      <h2 className="text-md font-medium text-foreground mb-2">
        Oportunidades Cariocas
      </h2>
      <div className="flex gap-2">
        <BannerCursos />
        <BannerTrabalho />
      </div>
    </div>
  )
}
