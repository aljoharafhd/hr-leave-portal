import ChatPanel from '../components/ChatPanel'

/**
 * Full-screen chat page that renders the AgentCore AI assistant panel.
 * Covers FR5.
 */
export default function ChatPage() {
  return (
    <section
      data-testid="chat-page"
      style={{ display: 'flex', flexDirection: 'column', height: '75vh' }}
    >
      <h1 style={{ marginBottom: '1rem' }}>AI HR Assistant</h1>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ChatPanel />
      </div>
    </section>
  )
}
