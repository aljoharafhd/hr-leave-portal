# Requirements Analysis

## Intent Analysis

The user wants to complete the HR Leave Portal by building the missing front-end layer on top of a fully-functional serverless backend. The work has three parts:

1. **React UI** — Implement the currently blank `ui/` scaffold into a working employee-facing web app that authenticates via Cognito and exercises all 8 existing REST endpoints.
2. **hrAgent integration** — Add a conversational AI assistant panel to the UI that calls the AgentCore-hosted hrAgent (`POST /invocations`).
3. **CDK deployment stack** — Add a fourth CDK stack to `app.py` that deploys the compiled React bundle to AWS (S3 + CloudFront or Amplify Hosting).

The backend, Cognito, DynamoDB, Step Functions, and AgentCore deployment are already in place. Nothing in them needs to change for this work to succeed.

---

## Functional Requirements

### FR1 — Authentication

FR1: The UI shall authenticate employees using the existing Cognito User Pool (`HrUserPool`) via AWS Amplify.

- **FR1.1**: The UI shall present a sign-in form (email + password) using `@aws-amplify/ui-react`'s `Authenticator` component configured with the existing `UserPoolId` and `UserPoolClientId` outputs.
- **FR1.2**: Authenticated sessions shall persist in browser storage and survive a page refresh.
- **FR1.3**: The UI shall provide a sign-out control that clears the Amplify session.
- **FR1.4**: All API calls shall include the Cognito JWT as a `Bearer` token in the `Authorization` header.

### FR2 — Employee Management

FR2: The UI shall allow authenticated users to view and create employee records via the existing REST API.

- **FR2.1**: The UI shall display a list of all employees retrieved from `GET /employees`.
- **FR2.2**: The UI shall provide a form to create a new employee (`POST /employees`) with fields: name, department, start date, role.
- **FR2.3**: The UI shall display a single employee's details from `GET /employees/{employee_id}`.

### FR3 — Leave Management

FR3: The UI shall allow authenticated users to manage leave records for an employee.

- **FR3.1**: The UI shall display leave records for an employee from `GET /employees/{employee_id}/leave`, with an optional month filter.
- **FR3.2**: The UI shall provide a form to create a leave record (`POST /employees/{employee_id}/leave`) with fields: start date, end date, note.
- **FR3.3**: The UI shall allow updating an existing leave record (`PUT /employees/{employee_id}/leave/{start_date}`) with fields: end date, note.

### FR4 — HR Request Workflows

FR4: The UI shall allow authenticated users to trigger HR request workflows.

- **FR4.1**: The UI shall provide a form to submit a time-off request (`POST /hr-requests/time-off`) with fields: user ID, start date, end date; and confirm the submission was accepted (202 + execution ARN displayed).
- **FR4.2**: The UI shall provide a form to submit a general HR enquiry (`POST /hr-requests`) with fields: user ID, free-text prompt; and confirm the submission was accepted (202 + execution ARN displayed).

### FR5 — AI HR Assistant Chat

FR5: The UI shall provide a conversational chat panel that sends messages to the AgentCore hrAgent and displays the response.

- **FR5.1**: The chat panel shall call `POST /invocations` on the AgentCore runtime endpoint with `{ prompt, messages, actorId }` and the session header `X-Amzn-Bedrock-AgentCore-Runtime-Session-Id`.
- **FR5.2**: The chat panel shall maintain message history within the browser session so the agent receives prior turns as `messages`.
- **FR5.3**: The chat panel shall display a loading indicator while waiting for the agent response.
- **FR5.4**: The integration pattern for authenticating to AgentCore from the browser shall be decided during design (API Gateway proxy vs. direct Amplify invocation with Cognito identity credentials).

### FR6 — CDK UI Deployment Stack

FR6: A new CDK stack (`FrontendStack`) shall be added to `app.py` to deploy the compiled React bundle.

