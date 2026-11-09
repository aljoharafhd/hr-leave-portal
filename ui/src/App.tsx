import { Amplify } from 'aws-amplify'
import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import { amplifyConfig } from './amplifyConfig'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'

// Configure Amplify once at module load — reads VITE_* build-time env vars.
Amplify.configure(amplifyConfig)

/**
 * Root application component.
 * Wraps the entire app in Amplify's Authenticator so every route is
 * protected behind a Cognito sign-in. Unauthenticated users see the
 * Amplify-provided sign-in form (WCAG 2.1 AA compliant out of the box).
 */
export default function App() {
  return (
    <Authenticator hideSignUp>
      <RouterProvider router={router} />
    </Authenticator>
  )
}
