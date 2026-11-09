# Code Structure

## Directory Layout

```
hr-leave-portal/
├── app.py                          CDK app entry point — instantiates 3 stacks
├── pyproject.toml                  Python project manifest (uv build backend)
├── uv.lock                         Locked Python dependencies
├── cdk.json                        CDK app config and feature flags
├── .python-version                 Python 3.14 pin
│
├── hr_leave_portal/                CDK stack definitions
│   ├── backend_stack.py            BackendStack: DynamoDB, Lambda, API Gateway, Cognito
│   ├── notification_stack.py       NotificationStack: SNS topic + email subscription
│   └── state_machine_stack.py      StateMachineStack: Step Functions + IAM role
│
├── api/                            Lambda function code (FastAPI + Mangum)
│   ├── handler.py                  ASGI app, CORS middleware, router registration, Mangum adapter
│   ├── models.py                   Pydantic request/response models
│   ├── controllers/
│   │   ├── employee_controller.py  POST/GET /employees, GET /employees/{id}
│   │   ├── leave_controller.py     POST/GET/PUT /employees/{id}/leave
│   │   └── hr_request_controller.py POST /hr-requests/time-off, POST /hr-requests
│   └── services/
│       ├── employee_service.py     DynamoDB CRUD for employee records
│       ├── leave_service.py        DynamoDB CRUD for leave records
│       └── hr_request_service.py   Step Functions execution starter
│
├── state_machines/
│   └── hr_state_machine_definition.json  Step Functions ASL (JSONata query language)
│
├── scripts/
│   └── build_layer.sh              Builds and publishes the FastAPI Lambda layer to SSM
│
├── tests/
│   └── unit/
│       └── test_hr_leave_portal_stack.py  Stale CDK snapshot test (broken — see code-quality-assessment.md)
│
├── ui/                             Frontend SPA (blank Vite + React 19 scaffold)
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
│   ├── eslint.config.js
│   ├── index.html
│   └── src/
│       ├── main.tsx                React entry point
│       ├── App.tsx                 Root component (unmodified Vite template)
│       ├── App.css / index.css     Scaffold styles
│       └── assets/                 Scaffold images (hero.png, react.svg, vite.svg)
│
├── hrAgent/                        AgentCore AI assistant
│   └── agentcore/
│       ├── .env.local              Local dev env template (gitignored values)
│       ├── .env.aws.local          AWS credentials for local dev (gitignored)
│       └── .cli/traces/otlp/       OTLP trace files (25 JSONL files; agent tools discovered here)
│
└── src/                            Empty leftover directory
    └── hr_leave_portal/
        └── __init__.py             Empty placeholder
```

## File Classification

| Category | Files |
|---|---|
| IaC / CDK | `app.py`, `hr_leave_portal/*.py`, `cdk.json`, `state_machines/*.json` |
| Lambda runtime | `api/**` |
| Frontend | `ui/**` |
| AgentCore agent | `hrAgent/**` (source files absent — see component-inventory.md) |
| Build tooling | `scripts/build_layer.sh`, `pyproject.toml`, `uv.lock`, `ui/package.json` |
| Tests | `tests/**` |
| Excluded from scan | `.kiro/`, `aidlc/`, `.git/`, `.venv/`, `cdk.out/`, `ui/node_modules/` |

## Code Patterns

- **Controller/Service layering**: FastAPI routers (`controllers/`) handle HTTP concerns only; all DynamoDB and Step Functions calls are delegated to `services/`.
- **Lazy DynamoDB client initialization**: `employee_service.py` and `leave_service.py` resolve the `TABLE_NAME` env var on first call, not at import. `hr_request_service.py` does NOT follow this pattern — it reads `HR_STATE_MACHINE_ARN` at module level.
- **Pydantic for validation**: all incoming request bodies are validated via Pydantic models in `api/models.py`.
- **Cross-stack references via constructor injection**: `StateMachineStack` receives `hr_email_topic` and `api_function` as constructor arguments from `app.py`; CDK's cross-stack reference mechanism handles the SSM/CFN exports automatically.
- **DynamoDB single-table design** (partial): employee records (`PK="USER"`, `SK=employee_id`) and leave records (`PK=employee_id`, `SK=startDate`) share one table. GSI1 is defined but not used.
- **Strands agent loop** (hrAgent): based on `strands-agents ^1.62.0`; OTLP traces show a tool-calling loop with 10 registered tools. Source code absent from repository.
