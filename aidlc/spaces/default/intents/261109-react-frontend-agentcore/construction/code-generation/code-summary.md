# Code Generation Summary

## Stage
Construction / Code Generation — Bolt: `react-frontend-agentcore`

## What Was Built

### React UI (`ui/src/`)
A complete React 19 + Vite + TypeScript single-page application replacing the blank scaffold:

| File | Purpose |
|---|---|
| `amplifyConfig.ts` | Exports `amplifyConfig` for `Amplify.configure()` reading `VITE_*` env vars |
| `types/index.ts` | TypeScript interfaces: `Employee`, `LeaveRecord`, `HrRequestResponse`, `ChatMessage` + payload types |
| `api/apiClient.ts` | Typed fetch wrapper — attaches Cognito JWT Bearer header; exports 8 endpoint functions; throws `ApiError` on non-2xx |
| `api/agentClient.ts` | AgentCore proxy client — `invokeAgent()`, session ID in `sessionStorage`, `AgentNotConfiguredError` |
| `App.tsx` | Root — `Amplify.configure()` + `<Authenticator>` + `<RouterProvider>` |
| `router.tsx` | React Router v7 browser router: `/`, `/employees/:id`, `/hr-requests`, `/chat` |
| `components/NavBar.tsx` | Navigation links (Employees, HR Requests, AI Assistant) + sign-out button |
| `components/Layout.tsx` | Root layout — `<NavBar>` + `<main>` content area |
| `pages/EmployeeListPage.tsx` | Lists all employees in a table; embeds `CreateEmployeeForm` |
| `components/CreateEmployeeForm.tsx` | Controlled form — create employee; shows success/error feedback |
| `pages/EmployeeDetailPage.tsx` | Single employee detail + embedded `LeaveSection` |
| `components/LeaveSection.tsx` | Leave list with month filter; inline create/update forms |
| `components/CreateLeaveForm.tsx` | Controlled form — create leave record |
| `components/UpdateLeaveForm.tsx` | Pre-filled form — update leave record |
| `pages/HrRequestsPage.tsx` | Tab UI — Time Off and General Enquiry |
| `components/TimeOffRequestForm.tsx` | Time-off workflow form; shows execution ARN on 202 |
| `components/HrEnquiryForm.tsx` | General enquiry form; shows execution ARN on 202 |
| `pages/ChatPage.tsx` | Full-screen AI chat page |
| `components/ChatPanel.tsx` | Chat UI — message history, loading indicator, error banner |
| `components/LoadingIndicator.tsx` | Animated spinner with `aria-label` |

### CDK (`hr_leave_portal/`)
| File | Purpose |
|---|---|
| `frontend_stack.py` | `FrontendStack` — S3 + CloudFront (OAC, HTTPS redirect, SPA 403/404→200 fallback), outputs: `FrontendUrl`, `BucketName`, `DistributionId` |

### Config / Build
| File | Purpose |
|---|---|
| `ui/package.json` | Added: `react-router-dom@^7`, `vitest`, `@vitest/coverage-v8`, `@testing-library/*`, `jsdom`; added `test` and `test:watch` scripts |
| `ui/vitest.config.ts` | Vitest config — jsdom environment, setupFiles, coverage provider |
| `ui/tsconfig.app.json` | Added `vitest/globals` to `types` |
| `ui/vite.config.ts` | Added `base: './'` and `build.outDir: 'dist'` |
| `ui/.env.example` | Documents all four `VITE_*` env vars |
| `ui/src/test/setup.ts` | Imports `@testing-library/jest-dom` |
| `app.py` | Added `FrontendStack` import and instantiation |

### Tests (`ui/src/test/`)
8 test files, 31 tests, all passing:

| File | Coverage |
|---|---|
| `amplifyConfig.test.ts` | FR1, NFR1.1 — config shape, no secrets |
| `apiClient.test.ts` | FR1.4, FR2 — Bearer header, create payload, 404 error |
| `agentClient.test.ts` | FR5.1, FR5.4 — invocation payload, session ID persistence, unconfigured error |
| `NavBar.test.tsx` | FR1.3, NFR2 — nav links, sign-out, accessible labels |
| `EmployeeListPage.test.tsx` | FR2.1 — rows render, empty state |
| `CreateEmployeeForm.test.tsx` | FR2.2 — submit payload, error feedback |
| `LeaveSection.test.tsx` | FR3.1 — leave rows render, empty state |
| `ChatPanel.test.tsx` | FR5.2, FR5.3, FR5.4 — user bubble, loading, agent reply, not-configured banner |

## Verification Results

### Build
```
npm run build — Exit 0
TypeScript: no errors
Vite output: ui/dist/index.html + assets
```

### Tests
```
npx vitest run --reporter=verbose src/test/
Test Files  8 passed (8)
     Tests 31 passed (31)
Duration  ~850ms
```

### CDK Synth
```
python3 app.py — Exit 0
(Node version advisory warning only — non-fatal)
```

## Key Decisions

1. **AgentCore proxy pattern**: `VITE_AGENTCORE_ENDPOINT` is an HTTPS URL (API Gateway proxy). Missing endpoint throws `AgentNotConfiguredError` rather than silently failing. This matches OQ1 resolution in the plan.
2. **Cognito config at build time**: All `VITE_*` values embedded via Vite env vars. Operator copies `.env.example` → `.env` and fills CDK outputs before `npm run build`.
3. **TypeScript `erasableSyntaxOnly`**: TS 6 flag prohibits parameter properties in constructors. `ApiError` and `AgentInvocationError` use explicit class fields instead.
4. **`vi.mockImplementation` over `vi.mockResolvedValue`**: Using `mockImplementation` for the `fetchAuthSession` mock prevents `vi.restoreAllMocks()` from wiping the return value across `describe` blocks.
5. **`vi.unstubAllGlobals()` for `fetch`**: Each test `describe` that stubs `fetch` uses `unstubAllGlobals()` in `afterEach` rather than `restoreAllMocks()` to avoid disturbing the `vi.mock()` registration.

## Out of Scope (unchanged)
- `tests/unit/test_hr_leave_portal_stack.py` — pre-existing broken CDK test, noted in plan as out of scope
- CORS update to restrict `allow_origins` to the CloudFront URL — documented as FR6.4 follow-on
- Code splitting / chunk size optimisation (advisory Vite warning, non-blocking)
