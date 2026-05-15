'use client'

import { useQuery } from '@tanstack/react-query'
import MainHeader from './main-header'
import SearchPlaceholder from './search-placeholder'

async function fetchHeaderData() {
  const response = await fetch('/api/user/header', {
    cache: 'no-store',
    credentials: 'include',
  })
  if (!response.ok)
    return {
      isLoggedIn: false,
      userName: '',
      userAvatarUrl: null,
      userAvatarName: null,
    }
  return response.json()
}

export default function HeaderWrapperClient() {
  const { data, isLoading } = useQuery({
    queryKey: ['header'],
    queryFn: fetchHeaderData,
    staleTime: 5 * 60 * 1000,
  })

  return (
    <>
      <MainHeader
        userName={data?.userName ?? ''}
        isLoggedIn={data?.isLoggedIn ?? false}
        showSearchIcon={true}
        userAvatarUrl={data?.userAvatarUrl ?? null}
        userAvatarName={data?.userAvatarName ?? null}
        isLoading={isLoading}
      />

      <div>
        <SearchPlaceholder />
      </div>
    </>
  )
}
