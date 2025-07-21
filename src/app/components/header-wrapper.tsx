'use client'

import MainHeader from './main-header'
import SearchPlaceholder from './search-placeholder'

interface HeaderWrapper {
  userName: string
}

export default function ScrollAwareHeader({ userName }: HeaderWrapper) {
  return (
    <>
      <MainHeader userName={userName} showSearchIcon={true} />

      <div>
        <SearchPlaceholder />
      </div>
    </>
  )
}
