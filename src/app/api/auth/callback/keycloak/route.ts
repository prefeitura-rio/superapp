// src/app/api/auth/callback/keycloak/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  if (!code) return NextResponse.redirect('/sign-in');

  const tokenUrl = `${process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL}/token`;
  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_CLIENT_ID!,
    client_secret: process.env.IDENTIDADE_CARIOCA_CLIENT_SECRET!,
    grant_type: 'authorization_code',
    code,
    redirect_uri: process.env.NEXT_PUBLIC_IDENTIDADE_CARIOCA_REDIRECT_URI!,
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  if (!response.ok) return NextResponse.redirect('/sign-in');

  const data = await response.json();
  const res = NextResponse.redirect('http://localhost:3000/');
  res.cookies.set('access_token', data.access_token, { httpOnly: true, path: '/' });
  res.cookies.set('refresh_token', data.refresh_token, { httpOnly: true, path: '/' });
  return res;
}