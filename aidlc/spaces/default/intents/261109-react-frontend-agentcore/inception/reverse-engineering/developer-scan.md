## Developer Code Scan Results

Head commit: `7c7d8977963eafce313aebfd3b9c27bd8a59cecc`

### Scan Coverage

- **Analyzed deeply**:
  - `app.py` — CDK entry point
  - `pyproject.toml` — Python build/dependency manifest
  - `uv.lock` — locked dependency versions
  - `cdk.json` — CDK configuration
  - `.python-version` — Python version pin
  - `.gitignore` — excluded paths
  - `hr_leave_portal/backend_stack.py` — BackendStack CDK construct
  - `hr_leave_portal/notification_stack.py` — NotificationStack CDK construct
  - `hr_leave_portal/state_machine_stack.py` — StateMachineStack CDK construct
  - `api/handler.py` — Lambda entry point (FastAPI + Mangum)
  - `api/models.py` — Pydantic request/response models
  - `api/controllers/employee_controller.py`
  - `api/controllers/hr_request_controller.py`
  - `api/controllers/leave_controller.py`
  - `api/services/employee_service.py`
  - `api/services/hr_request_service.py`
  - `api/services/leave_service.py`
  - `state_machines/hr_state_machine_definition.json` — Step Functions ASL definition
  - `scripts/build_layer.sh` — Lambda layer build + publish script
  - `tests/unit/test_hr_leave_portal_stack.py` — CDK unit test
  - `ui/package.json` — npm manifest
  - `ui/vite.config.ts` — Vite config
  - `ui/eslint.config.js` — ESLint config
  - `ui/tsconfig.json`, `ui/tsconfig.app.json`, `ui/tsconfig.node.json` — TypeScript config
  - `ui/index.html` — HTML shell
  - `ui/src/main.tsx` — React entry point
  - `ui/src/App.tsx` — Root component (scaffold/placeholder)
  - `ui/src/App.css`, `ui/src/index.css` — Styles
  - `hrAgent/agentcore/.env.local` — AgentCore local dev env template
  - `hrAgent/agentcore/.env.aws.local` — AgentCore AWS credentials (gitignored; present on disk)
  - `hrAgent/agentcore/.cli/traces/otlp/` — OTLP trace files (sampled for agent tool/system-prompt discovery)
  - `hrAgent/app/agent/.venv/lib/python3.14/site-packages/agent-0.1.0.dist-info/METADATA` — agent package metadata
  - `hrAgent/app/agent/.venv/lib/python3.14/site-packages/agent-0.1.0.dist-info/RECORD` — installed file list
  - `hrAgent/app/agent/.venv/lib/python3.14/site-packages/agent-0.1.0.dist-info/direct_url.json` — editable-install origin
  - `README.md`, `ui/README.md` — project documentation

- **Skimmed only**:
  - `hrAgent/agentcore/.cli/traces/otlp/` — OTLP JSONL trace files (sampled 3 of 25 to extract tool list, model, and system prompt; remaining 22 not read)
  - `uv.lock` — first 90 lines only (version numbers of interest confirmed: `aws-cdk-lib 2.275.0`)
  - `ui/node_modules/` — presence confirmed; individual packages not read

- **Left out** (per .gitignore and brief instructions):
  - `.kiro/` — AI-DLC install
  - `aidlc/` — AI-DLC workspace tree
  - `.git/` — version control internals
  - `.venv/` — project Python virtualenv
  - `cdk.out/` — CDK synth output
  - `hrAgent/app/agent/.venv/` — agent virtualenv (package list extracted from dist-info, sources not read)
  - `ui/node_modules/` — npm cache
  - `fastapi-layer.zip` — build artifact
  - `src/hr_leave_portal/__init__.py` — empty placeholder
  - `hrAgent/agentcore/.env.aws.local` — credential file (confirmed gitignored; values not echoed)

---

### Packages Found

