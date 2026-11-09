import { NavLink } from 'react-router-dom'
import { useAuthenticator } from '@aws-amplify/ui-react'

/**
 * Primary navigation bar.
 * Renders nav links to the main sections and a sign-out button.
 * All interactive elements have visible labels (WCAG 2.1 AA — NFR2).
 */
export default function NavBar() {
  const { signOut } = useAuthenticator((ctx) => [ctx.signOut])

  return (
    <nav
      data-testid="navbar"
      aria-label="Main navigation"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        padding: '0.75rem 1.5rem',
        borderBottom: '1px solid var(--amplify-colors-border-primary, #ddd)',
        background: 'var(--amplify-colors-background-primary, #fff)',
      }}
    >
      <span
        style={{
          fontWeight: 700,
          fontSize: '1.1rem',
          marginRight: 'auto',
        }}
      >
        HR Leave Portal
      </span>

      <NavLink
        to="/"
        aria-label="Employees"
        style={({ isActive }) => ({
          fontWeight: isActive ? 700 : 400,
          textDecoration: 'none',
          color: 'inherit',
        })}
      >
        Employees
      </NavLink>

      <NavLink
        to="/hr-requests"
        aria-label="HR Requests"
        style={({ isActive }) => ({
          fontWeight: isActive ? 700 : 400,
          textDecoration: 'none',
          color: 'inherit',
        })}
      >
        HR Requests
      </NavLink>

      <NavLink
        to="/chat"
        aria-label="AI Assistant"
        style={({ isActive }) => ({
          fontWeight: isActive ? 700 : 400,
          textDecoration: 'none',
          color: 'inherit',
        })}
      >
        AI Assistant
      </NavLink>

      <button
        type="button"
        onClick={signOut}
        aria-label="Sign out"
        data-testid="navbar-signout"
        style={{
          padding: '0.4rem 1rem',
          borderRadius: '4px',
          border: '1px solid currentColor',
          background: 'transparent',
          cursor: 'pointer',
        }}
      >
        Sign out
      </button>
    </nav>
  )
}
