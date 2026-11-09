import { useRef, useState } from 'react'
import { useAuthenticator } from '@aws-amplify/ui-react'
import { invokeAgent, AgentNotConfiguredError } from '../api/agentClient'
import type { ChatMessage } from '../types'
import LoadingIndicator from './LoadingIndicator'

/**
 * Conversational chat panel for the AgentCore hrAgent.
 * Maintains full message history in state so the agent receives prior turns.
 * Covers FR5.1–FR5.4.
 */
export default function ChatPanel() {
  const { user } = useAuthenticator((ctx) => [ctx.user])
  const actorId = user?.userId ?? 'anonymous'

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [agentNotConfigured, setAgentNotConfigured] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const prompt = input.trim()
    if (!prompt || loading) return

    const userMessage: ChatMessage = { role: 'user', content: prompt }
    const nextMessages = [...messages, userMessage]

    setMessages(nextMessages)
    setInput('')
    setLoading(true)
    setError(null)
    setAgentNotConfigured(false)

    try {
      const reply = await invokeAgent(prompt, nextMessages, actorId)
      const assistantMessage: ChatMessage = { role: 'assistant', content: reply }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      if (err instanceof AgentNotConfiguredError) {
        setAgentNotConfigured(true)
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong.')
      }
    } finally {
      setLoading(false)
      setTimeout(scrollToBottom, 50)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        gap: '0.75rem',
      }}
    >
      {agentNotConfigured && (
        <div
          data-testid="agent-not-configured-banner"
          role="alert"
          style={{
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '6px',
            padding: '0.75rem 1rem',
            color: '#92400e',
          }}
        >
          AI assistant not configured — set VITE_AGENTCORE_ENDPOINT
        </div>
      )}

      <div
        data-testid="chat-messages"
        aria-live="polite"
        aria-label="Chat messages"
        style={{
          flex: 1,
          overflowY: 'auto',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          padding: '1rem',
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          minHeight: '300px',
        }}
      >
        {messages.length === 0 && (
          <p style={{ color: '#9ca3af', textAlign: 'center', margin: 'auto' }}>
            Ask the HR assistant anything.
          </p>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            data-testid={`chat-bubble-${msg.role}`}
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              background: msg.role === 'user' ? '#0070f3' : '#f3f4f6',
              color: msg.role === 'user' ? '#fff' : '#1a1a1a',
              borderRadius: '12px',
              padding: '0.5rem 1rem',
              maxWidth: '80%',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {msg.content}
          </div>
        ))}

        {loading && (
          <div
            data-testid="chat-loading"
            style={{ alignSelf: 'flex-start' }}
          >
            <LoadingIndicator />
          </div>
        )}

        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={(e) => void handleSend(e)}
        style={{ display: 'flex', gap: '0.5rem' }}
        aria-label="Chat input"
      >
        <input
          data-testid="chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          aria-label="Chat message input"
          disabled={loading}
          style={{ flex: 1 }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          data-testid="chat-send"
          disabled={loading || !input.trim()}
          aria-label="Send message"
        >
          Send
        </button>
      </form>
    </div>
  )
}
