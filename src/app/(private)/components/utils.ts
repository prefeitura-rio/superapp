import googleIcon from '@/assets/google.svg'
import prefeituraVertical from '@/assets/prefeituraVertical.svg'
import senac from '@/assets/senac.svg'
import senaiIcon from '@/assets/senai.svg'

export function getCardColor(type: string) {
  if (type === 'technology' || type === 'ai' || type === 'education')
    return '#01A9D8'
  if (type === 'construction') return '#44CC77'
  if (type === 'environment') return '#EA5D6E'
  return '#01A9D8'
}

export const providerIcons: Record<string, string> = {
  Google: googleIcon,
  SENAI: senaiIcon,
  Prefeitura: prefeituraVertical,
  SENAC: senac,
}
