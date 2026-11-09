/**
 * Tests for agentClient.ts
 * FR5.1 — invokeAgent sends prompt + messages + actorId
 * FR5.4 — throws AgentNotConfiguredError when VITE_AGENTCORE_ENDPOINT is unset
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Use mockImplementation (not mockResolvedValue) so vi.clearAllMocks() does not
// wipe the return value between describe blocks.
vi.mock('aws-amplify/auth', () => ({
  fetchAuthSession: vi.fn().mockImplementation(async () => ({
    tokens: {
      idToken: { toString: () => 'mock-jwt-token' },
    },
  })),
}))

import { invokeAgent, AgentNotConfiguredError } from '../api/agentClient'

describe('invokeAgent — happy path', () => {
  beforeEach(() => {
    sessionStorage.clear()
    import.meta.env.VITE_AGENTCORE_ENDPOINT = 'https://agent.example.com/prod'
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ response: 'Hello from agent' }),
      }),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    sessionStorage.clear()
  })

  it('sends prompt, messages, and actorId, returns response text', async () => {
    const result = await invokeAgent('Hello', [], 'user-1')

    expect(result).toBe('Hello from agent')

    const fetchMock = vi.mocked(fetch)
    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/invocations')

    const body = JSON.parse(options.body as string) as {
      prompt: string
      messages: unknown[]
      actorId: string
    }
    expect(body.prompt).toBe('Hello')
    expect(body.messages).toEqual([])
    expect(body.actorId).toBe('user-1')

    const headers = options.headers as Record<string, string>
    expect(headers['Authorization']).toBe('Bearer mock-jwt-token')
    expect(headers['X-Amzn-Bedrock-AgentCore-Runtime-Session-Id']).toBeTruthy()
  })

  it('persists and reuses the session ID across calls', async () => {
    await invokeAgent('msg1', [], 'user-1')
    await invokeAgent('msg2', [], 'user-1')

    const fetchMock = vi.mocked(fetch)
    const headers1 = (fetchMock.mock.calls[0] as [string, RequestInit])[1]
      .headers as Record<string, string>
    const headers2 = (fetchMock.mock.calls[1] as [string, RequestInit])[1]
      .headers as Record<string, string>

    expect(headers1['X-Amzn-Bedrock-AgentCore-Runtime-Session-Id']).toBe(
      headers2['X-Amzn-Bedrock-AgentCore-Runtime-Session-Id'],
    )
  })
})

describe('invokeAgent — AgentNotConfiguredError', () => {
  beforeEach(() => {
    sessionStorage.clear()
    import.meta.env.VITE_AGENTCORE_ENDPOINT = ''
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  it('throws AgentNotConfiguredError when VITE_AGENTCORE_ENDPOINT is empty', async () => {
    await expect(invokeAgent('test', [], 'user-1')).rejects.toThrow(
      AgentNotConfiguredError,
    )
  })
})
