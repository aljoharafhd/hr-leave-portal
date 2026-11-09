import { useState } from 'react'
import { useAuthenticator } from '@aws-amplify/ui-react'
import { submitTimeOffRequest } from '../api/apiClient'

/**
 * Form for submitting a time-off request workflow via POST /hr-requests/time-off.
 * Pre-fills the user ID from the authenticated Cognito user's sub.
 * Displays the execution ARN on success (202 accepted).
 * Covers FR4.1.
 */
export default function TimeOffRequestForm() {
  const { user } = useAuthenticator((ctx) => [ctx.user])
  const userId = user?.userId ?? ''

  const [form, setForm] = useState({ start_date: '', end_date: '' })
  const [submitting, setSubmitting] = useState(false)
  const [executionArn, setExecutionArn] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setExecutionArn(null)
    try {
      const result = await submitTimeOffRequest({
        user_id: userId,
        start_date: form.start_date,
        end_date: form.end_date,
      })
      setExecutionArn(result.execution_arn)
      setForm({ start_date: '', end_date: '' })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to submit time-off request.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      data-testid="time-off-form"
      onSubmit={(e) => void handleSubmit(e)}
      aria-label="Submit time-off request"
    >
      <div className="form-group">
        <label htmlFor="to-user-id">User ID</label>
        <input
          id="to-user-id"
          name="user_id"
          type="text"
          value={userId}
          readOnly
          aria-label="User ID (pre-filled)"
        />
      </div>

      <div className="form-group">
        <label htmlFor="to-start-date">Start Date</label>
        <input
          id="to-start-date"
          name="start_date"
          type="date"
          value={form.start_date}
          onChange={handleChange}
          required
          aria-required="true"
        />
      </div>

      <div className="form-group">
        <label htmlFor="to-end-date">End Date</label>
        <input
          id="to-end-date"
          name="end_date"
          type="date"
          value={form.end_date}
          onChange={handleChange}
          required
          aria-required="true"
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
          data-testid="time-off-execution-arn"
        >
          <strong>Request accepted.</strong>
          <br />
          Execution ARN: <code>{executionArn}</code>
        </div>
      )}

      <button
        type="submit"
        className="btn btn-primary"
        data-testid="time-off-submit"
        disabled={submitting}
      >
        {submitting ? 'Submitting…' : 'Submit Request'}
      </button>
    </form>
  )
}