- **FR6.1**: The stack shall host the static build output (`ui/dist/`) on S3 with a CloudFront distribution in front.
- **FR6.2**: The CloudFront distribution shall enforce HTTPS and serve `index.html` for all routes (SPA fallback).
- **FR6.3**: The stack shall output the CloudFront distribution URL (`FrontendUrl`) as a CloudFormation output.
- **FR6.4**: The CORS configuration on the existing FastAPI app (`allow_origins`) shall be updated to restrict to the CloudFront URL once it is known — this is a follow-on configuration change, not a blocker for the stack itself.

---

## Non-Functional Requirements

### NFR1 — Security

NFR1: The UI shall not expose Cognito credentials, AWS keys, or secrets in client-side code or browser storage.

- **NFR1.1**: The Amplify configuration (`aws-exports.js` or equivalent) shall contain only the public Cognito pool ID and app client ID — no client secret (the existing app client has `generate_secret=False`, which is correct).
- **NFR1.2**: The AgentCore invocation path shall authenticate the user using Cognito-derived credentials; no static AWS access keys shall be embedded in the frontend.

### NFR2 — Accessibility

NFR2: The UI shall meet WCAG 2.1 Level AA for all interactive components.

### NFR3 — Performance

NFR3: The initial page load shall complete in under 3 seconds on a standard broadband connection (measured via Lighthouse).

### NFR4 — Browser Support

NFR4: The UI shall function correctly in the two most recent stable versions of Chrome, Firefox, Safari, and Edge.

### NFR5 — Build

NFR5: `npm run build` in `ui/` shall produce a deployable artifact in `ui/dist/` with no TypeScript or lint errors.

---

## Constraints

- **C1**: The UI stack must use the existing `ui/` directory and its declared dependencies (`react ^19.3.1`, `aws-amplify ^6.22.2`, `vite ^8.3.6`, TypeScript `~6.0.3`). No framework switch.
- **C2**: The CDK stack must be written in Python and added to the existing `app.py` entry point alongside the three existing stacks.
- **C3**: The existing backend (Lambda, DynamoDB, Step Functions, Cognito, API Gateway) must not be modified as part of this work.
- **C4**: The CDK version must remain compatible with the existing `aws-cdk-lib ^2.273.0` constraint.

---

## Assumptions

- **A1**: The AgentCore runtime endpoint URL is available as a configuration value (env var or CDK output) that can be consumed by the React app at build or runtime. If not, an API Gateway proxy will be created in `FrontendStack`.
- **A2**: The Cognito `UserPoolId` and `UserPoolClientId` CloudFormation outputs from `BackendStack` are accessible during the UI build or at runtime (via env vars injected by the CDK stack or a config file).
- **A3**: The hrAgent is operational and reachable from the browser or a proxy — the source files being absent from the repo does not affect the frontend integration, which targets the `/invocations` endpoint contract.
- **A4**: Self-sign-up remains disabled; employees are pre-provisioned by an admin. The UI does not need a registration screen.
- **A5**: The existing `RemovalPolicy.DESTROY` on DynamoDB and Cognito is accepted for this development deployment; production hardening is out of scope.

---

## Out of Scope

- Admin interface for provisioning Cognito users.
- Real-time notifications or WebSocket updates on Step Functions execution status.
- Mobile-native app (React Native or similar).
- Fixing the broken `tests/unit/test_hr_leave_portal_stack.py` CDK test (pre-existing debt, not part of this work).
- Changing `RemovalPolicy.DESTROY` to `RETAIN` on any resource.
- Updating the HR email address from `hr@example.com`.
- Adding pagination to `GET /employees` (pre-existing limitation).

---

## Open Questions

- **OQ1**: What is the AgentCore runtime endpoint URL, and how should the frontend authenticate to it — direct Amplify `Auth.fetchAuthSession` with Cognito identity credentials, or an API Gateway proxy in `FrontendStack`? (Impacts FR5.4 and FR6 design.)
- **OQ2**: Should the Cognito pool ID and client ID be embedded at build time (Vite `VITE_*` env vars) or fetched at runtime from a config endpoint? (Impacts CDK stack design for FR6.2.)
