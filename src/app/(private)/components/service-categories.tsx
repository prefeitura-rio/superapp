import ambienteIcon from '@/assets/icons/png/ambiente-icon.png'
import animaisIcon from '@/assets/icons/png/animais-icon.png'
import cadRioIcon from '@/assets/icons/png/cadrio-icon.png'
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
import Image from 'next/image'

export function ServiceCategories() {
  return [
    {
      name: 'Cidade',
      icon: <Image src={cidadeIcon} alt="Cidade" />,
      // tag: 'desconto',
    },
    { name: 'Transporte', icon: <Image src={cadRioIcon} alt="Transporte" /> },
    { name: 'Saúde', icon: <Image src={saudeIcon} alt="Saúde" /> },
    { name: 'Educação', icon: <Image src={educacaoIcon} alt="Educação" /> },
    { name: 'Ambiente', icon: <Image src={ambienteIcon} alt="Ambiente" /> },
    { name: 'Impostos', icon: <Image src={impostoIcon} alt="Impostos" /> },
    { name: 'Cidadania', icon: <Image src={cidadaniaIcon} alt="Cidadania" /> },
    {
      name: 'Emergência',
      icon: <Image src={emergenciaIcon} alt="Emergência" />,
    },
    { name: 'Servidor', icon: <Image src={servidorIcon} alt="Servidor" /> },
    { name: 'Segurança', icon: <Image src={segurancaIcon} alt="Segurança" /> },
    { name: 'Trabalho', icon: <Image src={trabalhoIcon} alt="Trabalho" /> },
    { name: 'Família', icon: <Image src={familiaIcon} alt="Família" /> },
    { name: 'Cultura', icon: <Image src={culturaIcon} alt="Cultura" /> },
    { name: 'Licenças', icon: <Image src={licencaIcon} alt="Licenças" /> },
    { name: 'Esportes', icon: <Image src={esporteIcon} alt="Esportes" /> },
    { name: 'Animais', icon: <Image src={animaisIcon} alt="Animais" /> },
  ]
}
