import { useState } from 'react'
import { createEmployee } from '../api/apiClient'
import type { CreateEmployeePayload } from '../types'

interface Props {
  onCreated?: () => void
}

/**
 * Controlled form for creating a new employee record.
 * On successful submission it calls the optional `onCreated` callback.
 * Covers FR2.2.
 */
export default function CreateEmployeeForm({ onCreated }: Props) {
  const [form, setForm] = useState<CreateEmployeePayload>({
    name: '',
    department: '',
    role: '',
    start_date: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(false)
    try {
      await createEmployee(form)
      setSuccess(true)
      setForm({ name: '', department: '', role: '', start_date: '' })
      onCreated?.()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create employee.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      data-testid="create-employee-form"
      onSubmit={(e) => void handleSubmit(e)}
      aria-label="Create employee"
    >
      <div className="form-group">
        <label htmlFor="emp-name">Name</label>
        <input
          id="emp-name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          required
          aria-required="true"
          autoComplete="name"
        />
      </div>

      <div className="form-group">
        <label htmlFor="emp-department">Department</label>
        <input
          id="emp-department"
          name="department"
          type="text"
          value={form.department}
          onChange={handleChange}
          required
          aria-required="true"
        />
      </div>

      <div className="form-group">
        <label htmlFor="emp-role">Role</label>
        <input
          id="emp-role"
          name="role"
          type="text"
          value={form.role}
          onChange={handleChange}
          required
          aria-required="true"
        />
      </div>

      <div className="form-group">
        <label htmlFor="emp-start-date">Start Date</label>
        <input
          id="emp-start-date"
          name="start_date"
          type="date"
          value={form.start_date}
          onChange={handleChange}
          required
          aria-required="true"
        />
      </div>

      {error && (
        <p className="error-message" role="alert" data-testid="create-employee-error">
          {error}
        </p>
      )}
      {success && (
        <p className="success-message" role="status" data-testid="create-employee-success">
          Employee created successfully.
        </p>
      )}

      <button
        type="submit"
        className="btn btn-primary"
        data-testid="create-employee-submit"
        disabled={submitting}
      >
        {submitting ? 'Creating…' : 'Create Employee'}
      </button>
    </form>
  )
}
