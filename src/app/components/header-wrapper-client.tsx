'use client'

import { useEffect, useState } from 'react'
import MainHeader from './main-header'
import SearchPlaceholder from './search-placeholder'

interface HeaderData {
  isLoggedIn: boolean
  userName: string
  userAvatarUrl?: string | null
  userAvatarName?: string | null
}

export default function HeaderWrapperClient() {
  const [headerData, setHeaderData] = useState<HeaderData>({
    isLoggedIn: false,
    userName: '',
    userAvatarUrl: null,
    userAvatarName: null,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchHeaderData() {
      try {
        const response = await fetch('/api/user/header', {
          cache: 'no-store',
        })
        if (response.ok) {
          const data = await response.json()
          setHeaderData(data)
        } else {
          console.error('Failed to fetch header data:', response.status)
        }
      } catch (error) {
        console.error('Error fetching header data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHeaderData()
  }, [])

  return (
    <>
      <MainHeader
        userName={headerData.userName}
        isLoggedIn={headerData.isLoggedIn}
        showSearchIcon={true}
        userAvatarUrl={headerData.userAvatarUrl}
        userAvatarName={headerData.userAvatarName}
        isLoading={isLoading}
      />

      <div>
        <SearchPlaceholder />
      </div>
    </>
  )
}
