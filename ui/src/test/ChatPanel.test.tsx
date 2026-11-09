/**
 * Tests for ChatPanel.tsx
 * FR5.2 — user message appended, loading indicator shown
 * FR5.3 — agent reply appended after response
 * FR5.4 — AgentNotConfiguredError banner shown when endpoint unset
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChatPanel from '../components/ChatPanel'
import { AgentNotConfiguredError } from '../api/agentClient'

vi.mock('@aws-amplify/ui-react', () => ({
  useAuthenticator: (_selector: unknown) => ({
    user: { userId: 'test-user' },
  }),
}))

vi.mock('../api/agentClient', () => ({
  invokeAgent: vi.fn(),
  AgentNotConfiguredError: class AgentNotConfiguredError extends Error {
    constructor() {
      super('AI assistant not configured — set VITE_AGENTCORE_ENDPOINT')
      this.name = 'AgentNotConfiguredError'
    }
  },
}))

import { invokeAgent } from '../api/agentClient'

function renderPanel() {
  return render(<ChatPanel />)
}

describe('ChatPanel', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders the chat messages container', () => {
    renderPanel()
    expect(screen.getByTestId('chat-messages')).toBeInTheDocument()
  })

  it('renders chat input and send button', () => {
    renderPanel()
    expect(screen.getByTestId('chat-input')).toBeInTheDocument()
    expect(screen.getByTestId('chat-send')).toBeInTheDocument()
  })

  it('appends user message and shows loading indicator on send (FR5.2, FR5.3)', async () => {
    vi.mocked(invokeAgent).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve('Agent reply'), 50)
        }),
    )

    const user = userEvent.setup()
    renderPanel()

    await user.type(screen.getByTestId('chat-input'), 'Hello agent')
    await user.click(screen.getByTestId('chat-send'))

    // User bubble appears immediately
    expect(screen.getByText('Hello agent')).toBeInTheDocument()

    // Loading indicator appears while waiting
    await waitFor(() => {
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()
    })

    // Agent reply appears after response
    await waitFor(() => {
      expect(screen.getByText('Agent reply')).toBeInTheDocument()
    })
  })

  it('shows agent-not-configured banner on AgentNotConfiguredError (FR5.4)', async () => {
    vi.mocked(invokeAgent).mockRejectedValue(new AgentNotConfiguredError())

    const user = userEvent.setup()
    renderPanel()

    await user.type(screen.getByTestId('chat-input'), 'test')
    await user.click(screen.getByTestId('chat-send'))

    await waitFor(() => {
      const banner = screen.getByTestId('agent-not-configured-banner')
      expect(banner).toBeInTheDocument()
      expect(banner).toHaveTextContent('VITE_AGENTCORE_ENDPOINT')
    })
  })
})
