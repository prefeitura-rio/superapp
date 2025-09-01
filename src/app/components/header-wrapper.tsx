'use client'

import MainHeader from './main-header'
import SearchPlaceholder from './search-placeholder'

interface HeaderWrapper {
  userName: string
  isLoggedIn: boolean
  userAvatarUrl?: string | null
  userAvatarName?: string | null
}

export default function ScrollAwareHeader({
  userName,
  isLoggedIn,
  userAvatarUrl,
  userAvatarName,
}: HeaderWrapper) {
  return (
    <>
      <MainHeader
        userName={userName}
        isLoggedIn={isLoggedIn}
        showSearchIcon={true}
        userAvatarUrl={userAvatarUrl}
        userAvatarName={userAvatarName}
      />

      <div>
        <SearchPlaceholder />
      </div>
    </>
  )
}
