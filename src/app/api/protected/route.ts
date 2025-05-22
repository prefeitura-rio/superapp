import { type NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value
  if (!token)
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  // requisições autenticadas do app
  const resp = await fetch('https://jsonplaceholder.typicode.com/todos/1', {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await resp.json()
  return NextResponse.json(data)
}
