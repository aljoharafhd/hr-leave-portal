import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getEmployee } from '../api/apiClient'
import type { Employee } from '../types'
import LeaveSection from '../components/LeaveSection'

/**
 * Displays a single employee's details and their leave records.
 * Covers FR2.3 and embeds the leave management section (FR3).
 */
export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    getEmployee(id)
      .then((emp) => {
        setEmployee(emp)
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : 'Failed to load employee.',
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id])

  if (loading) return <p>Loading employee…</p>
  if (error) return <p className="error-message">{error}</p>
  if (!employee) return null

  return (
    <section>
      <Link to="/" style={{ display: 'inline-block', marginBottom: '1rem' }}>
        ← Back to list
      </Link>

      <div className="card">
        <h1 data-testid="employee-name">{employee.name}</h1>
        <dl>
          <dt>Department</dt>
          <dd data-testid="employee-department">{employee.department}</dd>
          <dt>Role</dt>
          <dd data-testid="employee-role">{employee.role}</dd>
          <dt>Start Date</dt>
          <dd data-testid="employee-start-date">{employee.start_date}</dd>
        </dl>
      </div>

      <LeaveSection employeeId={employee.employee_id} />
    </section>
  )
}
