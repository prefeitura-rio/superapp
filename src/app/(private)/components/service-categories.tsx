import ambienteIcon from '@/assets/icons/png/ambiente-icon.png'
import animaisIcon from '@/assets/icons/png/animais-icon.png'
import cidadaniaIcon from '@/assets/icons/png/cidadania-icon.png'
import cidadeIcon from '@/assets/icons/png/cidade-icon.png'
import culturaIcon from '@/assets/icons/png/cultura-icon.png'
import educacaoIcon from '@/assets/icons/png/educacao-icon.png'
import emergenciaIcon from '@/assets/icons/png/emergencia-icon.png'
import esporteIcon from '@/assets/icons/png/esporte-icon.png'
import familiaIcon from '@/assets/icons/png/familia-icon.png'
import impostoIcon from '@/assets/icons/png/imposto-icon.png'
import licencaIcon from '@/assets/icons/png/licenca-icon.png'
import saudeIcon from '@/assets/icons/png/saude-icon.png'
import segurancaIcon from '@/assets/icons/png/seguranca-icon.png'
import servidorIcon from '@/assets/icons/png/servidor-icon.png'
import trabalhoIcon from '@/assets/icons/png/trabalho-icon.png'
import transporteIcon from '@/assets/icons/png/transporte-icon.png'
import Image from 'next/image'

export function ServiceCategories() {
  return [
    {
      name: 'Cidade',
      icon: <Image src={cidadeIcon} alt="Cidade" />,
      categorySlug: 'cidade',
      // tag: 'desconto',
    },
    {
      name: 'Transporte',
      icon: <Image src={transporteIcon} alt="Transporte" />,
      categorySlug: 'transporte',
    },
    {
      name: 'Saúde',
      icon: <Image src={saudeIcon} alt="Saúde" />,
      categorySlug: 'saude',
    },
    {
      name: 'Educação',
      icon: <Image src={educacaoIcon} alt="Educação" />,
      categorySlug: 'educacao',
    },
    {
      name: 'Ambiente',
      icon: <Image src={ambienteIcon} alt="Ambiente" />,
      categorySlug: 'ambiente',
    },
    {
      name: 'Cidadania',
      icon: <Image src={cidadaniaIcon} alt="Cidadania" />,
      categorySlug: 'cidadania',
    },
    {
      name: 'Emergência',
      icon: <Image src={emergenciaIcon} alt="Emergência" />,
      categorySlug: 'emergencia',
    },
    {
      name: 'Servidor',
      icon: <Image src={servidorIcon} alt="Servidor" />,
      categorySlug: 'servidor',
    },
    {
      name: 'Segurança',
      icon: <Image src={segurancaIcon} alt="Segurança" />,
      categorySlug: 'seguranca',
    },
    {
      name: 'Trabalho',
      icon: <Image src={trabalhoIcon} alt="Trabalho" />,
      categorySlug: 'trabalho',
    },
    {
      name: 'Família',
      icon: <Image src={familiaIcon} alt="Família" />,
      categorySlug: 'familia',
    },
    {
      name: 'Cultura',
      icon: <Image src={culturaIcon} alt="Cultura" />,
      categorySlug: 'cultura',
    },
    {
      name: 'Licenças',
      icon: <Image src={licencaIcon} alt="Licenças" />,
      categorySlug: 'licencas',
    },
    {
      name: 'Esportes',
      icon: <Image src={esporteIcon} alt="Esportes" />,
      categorySlug: 'esportes',
    },
    {
      name: 'Impostos',
      icon: <Image src={impostoIcon} alt="Impostos" />,
      categorySlug: 'impostos',
    },
    {
      name: 'Animais',
      icon: <Image src={animaisIcon} alt="Animais" />,
      categorySlug: 'animais',
    },
  ]
}
