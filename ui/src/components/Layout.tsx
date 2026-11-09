import { Outlet } from 'react-router-dom'
import NavBar from './NavBar'

/**
 * Root layout: renders the NavBar above a `<main>` content area for all routes.
 */
export default function Layout() {
  return (
    <div
      data-testid="layout"
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      <NavBar />
      <main
        style={{
          flex: 1,
          padding: '1.5rem',
          maxWidth: '1100px',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        <Outlet />
      </main>
    </div>
  )
}
