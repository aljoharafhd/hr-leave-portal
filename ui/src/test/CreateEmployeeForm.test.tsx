/**
 * Tests for CreateEmployeeForm.tsx
 * FR2.2 — form submits correct payload; error feedback on failure
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CreateEmployeeForm from '../components/CreateEmployeeForm'

// Mock the entire apiClient module — do NOT import ApiError inside the factory
// to avoid the hoisting ReferenceError.
vi.mock('../api/apiClient', () => ({
  createEmployee: vi.fn(),
}))

// Import after mock registration
import { createEmployee } from '../api/apiClient'

function renderForm(onCreated = vi.fn()) {
  return render(<CreateEmployeeForm onCreated={onCreated} />)
}

describe('CreateEmployeeForm', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders with data-testid="create-employee-form"', () => {
    renderForm()
    expect(screen.getByTestId('create-employee-form')).toBeInTheDocument()
  })

  it('calls createEmployee with the correct payload on submit', async () => {
    const user = userEvent.setup()
    const mockCreated = vi.fn()

    const created = {
      employee_id: 'emp-3',
      name: 'Carol',
      department: 'Finance',
      role: 'Analyst',
      start_date: '2024-03-01',
    }
    vi.mocked(createEmployee).mockResolvedValue(created)

    renderForm(mockCreated)

    await user.type(screen.getByLabelText(/name/i), 'Carol')
    await user.type(screen.getByLabelText(/department/i), 'Finance')
    await user.type(screen.getByLabelText(/role/i), 'Analyst')
    await user.type(screen.getByLabelText(/start date/i), '2024-03-01')
    await user.click(screen.getByTestId('create-employee-submit'))

    await waitFor(() => {
      expect(createEmployee).toHaveBeenCalledWith({
        name: 'Carol',
        department: 'Finance',
        role: 'Analyst',
        start_date: '2024-03-01',
      })
    })

    await waitFor(() => {
      expect(mockCreated).toHaveBeenCalledOnce()
    })
  })

  it('shows error message when createEmployee rejects', async () => {
    const user = userEvent.setup()

    vi.mocked(createEmployee).mockRejectedValue(new Error('Network error'))

    renderForm()

    await user.type(screen.getByLabelText(/name/i), 'Dan')
    await user.type(screen.getByLabelText(/department/i), 'IT')
    await user.type(screen.getByLabelText(/role/i), 'Dev')
    await user.type(screen.getByLabelText(/start date/i), '2024-04-01')
    await user.click(screen.getByTestId('create-employee-submit'))

    await waitFor(() => {
      expect(screen.getByTestId('create-employee-error')).toHaveTextContent(
        'Network error',
      )
    })
  })
})
