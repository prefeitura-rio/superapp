import { CARTA_SERVICOS_API_ENABLED } from '@/constants/venvs'
import { SearchPage } from './search-page'

export default function Search() {
  return <SearchPage cartaServicosEnabled={CARTA_SERVICOS_API_ENABLED} />
}
