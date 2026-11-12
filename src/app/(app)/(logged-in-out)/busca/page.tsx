import { isSalesforceServicesEnabled } from '@/lib/feature-flags'
import { SearchPage } from './search-page'

export default function Search() {
  return <SearchPage cartaServicosEnabled={isSalesforceServicesEnabled()} />
}
