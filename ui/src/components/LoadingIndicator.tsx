/**
 * Simple animated spinner shown while awaiting an async operation.
 * Covers NFR2 — visible with an aria-label for screen readers.
 */
export default function LoadingIndicator() {
  return (
    <span
      data-testid="loading-indicator"
      role="status"
      aria-label="Loading…"
      style={{
        display: 'inline-block',
        width: '1.25rem',
        height: '1.25rem',
        border: '3px solid #e5e7eb',
        borderTopColor: '#0070f3',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        verticalAlign: 'middle',
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </span>
  )
}
