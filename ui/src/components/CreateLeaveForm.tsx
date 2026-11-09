import { useState } from 'react'
import { createLeave } from '../api/apiClient'
import type { CreateLeavePayload } from '../types'

interface Props {
  employeeId: string
  onCreated?: () => void
}

/**
 * Controlled form for creating a new leave record for an employee.
 * Covers FR3.2.
 */
export default function CreateLeaveForm({ employeeId, onCreated }: Props) {
  const [form, setForm] = useState<CreateLeavePayload>({
    start_date: '',
    end_date: '',
    note: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(false)
    try {
      await createLeave(employeeId, form)
      setSuccess(true)
      setForm({ start_date: '', end_date: '', note: '' })
      onCreated?.()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create leave record.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      data-testid="create-leave-form"
      onSubmit={(e) => void handleSubmit(e)}
      aria-label="Create leave record"
    >
      <div className="form-group">
        <label htmlFor="leave-start">Start Date</label>
        <input
          id="leave-start"
          name="start_date"
          type="date"
          value={form.start_date}
          onChange={handleChange}
          required
          aria-required="true"
        />
      </div>

      <div className="form-group">
        <label htmlFor="leave-end">End Date</label>
        <input
          id="leave-end"
          name="end_date"
          type="date"
          value={form.end_date}
          onChange={handleChange}
          required
          aria-required="true"
        />
      </div>

      <div className="form-group">
        <label htmlFor="leave-note">Note (optional)</label>
        <textarea
          id="leave-note"
          name="note"
          value={form.note ?? ''}
          onChange={handleChange}
          rows={2}
          aria-label="Leave note"
        />
      </div>

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="success-message" role="status">
          Leave record created.
        </p>
      )}

      <button
        type="submit"
        className="btn btn-primary"
        data-testid="create-leave-submit"
        disabled={submitting}
      >
        {submitting ? 'Creating…' : 'Create Leave'}
      </button>
    </form>
  )
}
