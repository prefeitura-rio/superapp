import { NextResponse } from 'next/server'

export async function GET() {
  // limpa os cookies de autenticação
  const response = NextResponse.redirect('http://localhost:3000/sign-in')
  response.cookies.set('access_token', '', { path: '/', httpOnly: true, maxAge: 0 })
  response.cookies.set('refresh_token', '', { path: '/', httpOnly: true, maxAge: 0 })
  return response
}