- `hr_leave_portal` — CDK app — Python — three stacks: BackendStack, NotificationStack, StateMachineStack
- `api` — Lambda function package — Python — FastAPI REST API served via Mangum adapter
- `api/controllers` — sub-module — Python — three FastAPI routers (employees, leave, hr-requests)
- `api/services` — sub-module — Python — three service modules wrapping DynamoDB and Step Functions
- `ui` — frontend app — TypeScript/React — Vite-scaffolded SPA; currently placeholder only
- `hrAgent/app/agent` — AgentCore agent — Python — Strands-based AI agent; source files absent from disk (editable install with empty source dir); tool list and system prompt recovered from OTLP traces
- `state_machines` — data — JSON — Step Functions ASL definition
- `scripts` — tooling — Bash — Lambda layer build-and-publish script

---

### Build System

- **Type**: Two independent build systems
  - **Python (CDK + Lambda)**: `uv` with `pyproject.toml` (build-backend: `uv_build`). No `requirements.txt` — lock file only (`uv.lock`).
  - **TypeScript (UI)**: npm with `package.json`. Build command: `tsc -b && vite build`. Dev server: `vite`. Linter: `eslint .`. Preview: `vite preview`.
- **Config Files**:
  - `pyproject.toml` — Python deps and CDK app metadata
  - `uv.lock` — locked Python deps (revision 5)
  - `cdk.json` — CDK app entry (`python3 app.py`) and feature flags
  - `ui/package.json` — npm scripts and JS deps
  - `ui/vite.config.ts` — Vite + React plugin
  - `ui/tsconfig.json` / `ui/tsconfig.app.json` / `ui/tsconfig.node.json` — TypeScript project refs
  - `scripts/build_layer.sh` — manual Lambda layer build (not part of CDK synth; precondition)
- **Build Dependencies**:
  - CDK app → `aws-cdk-lib ^2.273.0` (resolved: 2.275.0), `constructs ^10.5.0`, `mangum ^0.22.0`
  - Lambda layer → `fastapi`, `pydantic`, `mangum`, `aws-lambda-powertools[tracer]` (installed via `uv pip` into zip)
  - Lambda layer ARN stored in SSM `/hr-leave-portal/fastapi-layer-arn`; BackendStack reads it at synth time
  - UI → `react ^19.3.1`, `react-dom ^19.3.1`, `aws-amplify ^6.22.2`, `@aws-amplify/ui-react ^6.15.7`
  - UI dev → `vite ^8.3.6`, `typescript ~6.0.3`, `eslint ^10.14.0`

---

### APIs Discovered

- **REST API (FastAPI / Lambda + API Gateway)** — `api/` — 8 endpoints
  - `POST /employees` → create employee (201)
  - `GET /employees` → list all employees
  - `GET /employees/{employee_id}` → get single employee (404 on miss)
  - `POST /employees/{employee_id}/leave` → create leave record (201)
  - `GET /employees/{employee_id}/leave` → list leave (optional `month=YYYY-MM` query param)
  - `PUT /employees/{employee_id}/leave/{start_date}` → upsert leave record
  - `POST /hr-requests/time-off` → start time-off Step Functions workflow (202)
  - `POST /hr-requests` → start general HR request via Bedrock (202)
- **All routes require Cognito JWT authorization** (Cognito User Pool authorizer on API Gateway)
- **CORS**: wildcard (`allow_origins=["*"]`); origins, methods, and headers all open
- **AgentCore Runtime endpoint**: `POST /invocations` — exposed by the `bedrock_agentcore` runtime (Starlette ASGI); accepts JSON body `{prompt, messages, actorId}` plus `X-Amzn-Bedrock-AgentCore-Runtime-Session-Id` header

---

### Frameworks & Libraries

