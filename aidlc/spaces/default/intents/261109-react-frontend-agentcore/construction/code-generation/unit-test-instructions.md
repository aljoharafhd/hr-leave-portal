# Unit Test Instructions

## Test Framework

**Vitest** with `@testing-library/react` and `jsdom`.

Added to `ui/package.json` in Step 1 of the plan:
- `vitest` — test runner
- `@vitest/coverage-v8` — coverage reporter
- `@testing-library/react` — component rendering
- `@testing-library/user-event` — user interaction simulation
- `@testing-library/jest-dom` — custom matchers (`toBeInTheDocument`, etc.)
- `jsdom` — browser environment for Node

## How to Run Tests

After Step 1 (runner bootstrap), use this exact scoped command:

```bash
cd ui && npx vitest run --reporter=verbose src/test/
```

Or via the npm script added in Step 1:

```bash
cd ui && npm test
```

Both commands run only the files under `ui/src/test/` — they do not touch the Python CDK tests in `tests/unit/`.

> **Note:** The existing `tests/unit/test_hr_leave_portal_stack.py` CDK test is already broken (imports a non-existent class) and is out of scope for this work. This Vitest command does not invoke it.

## Expected Coverage Targets

**Strategy: Minimal** — one verifiable test per requirement at the narrowest effective level, with at least one happy-path test per component.

Target: ~15 unit tests across 8 test files. No numeric line-coverage threshold is set for this scope. Build and Test will check the full suite on the assembled project.

The tests cover:
- FR1 (Amplify config shape, Bearer header attachment, session persistence via mock)
- FR2 (employee list renders, create form submits correctly, 404 error path)
- FR3 (leave list renders)
- FR4 (covered structurally by HR request forms — happy-path render tests)
- FR5 (agent invocation, loading indicator, error banner)
- NFR1.1 (no secrets in config object)
- NFR2 (aria labels / visible labels in NavBar and form components)

## Mocking / Stubbing Guidance

- **`aws-amplify/auth`**: mock the entire module in Vitest with `vi.mock('aws-amplify/auth', ...)` — return a resolved `fetchAuthSession` that yields a fake JWT.
- **`@aws-amplify/ui-react`**: mock `useAuthenticator` to return `{ user: { userId: 'test-user' }, signOut: vi.fn() }`.
- **`fetch`**: use `vi.stubGlobal('fetch', vi.fn())` in each test that exercises the API client; restore in `afterEach`.
- **`sessionStorage`**: Vitest's jsdom provides a real `sessionStorage`; clear it in `beforeEach` with `sessionStorage.clear()`.

## Test Data Management

No external fixtures. All test data is inline in each test file using `const mockEmployee = { ... }` literals. No database or network connection is required to run the suite.

## File Locations

All test files live under `ui/src/test/`:
```
ui/src/test/
├── setup.ts                       — imports @testing-library/jest-dom
├── amplifyConfig.test.ts          — FR1 / NFR1.1
├── apiClient.test.ts              — FR1.4 / FR2
├── agentClient.test.ts            — FR5.1 / FR5.4
├── NavBar.test.tsx                — FR1.3 / NFR2
├── EmployeeListPage.test.tsx      — FR2.1
├── CreateEmployeeForm.test.tsx    — FR2.2
├── LeaveSection.test.tsx          — FR3.1
└── ChatPanel.test.tsx             — FR5.2 / FR5.3
```
