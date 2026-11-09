import { fetchAuthSession } from 'aws-amplify/auth'
import type { ChatMessage } from '../types'

/** Thrown when VITE_AGENTCORE_ENDPOINT is not configured. */
export class AgentNotConfiguredError extends Error {
  constructor() {
    super(
      'AI assistant not configured — set VITE_AGENTCORE_ENDPOINT to enable the chat panel.',
    )
    this.name = 'AgentNotConfiguredError'
  }
}

/** Thrown on non-200 responses from the AgentCore proxy. */
export class AgentInvocationError extends Error {
  readonly status: number
  readonly body: string

  constructor(status: number, body: string) {
    super(`AgentCore invocation failed (${status}): ${body}`)
    this.name = 'AgentInvocationError'
    this.status = status
    this.body = body
  }
}

/** Session ID key used in sessionStorage. Generated once per browser tab. */
const SESSION_ID_KEY = 'agentcore-session-id'

/** Return the current tab's AgentCore session ID, generating one if absent. */
function getOrCreateSessionId(): string {
  let sessionId = sessionStorage.getItem(SESSION_ID_KEY)
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    sessionStorage.setItem(SESSION_ID_KEY, sessionId)
  }
  return sessionId
}

/**
 * Invoke the AgentCore hrAgent via the configured API Gateway proxy.
 *
 * Sends `{ prompt, messages, actorId }` to `VITE_AGENTCORE_ENDPOINT/invocations`
 * with a Cognito JWT in the Authorization header and the runtime session ID in
 * `X-Amzn-Bedrock-AgentCore-Runtime-Session-Id`.
 *
 * Throws `AgentNotConfiguredError` when the endpoint env var is not set.
 * Throws `AgentInvocationError` on non-200 responses.
 */
export async function invokeAgent(
  prompt: string,
  messages: ChatMessage[],
  actorId: string,
): Promise<string> {
  const endpoint = import.meta.env.VITE_AGENTCORE_ENDPOINT as string | undefined
  if (!endpoint) {
    throw new AgentNotConfiguredError()
  }

  const session = await fetchAuthSession()
  const token = session.tokens?.idToken?.toString()
  if (!token) {
    throw new Error('No active Cognito session — please sign in.')
  }

  const sessionId = getOrCreateSessionId()
  // Normalise endpoint: strip trailing slash, then append /invocations
  const url = `${endpoint.replace(/\/$/, '')}/invocations`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Amzn-Bedrock-AgentCore-Runtime-Session-Id': sessionId,
    },
    body: JSON.stringify({ prompt, messages, actorId }),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new AgentInvocationError(response.status, body)
  }

  const data = (await response.json()) as { response?: string; output?: string }
  // Support both { response: "..." } and { output: "..." } shapes from proxy implementations
  return data.response ?? data.output ?? ''
}