| Name | Version | Purpose |
|---|---|---|
| aws-cdk-lib | 2.275.0 | CDK IaC: all three stacks |
| constructs | ~10.5.x | CDK construct tree |
| FastAPI | (from Lambda layer) | REST API framework in Lambda |
| Pydantic | (from Lambda layer) | Request/response validation |
| Mangum | ^0.22.0 | ASGI-to-Lambda adapter |
| aws-lambda-powertools | (from Lambda layer) | Tracer (included in layer build) |
| boto3 | (Lambda runtime) | DynamoDB, Step Functions clients |
| React | ^19.3.1 | UI framework |
| react-dom | ^19.3.1 | DOM renderer |
| Vite | ^8.3.6 | UI build tool + dev server |
| TypeScript | ~6.0.3 | UI type checking |
| @vitejs/plugin-react | ^6.1.2 | React HMR via Oxc |
| aws-amplify | ^6.22.2 | Cognito auth + API client (UI) |
| @aws-amplify/ui-react | ^6.15.7 | Pre-built Amplify UI components |
| eslint | ^10.14.0 | UI linting |
| typescript-eslint | ^8.72.1 | TypeScript ESLint rules |
| eslint-plugin-react-hooks | ^7.1.1 | Hooks lint rules |
| eslint-plugin-react-refresh | ^0.5.7 | HMR safety lint rules |
| bedrock-agentcore | >=1.18.1,<2.0.0 | AgentCore runtime SDK |
| strands-agents | >=1.62.0,<2.0.0 | Agent loop framework |
| aws-opentelemetry-distro | ~0.21.0 | OTEL auto-instrumentation |
| botocore[crt] | ~1.43.0 | Low-level AWS client (agent) |
| Amazon Nova Lite v1 | us.amazon.nova-2-lite-v1:0 | Model backing hrAgent |

---

### Test Coverage

- **Test Directories**: `tests/unit/`
- **Test Frameworks**: `pytest 8.4.2` (declared in `pyproject.toml` dev group); `aws-cdk.assertions` (CDK template assertions)
- **Coverage Config**: absent — no `pytest.ini`, `setup.cfg`, or coverage plugin configured
- **Existing tests**: `test_hr_leave_portal_stack.py` — two CDK snapshot tests referencing `HrLeavePortalStack` (a class that no longer exists; file is a stale scaffold from `cdk init`). Both tests will fail at import. No tests for the API controllers, services, or state machine. No UI tests.

---

### Code Quality Indicators

- **Linting**:
  - UI: ESLint 10 with `typescript-eslint`, `react-hooks`, and `react-refresh` plugins; configured in `ui/eslint.config.js`
  - Python: no linter configured (no `ruff`, `flake8`, `mypy`, or `black` in `pyproject.toml`)
- **CI/CD**: no CI pipeline files found (no `.github/workflows/`, no `buildspec.yml`, no other pipeline config)
- **Documentation**: README is the default `cdk init` template and does not describe the actual project. `ui/README.md` is the default Vite template. No inline docstrings in controllers; service files have brief function-level docstrings on key functions.
- **Type hints**: Python service and controller files use modern Python 3.10+ type syntax (`str | None`, `list[dict]`); no type checker enforced.

---

### Technical Debt Signals

