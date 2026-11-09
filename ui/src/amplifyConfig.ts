/**
 * Amplify configuration — reads Cognito pool IDs from Vite build-time env vars.
 * Set VITE_USER_POOL_ID, VITE_USER_POOL_CLIENT_ID, VITE_API_URL, and
 * VITE_AGENTCORE_ENDPOINT in your .env file before running `npm run build`.
 *
 * No secrets are embedded here — only public Cognito identifiers (pool ID and
 * app client ID). The app client was created with generate_secret=False.
 */
export const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID as string,
      userPoolClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID as string,
    },
  },
} as const
