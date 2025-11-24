import { NextResponse } from 'next/server'
import {
  getDalCitizenCpf,
  getDalCitizenCpfAvatar,
} from '@/lib/dal'
import { getUserInfoFromToken } from '@/lib/user-info'
import { getDisplayName } from '@/lib/utils'

export async function GET() {
  try {
    const userAuthInfo = await getUserInfoFromToken()
    const isLoggedIn = !!(userAuthInfo.cpf && userAuthInfo.name)

    if (!isLoggedIn) {
      return NextResponse.json({
        isLoggedIn: false,
        userName: '',
        userAvatarUrl: null,
        userAvatarName: null,
      })
    }

    let userAvatarUrl: string | null = null
    let userAvatarName: string | null = null
    let userDisplayName = ''

    // Buscar dados completos do usuário para obter nome_exibicao
    try {
      const userDataResponse = await getDalCitizenCpf(userAuthInfo.cpf)
      if (userDataResponse.status === 200) {
        const userData = userDataResponse.data
        userDisplayName = getDisplayName(
          userData.nome_exibicao,
          userAuthInfo.name
        )
      } else {
        userDisplayName = getDisplayName(undefined, userAuthInfo.name)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      userDisplayName = getDisplayName(undefined, userAuthInfo.name)
    }

    // Fetch user's current avatar using DAL
    try {
      const userAvatarResponse = await getDalCitizenCpfAvatar(userAuthInfo.cpf)
      if (userAvatarResponse.status === 200 && userAvatarResponse.data.avatar) {
        userAvatarUrl = userAvatarResponse.data.avatar.url || null
        userAvatarName = userAvatarResponse.data.avatar.name || null
      }
    } catch (error) {
      console.log('Could not fetch user avatar:', error)
    }

    return NextResponse.json({
      isLoggedIn: true,
      userName: userDisplayName || userAuthInfo.name,
      userAvatarUrl,
      userAvatarName,
    })
  } catch (error) {
    console.error('Error in header API route:', error)
    return NextResponse.json(
      {
        isLoggedIn: false,
        userName: '',
        userAvatarUrl: null,
        userAvatarName: null,
        error: 'Failed to fetch user data',
      },
      { status: 500 }
    )
  }
}

