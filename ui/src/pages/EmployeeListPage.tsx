import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getEmployees } from '../api/apiClient'
import type { Employee } from '../types'
import CreateEmployeeForm from '../components/CreateEmployeeForm'

/**
 * Displays all employees in a table and provides a form to create new employees.
 * Covers FR2.1 and FR2.2.
 */
export default function EmployeeListPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  async function loadEmployees() {
    setLoading(true)
    setError(null)
    try {
      const data = await getEmployees()
      setEmployees(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load employees.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadEmployees()
  }, [])

  function handleCreated() {
    setShowForm(false)
    void loadEmployees()
  }

  return (
    <section>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <h1>Employees</h1>
        <button
          type="button"
          className="btn btn-primary"
          data-testid="toggle-create-form"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? 'Cancel' : 'Add Employee'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2>New Employee</h2>
          <CreateEmployeeForm onCreated={handleCreated} />
        </div>
      )}

      {loading && <p>Loading employees…</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <table data-testid="employee-list" aria-label="Employee list">
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Role</th>
              <th>Start Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan={5} data-testid="employee-empty">
                  No employees found.
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.employee_id} data-testid="employee-row">
                  <td>{emp.name}</td>
                  <td>{emp.department}</td>
                  <td>{emp.role}</td>
                  <td>{emp.start_date}</td>
                  <td>
                    <Link
                      to={`/employees/${emp.employee_id}`}
                      aria-label={`View ${emp.name}`}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </section>
  )
}
