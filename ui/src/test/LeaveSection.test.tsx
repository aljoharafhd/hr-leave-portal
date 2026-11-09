/**
 * Tests for LeaveSection.tsx
 * FR3.1 — leave records render from the API
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import LeaveSection from '../components/LeaveSection'

const mockLeaveRecords = [
  {
    employee_id: 'emp-1',
    start_date: '2024-07-01',
    end_date: '2024-07-05',
    note: 'Summer holiday',
  },
  {
    employee_id: 'emp-1',
    start_date: '2024-12-24',
    end_date: '2024-12-31',
    note: 'Christmas break',
  },
]

vi.mock('../api/apiClient', () => ({
  listLeave: vi.fn(),
  createLeave: vi.fn(),
  updateLeave: vi.fn(),
}))

import { listLeave } from '../api/apiClient'

function renderSection() {
  return render(<LeaveSection employeeId="emp-1" />)
}

describe('LeaveSection', () => {
  beforeEach(() => {
    vi.mocked(listLeave).mockResolvedValue(mockLeaveRecords)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders with data-testid="leave-section"', () => {
    renderSection()
    expect(screen.getByTestId('leave-section')).toBeInTheDocument()
  })

  it('renders leave records returned from the API', async () => {
    renderSection()
    await waitFor(() => {
      const rows = screen.getAllByTestId('leave-row')
      expect(rows).toHaveLength(2)
    })
  })

  it('displays leave start and end dates', async () => {
    renderSection()
    await waitFor(() => {
      expect(screen.getByText('2024-07-01')).toBeInTheDocument()
      expect(screen.getByText('2024-07-05')).toBeInTheDocument()
    })
  })

  it('shows empty state when no records returned', async () => {
    vi.mocked(listLeave).mockResolvedValue([])
    renderSection()
    await waitFor(() => {
      expect(screen.getByTestId('leave-empty')).toBeInTheDocument()
    })
  })
})
