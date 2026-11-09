# Dependencies

## Python — CDK App (pyproject.toml)

| Package | Constraint | Resolved | Purpose |
|---|---|---|---|
| aws-cdk-lib | `>=2.273.0,<3.0.0` | 2.275.0 | CDK constructs for all three stacks |
| constructs | `>=10.5.0,<11.0.0` | ~10.5.x | CDK construct tree base |
| mangum | `>=0.22.0` | ^0.22.0 | ASGI adapter used in Lambda |

**Dev dependencies**:

| Package | Version | Purpose |
|---|---|---|
| pytest | 8.4.2 | Test runner |

**Build backend**: `uv_build >=0.13.5,<0.14.0`

Lock file: `uv.lock` (revision 5, Python 3.14, `uv 0.7.x`)

---

## Python — Lambda Layer (built by scripts/build_layer.sh)

The following packages are installed into the layer zip via `uv pip install` at build time. Exact versions are not pinned in the repository; versions below are what were present in the scan environment.

| Package | Purpose |
|---|---|
| fastapi | REST API framework |
| pydantic | Request/response validation |
| mangum | ASGI-to-Lambda adapter |
| aws-lambda-powertools[tracer] | Lambda observability |

---

## Python — Lambda Runtime (provided by AWS)

| Package | Notes |
|---|---|
| boto3 | DynamoDB resource, Step Functions client |
| botocore | Low-level AWS client |

---

## Python — hrAgent (.venv at hrAgent/app/agent/.venv)

| Package | Constraint | Purpose |
|---|---|---|
| bedrock-agentcore | `>=1.18.1,<2.0.0` | AgentCore runtime SDK |
| strands-agents | `>=1.62.0,<2.0.0` | Agent loop framework |
| aws-opentelemetry-distro | `~0.21.0` | OTEL auto-instrumentation |
| botocore[crt] | `~1.43.0` | Low-level AWS client with CRT |

---

## JavaScript/TypeScript — UI (ui/package.json)

### Runtime dependencies

| Package | Version | Purpose |
|---|---|---|
| react | ^19.3.1 | UI framework |
| react-dom | ^19.3.1 | DOM renderer |
| aws-amplify | ^6.22.2 | Cognito auth + API client |
| @aws-amplify/ui-react | ^6.15.7 | Pre-built UI components |

### Dev dependencies

| Package | Version | Purpose |
|---|---|---|
| vite | ^8.3.6 | Build tool and dev server |
| @vitejs/plugin-react | ^6.1.2 | React HMR (Oxc) |
| typescript | ~6.0.3 | Type checking |
| eslint | ^10.14.0 | Linter |
| typescript-eslint | ^8.72.1 | TypeScript lint rules |
| eslint-plugin-react-hooks | ^7.1.1 | Hooks lint rules |
| eslint-plugin-react-refresh | ^0.5.7 | HMR safety lint rules |
| @types/react | ^19.3.0 | React type definitions |
| @types/react-dom | ^19.3.0 | ReactDOM type definitions |
| @types/node | ^24.19.2 | Node type definitions |
| @eslint/js | ^10.0.1 | ESLint base config |
| globals | ^17.13.0 | Global variable definitions |

---

## Internal Cross-Package Dependencies

| Consumer | Depends on | Mechanism |
|---|---|---|
| `StateMachineStack` | `BackendStack.api_function` | CDK constructor argument; cross-stack CFN reference |
| `StateMachineStack` | `NotificationStack.hr_email_topic` | CDK constructor argument; cross-stack CFN reference |
| `BackendStack` | SSM `/hr-leave-portal/fastapi-layer-arn` | `ssm.StringParameter.value_for_string_parameter` at synth time |
| `hr_request_service` | `HR_STATE_MACHINE_ARN` env var | `os.environ` at module import (eager) |
| `employee_service`, `leave_service` | `TABLE_NAME` env var | Lazy `os.environ.get` on first use |
| `ApiFunction Lambda` | Lambda layer (FastAPI, Pydantic, Mangum) | Lambda layer ARN from SSM |

---

## External Runtime Dependencies (AWS services)

See `technology-stack.md` — AWS Services section.
