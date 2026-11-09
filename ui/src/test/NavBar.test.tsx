/**
 * Tests for NavBar.tsx
 * FR1.3 — sign-out control present
 * NFR2  — nav links have accessible labels
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import NavBar from '../components/NavBar'

// Mock @aws-amplify/ui-react so NavBar can render without a real Amplify context
const mockSignOut = vi.fn()

vi.mock('@aws-amplify/ui-react', () => ({
  useAuthenticator: (_selector: unknown) => ({
    user: { userId: 'test-user' },
    signOut: mockSignOut,
  }),
}))

function renderNavBar() {
  return render(
    <MemoryRouter>
      <NavBar />
    </MemoryRouter>,
  )
}

describe('NavBar', () => {
  it('renders with data-testid="navbar"', () => {
    renderNavBar()
    expect(screen.getByTestId('navbar')).toBeInTheDocument()
  })

  it('renders Employees nav link', () => {
    renderNavBar()
    expect(screen.getByRole('link', { name: /employees/i })).toBeInTheDocument()
  })

  it('renders HR Requests nav link', () => {
    renderNavBar()
    expect(screen.getByRole('link', { name: /hr requests/i })).toBeInTheDocument()
  })

  it('renders AI Assistant nav link', () => {
    renderNavBar()
    expect(screen.getByRole('link', { name: /ai assistant/i })).toBeInTheDocument()
  })

  it('renders a sign-out button with accessible label (NFR2)', () => {
    renderNavBar()
    const signOutBtn = screen.getByRole('button', { name: /sign out/i })
    expect(signOutBtn).toBeInTheDocument()
  })

  it('calls signOut when sign-out button is clicked (FR1.3)', async () => {
    const user = userEvent.setup()
    renderNavBar()
    const signOutBtn = screen.getByTestId('navbar-signout')
    await user.click(signOutBtn)
    expect(mockSignOut).toHaveBeenCalledOnce()
  })
})
