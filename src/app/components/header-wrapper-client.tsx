'use client'

import { useHeaderData } from '@/hooks/use-header-data'
import MainHeader from './main-header'
import SearchPlaceholder from './search-placeholder'

export default function HeaderWrapperClient({
  showSearchPlaceholder = false,
}: { showSearchPlaceholder?: boolean }) {
  const { data, isLoading } = useHeaderData()

  return (
    <>
      <MainHeader
        userName={data?.userName ?? ''}
        isLoggedIn={data?.isLoggedIn ?? false}
        showSearchIcon={true}
        userAvatarUrl={data?.userAvatarUrl ?? null}
        userAvatarName={data?.userAvatarName ?? null}
        isLoading={isLoading}
        logoHref="/"
      />

      {showSearchPlaceholder && (
        <div>
          <SearchPlaceholder />
        </div>
      )}
    </>
  )
}
