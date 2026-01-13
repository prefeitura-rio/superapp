import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, test } from 'vitest'
import { server } from '@/test/mocks/server'
import { AuthHeaderProvider, useAuthHeader } from '../auth-header-provider'

// Test component that consumes the context
function TestConsumer() {
  const { data, isLoading } = useAuthHeader()

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <span data-testid="is-logged-in">{data.isLoggedIn ? 'true' : 'false'}</span>
      <span data-testid="user-name">{data.userName}</span>
    </div>
  )
}

describe('AuthHeaderProvider', () => {
  test('renders children', () => {
    server.use(
      http.get('/api/user/header', () => {
        return HttpResponse.json({ isLoggedIn: false })
      })
    )

    render(
      <AuthHeaderProvider>
        <div>Child content</div>
      </AuthHeaderProvider>
    )

    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  test('shows loading state initially', () => {
    server.use(
      http.get('/api/user/header', async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
        return HttpResponse.json({ isLoggedIn: false })
      })
    )

    render(
      <AuthHeaderProvider>
        <TestConsumer />
      </AuthHeaderProvider>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  test('provides isLoggedIn=true when user is authenticated', async () => {
    server.use(
      http.get('/api/user/header', () => {
        return HttpResponse.json({
          isLoggedIn: true,
          userName: 'Test User',
          userAvatarUrl: null,
          userAvatarName: null,
        })
      })
    )

    render(
      <AuthHeaderProvider>
        <TestConsumer />
      </AuthHeaderProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('is-logged-in')).toHaveTextContent('true')
    })
    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User')
  })

  test('provides isLoggedIn=false when user is not authenticated', async () => {
    server.use(
      http.get('/api/user/header', () => {
        return HttpResponse.json({
          isLoggedIn: false,
          userName: '',
          userAvatarUrl: null,
          userAvatarName: null,
        })
      })
    )

    render(
      <AuthHeaderProvider>
        <TestConsumer />
      </AuthHeaderProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('is-logged-in')).toHaveTextContent('false')
    })
    expect(screen.getByTestId('user-name')).toHaveTextContent('')
  })

  test('handles API error gracefully', async () => {
    server.use(
      http.get('/api/user/header', () => {
        return HttpResponse.json({ error: 'Server error' }, { status: 500 })
      })
    )

    render(
      <AuthHeaderProvider>
        <TestConsumer />
      </AuthHeaderProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('is-logged-in')).toHaveTextContent('false')
    })
  })
})