- **Stale test file**: `tests/unit/test_hr_leave_portal_stack.py` imports `hr_leave_portal.hr_leave_portal_stack.HrLeavePortalStack` which does not exist. Test suite is broken by default.
- **Wildcard CORS**: `allow_origins=["*"]` in `api/handler.py` — acceptable for early development but must be scoped to the actual UI origin before production.
- **TODO in notification stack**: `HR_EMAIL_ADDRESS = "hr@example.com"` with comment `# TODO: change this to your own email address`.
- **`RemovalPolicy.DESTROY` on DynamoDB**: table and Cognito user pool both use `DESTROY`; appropriate for development but dangerous if deployed without changing for staging/production.
- **AgentCore agent source files missing**: `hrAgent/app/agent/` exists as an editable install but the source directory is empty. The agent source (`main.py`, `model/load.py`, `parse.py`, `tools/`) was never committed. Tool list and system prompt were recovered from OTLP traces.
- **`HR_STATE_MACHINE_ARN` eagerly read at import**: `api/services/hr_request_service.py` calls `os.environ["HR_STATE_MACHINE_ARN"]` at module level; this crashes the Lambda cold-start if the env var is absent (unlike the table name, which is resolved lazily).
- **Lambda layer is out-of-band**: `scripts/build_layer.sh` must be run manually before `cdk deploy`. There is no automation to re-run it when `fastapi`/`pydantic` versions change. The layer ARN is stored in SSM and read at CDK synth time.
- **UI is a placeholder**: `ui/src/App.tsx` is unmodified Vite scaffold — no domain logic, no Amplify configuration, no routing, no actual screens.
- **`src/hr_leave_portal/` directory**: contains only an empty `__init__.py` — appears to be leftover from an initial project structure experiment; the actual CDK code lives at root level in `hr_leave_portal/`.
- **No router prefix separation**: employee leave routes are on `leave_controller` but nested under `/employees/{id}/leave`; mixed with top-level `/employees` routes — this is reasonable but controllers handle path segments that overlap with each other (both `employee_controller` and `leave_controller` handle `/employees/{employee_id}` paths).
- **DynamoDB data model**: employee records use `PK="USER"` for all employees and `SK=employee_id`. This means listing all employees does a `query` on PK="USER" which returns everything — no pagination. Leave records use `PK=employee_id`, `SK=startDate` (ISO-8601). The GSI1 is defined in the CDK stack but never used in service code.

---

## Handoff Summary

- **Intent-relevant finding**: The backend is feature-complete and ready for a React frontend. The API exposes 8 authenticated REST endpoints (employees CRUD, leave CRUD, two HR workflow triggers). Cognito User Pool (`HrUserPool`) with email sign-in and `user_password` auth flow is already provisioned; `aws-amplify ^6.22.2` and `@aws-amplify/ui-react ^6.15.7` are already declared as UI dependencies — the intent of building a Cognito-authenticated React frontend is explicitly anticipated by the package choices. The `ui/` directory is a blank Vite + React 19 scaffold with zero application code.

  The hrAgent is a Strands-based AgentCore runtime agent. Its source files are missing from the repository (only the `.venv` is present). From OTLP traces, the fully-tooled version of the agent exposes 10 tools: `create_employee`, `save_employee`, `get_employee`, `list_employees`, `list_employees_by_hire_date`, `delete_employee`, `save_leave`, `list_leave`, `generate_leave_email`, `send_email_to_hr`. The agent's system prompt identifies it as an HR leave-management assistant. The AgentCore runtime endpoint is `POST /invocations`, accepting `{prompt, messages, actorId}`. The React UI will need to call this endpoint (or an API Gateway proxy over it) with user messages.

  The CDK stack to deploy the UI does not yet exist — the architect needs to design it (likely S3 + CloudFront, or Amplify Hosting), adding to the existing three stacks in `app.py`.

- **Risks / follow-up**:
  - Agent source files (`main.py`, `model/load.py`, `parse.py`, `tools/*.py`) are absent from the repository. The architect must note this as a gap: the React frontend can be designed to call the AgentCore endpoint, but the agent tool implementations are not verifiable from source. The system prompt and tool list were reconstructed from OTLP telemetry.
  - The AgentCore invocation endpoint requires authentication. The UI will need either direct AgentCore invocation (via `aws-amplify` with Cognito identity credentials) or an API Gateway proxy that forwards authenticated requests to the AgentCore runtime. This integration pattern must be decided at design time.
  - `allow_origins=["*"]` on the FastAPI CORS middleware and the `HrUserPoolClient` `generate_secret=False` setting are both development-era configurations that will need to be updated once the CloudFront distribution URL is known.
  - The GSI1 on the DynamoDB table has no corresponding query code — likely reserved for a future use-case the architect should be aware of.
  - The test suite is broken (stale import). This is a CDK-only concern for the RE; the React UI will need its own test infrastructure from scratch.
