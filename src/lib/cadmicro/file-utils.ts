import { formatFileSizeLabel } from '@/lib/cadmicro/mappers'

export function isPdfName(name?: string | null) {
  return !!name && /\.pdf$/i.test(name)
}

export function isImageAsset(fileName: string, url: string) {
  return !isPdfName(fileName) && !isPdfName(url)
}

export { formatFileSizeLabel }
