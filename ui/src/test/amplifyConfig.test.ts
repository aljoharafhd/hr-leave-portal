/**
 * Tests for amplifyConfig.ts
 * FR1 / NFR1.1 — Amplify config must expose only public Cognito identifiers;
 * no secrets (client secret, AWS keys) should be present.
 */
import { describe, it, expect, beforeEach } from 'vitest'

describe('amplifyConfig', () => {
  beforeEach(() => {
    // Inject the required Vite env vars before each test
    import.meta.env.VITE_USER_POOL_ID = 'us-east-1_TestPool'
    import.meta.env.VITE_USER_POOL_CLIENT_ID = 'testclientid123456'
    import.meta.env.VITE_API_URL = 'https://api.example.com/prod/'
    import.meta.env.VITE_AGENTCORE_ENDPOINT = 'https://agent.example.com/prod/'
  })

  it('exports an Auth.Cognito section with userPoolId', async () => {
    // Re-import fresh so env vars are in scope
    const { amplifyConfig } = await import('../amplifyConfig')
    expect(amplifyConfig.Auth).toBeDefined()
    expect(amplifyConfig.Auth.Cognito).toBeDefined()
    expect(amplifyConfig.Auth.Cognito.userPoolId).toBe('us-east-1_TestPool')
  })

  it('exports an Auth.Cognito section with userPoolClientId', async () => {
    const { amplifyConfig } = await import('../amplifyConfig')
    expect(amplifyConfig.Auth.Cognito.userPoolClientId).toBe('testclientid123456')
  })

  it('does not include a client secret (NFR1.1)', async () => {
    const { amplifyConfig } = await import('../amplifyConfig')
    // The config object must not contain any key named "secret"
    const configStr = JSON.stringify(amplifyConfig).toLowerCase()
    expect(configStr).not.toContain('secret')
  })

  it('does not include AWS access keys (NFR1.1)', async () => {
    const { amplifyConfig } = await import('../amplifyConfig')
    const configStr = JSON.stringify(amplifyConfig).toLowerCase()
    expect(configStr).not.toContain('accesskey')
    expect(configStr).not.toContain('secretkey')
  })
})
