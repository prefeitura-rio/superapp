'use client'

import MainHeader from './main-header'
import SearchPlaceholder from './search-placeholder'

interface HeaderWrapper {
  userName: string
  isLoggedIn: boolean
}

export default function ScrollAwareHeader({
  userName,
  isLoggedIn,
}: HeaderWrapper) {
  return (
    <>
      <MainHeader
        userName={userName}
        isLoggedIn={isLoggedIn}
        showSearchIcon={true}
      />

      <div>
        <SearchPlaceholder />
      </div>
    </>
  )
}
