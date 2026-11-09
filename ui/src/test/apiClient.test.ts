/**
 * Tests for apiClient.ts
 * FR1.4 — Bearer token attached to every request
 * FR2   — Employee endpoint happy path + 404 error path
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock aws-amplify/auth permanently for all tests in this file.
// Using mockImplementation rather than mockResolvedValue so vi.clearAllMocks()
// does not wipe the return value (clearAllMocks resets calls/instances but
// does NOT reset implementations; restoreAllMocks would, so we avoid it here).
vi.mock('aws-amplify/auth', () => ({
  fetchAuthSession: vi.fn().mockImplementation(async () => ({
    tokens: {
      idToken: { toString: () => 'mock-jwt-token' },
    },
  })),
}))

import.meta.env.VITE_API_URL = 'https://api.example.com/prod'

import { getEmployees, createEmployee, getEmployee, ApiError } from '../api/apiClient'

// ---------------------------------------------------------------------------

describe('getEmployees', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve([
            {
              employee_id: 'emp-1',
              name: 'Alice',
              department: 'Engineering',
              role: 'Engineer',
              start_date: '2024-01-01',
            },
          ]),
      }),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('attaches Authorization: Bearer header and returns employee array', async () => {
    const result = await getEmployees()
    expect(result[0].name).toBe('Alice')

    const fetchMock = vi.mocked(fetch)
    expect(fetchMock).toHaveBeenCalledOnce()
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect((options.headers as Record<string, string>)['Authorization']).toBe(
      'Bearer mock-jwt-token',
    )
  })
})

describe('createEmployee', () => {
  const payload = {
    name: 'Bob',
    department: 'HR',
    role: 'Manager',
    start_date: '2024-06-01',
  }

  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ employee_id: 'emp-2', ...payload }),
      }),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sends the correct request body and returns the created employee', async () => {
    const result = await createEmployee(payload)
    expect(result.name).toBe('Bob')

    const fetchMock = vi.mocked(fetch)
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/employees')
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body as string)).toEqual(payload)
  })
})

describe('getEmployee 404 path', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: () => Promise.resolve('Not found'),
      }),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('throws ApiError with status 404 when employee not found', async () => {
    await expect(getEmployee('nonexistent')).rejects.toThrow(ApiError)
    await expect(getEmployee('nonexistent')).rejects.toMatchObject({
      status: 404,
    })
  })
})
