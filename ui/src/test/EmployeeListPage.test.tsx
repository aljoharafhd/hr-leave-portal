/**
 * Tests for EmployeeListPage.tsx
 * FR2.1 — employee list renders rows fetched from the API
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import EmployeeListPage from '../pages/EmployeeListPage'

const mockEmployees = [
  {
    employee_id: 'emp-1',
    name: 'Alice Smith',
    department: 'Engineering',
    role: 'Engineer',
    start_date: '2023-01-15',
  },
  {
    employee_id: 'emp-2',
    name: 'Bob Jones',
    department: 'HR',
    role: 'Manager',
    start_date: '2022-06-01',
  },
]

// Mock the API client
vi.mock('../api/apiClient', () => ({
  getEmployees: vi.fn(),
  createEmployee: vi.fn(),
}))

import { getEmployees } from '../api/apiClient'

function renderPage() {
  return render(
    <MemoryRouter>
      <EmployeeListPage />
    </MemoryRouter>,
  )
}

describe('EmployeeListPage', () => {
  beforeEach(() => {
    vi.mocked(getEmployees).mockResolvedValue(mockEmployees)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders the employee list table', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByTestId('employee-list')).toBeInTheDocument()
    })
  })

  it('renders one row per employee', async () => {
    renderPage()
    await waitFor(() => {
      const rows = screen.getAllByTestId('employee-row')
      expect(rows).toHaveLength(2)
    })
  })

  it('displays employee names in the rows', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument()
      expect(screen.getByText('Bob Jones')).toBeInTheDocument()
    })
  })

  it('shows empty state when no employees returned', async () => {
    vi.mocked(getEmployees).mockResolvedValue([])
    renderPage()
    await waitFor(() => {
      expect(screen.getByTestId('employee-empty')).toBeInTheDocument()
    })
  })
})
