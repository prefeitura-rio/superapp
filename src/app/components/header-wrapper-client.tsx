'use client'

import MainHeader from './main-header'
import SearchPlaceholder from './search-placeholder'

export default function HeaderWrapperClient() {
  return (
    <>
      <MainHeader />

      <div>
        <SearchPlaceholder />
      </div>
    </>
  )
}
