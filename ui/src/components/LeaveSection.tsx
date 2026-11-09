import { useEffect, useState } from 'react'
import { listLeave } from '../api/apiClient'
import type { LeaveRecord } from '../types'
import CreateLeaveForm from './CreateLeaveForm'
import UpdateLeaveForm from './UpdateLeaveForm'

interface Props {
  employeeId: string
}

/**
 * Renders the leave list for an employee with optional month filter,
 * plus inline create and update forms.
 * Covers FR3.1, FR3.2, FR3.3.
 */
export default function LeaveSection({ employeeId }: Props) {
  const [records, setRecords] = useState<LeaveRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [month, setMonth] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<LeaveRecord | null>(null)

  async function loadLeave() {
    setLoading(true)
    setError(null)
    try {
      const data = await listLeave(employeeId, month || undefined)
      setRecords(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leave.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadLeave()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId, month])

  function handleCreated() {
    setShowCreate(false)
    void loadLeave()
  }

  function handleUpdated() {
    setEditing(null)
    void loadLeave()
  }

  return (
    <div data-testid="leave-section">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '1.5rem',
          marginBottom: '0.75rem',
        }}
      >
        <h2>Leave Records</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <label htmlFor="month-filter" style={{ marginBottom: 0 }}>
            Month:
          </label>
          <input
            id="month-filter"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            aria-label="Filter by month"
            style={{ width: 'auto' }}
          />
          <button
            type="button"
            className="btn btn-primary"
            data-testid="toggle-create-leave"
            onClick={() => {
              setShowCreate((v) => !v)
              setEditing(null)
            }}
          >
            {showCreate ? 'Cancel' : 'Add Leave'}
          </button>
        </div>
      </div>

      {showCreate && (
        <div className="card">
          <h3>New Leave Record</h3>
          <CreateLeaveForm
            employeeId={employeeId}
            onCreated={handleCreated}
          />
        </div>
      )}

      {editing && (
        <div className="card">
          <h3>Update Leave Record</h3>
          <UpdateLeaveForm
            employeeId={employeeId}
            record={editing}
            onUpdated={handleUpdated}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {loading && <p>Loading leave records…</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <table data-testid="leave-list" aria-label="Leave records">
          <thead>
            <tr>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Note</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={4} data-testid="leave-empty">
                  No leave records found.
                </td>
              </tr>
            ) : (
              records.map((rec) => (
                <tr
                  key={`${rec.employee_id}-${rec.start_date}`}
                  data-testid="leave-row"
                >
                  <td>{rec.start_date}</td>
                  <td>{rec.end_date}</td>
                  <td>{rec.note ?? '—'}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditing(rec)
                        setShowCreate(false)
                      }}
                      aria-label={`Edit leave starting ${rec.start_date}`}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
