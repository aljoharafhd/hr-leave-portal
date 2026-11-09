import { useState } from 'react'
import { updateLeave } from '../api/apiClient'
import type { LeaveRecord, UpdateLeavePayload } from '../types'

interface Props {
  employeeId: string
  record: LeaveRecord
  onUpdated?: () => void
  onCancel?: () => void
}

/**
 * Pre-filled form for updating an existing leave record.
 * Covers FR3.3.
 */
export default function UpdateLeaveForm({
  employeeId,
  record,
  onUpdated,
  onCancel,
}: Props) {
  const [form, setForm] = useState<UpdateLeavePayload>({
    end_date: record.end_date,
    note: record.note ?? '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    try {
      await updateLeave(employeeId, record.start_date, form)
      onUpdated?.()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update leave record.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      data-testid="update-leave-form"
      onSubmit={(e) => void handleSubmit(e)}
      aria-label="Update leave record"
    >
      <p style={{ marginTop: 0 }}>
        <strong>Start Date:</strong> {record.start_date} (cannot be changed)
      </p>

      <div className="form-group">
        <label htmlFor="update-leave-end">End Date</label>
        <input
          id="update-leave-end"
          name="end_date"
          type="date"
          value={form.end_date}
          onChange={handleChange}
          required
          aria-required="true"
        />
      </div>

      <div className="form-group">
        <label htmlFor="update-leave-note">Note (optional)</label>
        <textarea
          id="update-leave-note"
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

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          type="submit"
          className="btn btn-primary"
          data-testid="update-leave-submit"
          disabled={submitting}
        >
          {submitting ? 'Saving…' : 'Save Changes'}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          data-testid="update-leave-cancel"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
