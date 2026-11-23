/**
 * Carrossel de banners da home (v3) — Figma "Novo Banner".
 *
 * Três faixas de largura:
 * - mobile (< 500px): 120px de altura, texto nos 58% da esquerda;
 * - intermediário (500–767px): mesma altura, ilustração centrada em 79%;
 * - tablet/desktop (≥ 768px): 160px de altura, ilustração centrada em 75%.
 *
 * Gradientes, cores e posições vêm do Figma. Por isso as classes arbitrárias
 * ficam aqui, num só lugar.
 */
export type HomeBannerShape = 'circle' | 'diamond' | 'tilted-square'

export type HomeBanner = {
  id: 'boas-vindas' | 'trabalho' | 'cursos'
  title: string
  /** Subtítulo curto, até 767px. */
  subtitle: string
  /** Subtítulo longo, a partir de 768px. */
  subtitleWide: string
  /**
   * Espaço entre título e subtítulo. No Figma ele varia: 4px no
   * intermediário em todos os banners e no mobile só no banner de boas-vindas
   * (título em duas linhas); 0 no tablet/desktop.
   */
  subtitleClassName: string
  cta: string
  href: string
  /** Fundo em gradiente (classe Tailwind). */
  backgroundClassName: string
  /** Cor do texto do botão (classe Tailwind). */
  ctaClassName: string
  shape: HomeBannerShape
  illustration: {
    /**
     * PNG em `public/banners/home`, exportado do Figma em 4x a partir do banner
     * intermediário: é o tamanho em que a figura aparece mais inteira, então o
     * recorte cobre o que aparece nas três faixas de largura.
     */
    src: string
    width: number
    height: number
    alt: string
    /** Posição e largura por faixa de largura (classes Tailwind). */
    className: string
    sizes: string
  }
}

export const HOME_BANNER_AUTOPLAY_MS = 8000

export const homeBanners: HomeBanner[] = [
  {
    id: 'boas-vindas',
    title: 'Carioca Digital e 1746 agora são Pref.Rio',
    subtitle: 'Acesse tudo em um só lugar',
    subtitleWide: 'Acesse tudo o que você precisa da Prefeitura em um só lugar',
    subtitleClassName: 'mt-1 md:mt-0',
    cta: 'Saiba mais',
    href: '/servicos',
    backgroundClassName:
      'bg-[linear-gradient(135deg,#0A4FB0_0%,#1565D8_38.89%,#2083EC_70.71%)]',
    ctaClassName: 'text-[#0A4FB0]',
    shape: 'circle',
    illustration: {
      src: '/banners/home/boas-vindas.png',
      width: 600,
      height: 424,
      alt: '',
      className:
        'top-2 left-[83%] w-[205.8px] min-[500px]:top-3.5 min-[500px]:left-[79%] min-[500px]:w-[150px] md:top-[5.5px] md:left-[75%] md:w-[277px]',
      sizes: '(min-width: 768px) 277px, 206px',
    },
  },
  {
    id: 'trabalho',
    title: 'Encontre seu trabalho',
    subtitle: 'no Oportunidades Cariocas',
    subtitleWide: 'Cadastre seu currículo no Oportunidades Cariocas',
    subtitleClassName: 'min-[500px]:mt-1 md:mt-0',
    cta: 'Ver vagas',
    href: '/servicos/trabalho',
    backgroundClassName: 'bg-[linear-gradient(90deg,#0A6B8F_0%,#3A9DC6_100%)]',
    ctaClassName: 'text-[#0A6B8F]',
    shape: 'diamond',
    illustration: {
      src: '/banners/home/trabalho.png',
      width: 594,
      height: 480,
      alt: '',
      // O recorte começa 2px abaixo do topo da ilustração de 148,5px (1,35%).
      className:
        '-top-[9.75px] left-[85.2%] w-[166.7px] min-[500px]:top-0 min-[500px]:left-[79%] min-[500px]:w-[148.5px] md:-top-[17px] md:left-[75%] md:w-56',
      sizes: '(min-width: 768px) 224px, 167px',
    },
  },
  {
    id: 'cursos',
    title: 'Cursos da prefeitura',
    subtitle: 'Gratuitos e com certificado',
    subtitleWide:
      'Cursos gratuitos e com certificado no Oportunidades Cariocas',
    subtitleClassName: 'min-[500px]:mt-1 md:mt-0',
    cta: 'Ver cursos',
    href: '/servicos/cursos',
    backgroundClassName:
      'bg-[linear-gradient(135deg,#3556D6_0%,#5274EE_70.71%)]',
    ctaClassName: 'text-[#3556D6]',
    shape: 'tilted-square',
    illustration: {
      src: '/banners/home/cursos.png',
      width: 424,
      height: 416,
      alt: '',
      className:
        'top-4 left-[80%] w-[106px] min-[500px]:left-[79%] md:top-2 md:left-[75%] md:w-[166.6px]',
      sizes: '(min-width: 768px) 167px, 106px',
    },
  },
]
