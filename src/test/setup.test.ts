import { describe, expect, it } from 'vitest'

describe('Test Setup', () => {
  it('should have test environment configured', () => {
    expect(process.env.BASE_API_URL_RMI).toBe('http://localhost:3001')
    expect(process.env.COURSES_BASE_API_URL).toBe('http://localhost:3002')
  })
})
