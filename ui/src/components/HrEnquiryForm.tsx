import { useState } from 'react'
import { useAuthenticator } from '@aws-amplify/ui-react'
import { submitHrRequest } from '../api/apiClient'

/**
 * Form for submitting a general HR enquiry workflow via POST /hr-requests.
 * Pre-fills the user ID from the authenticated Cognito user's sub.
 * Displays the execution ARN on success (202 accepted).
 * Covers FR4.2.
 */
export default function HrEnquiryForm() {
  const { user } = useAuthenticator((ctx) => [ctx.user])
  const userId = user?.userId ?? ''

  const [prompt, setPrompt] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [executionArn, setExecutionArn] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setExecutionArn(null)
    try {
      const result = await submitHrRequest({ user_id: userId, prompt })
      setExecutionArn(result.execution_arn)
      setPrompt('')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to submit HR enquiry.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      data-testid="hr-enquiry-form"
      onSubmit={(e) => void handleSubmit(e)}
      aria-label="Submit HR enquiry"
    >
      <div className="form-group">
        <label htmlFor="enq-user-id">User ID</label>
        <input
          id="enq-user-id"
          name="user_id"
          type="text"
          value={userId}
          readOnly
          aria-label="User ID (pre-filled)"
        />
      </div>

      <div className="form-group">
        <label htmlFor="enq-prompt">Your Question</label>
        <textarea
          id="enq-prompt"
          name="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          required
          aria-required="true"
          placeholder="Describe your HR query…"
        />
      </div>

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      {executionArn && (
        <div
          className="success-message"
          role="status"
          data-testid="hr-enquiry-execution-arn"
        >
          <strong>Enquiry submitted.</strong>
          <br />
          Execution ARN: <code>{executionArn}</code>
        </div>
      )}

      <button
        type="submit"
        className="btn btn-primary"
        data-testid="hr-enquiry-submit"
        disabled={submitting}
      >
        {submitting ? 'Submitting…' : 'Submit Enquiry'}
      </button>
    </form>
  )
}
