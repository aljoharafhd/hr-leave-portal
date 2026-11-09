# Component Inventory

## BackendStack

- **Kind**: CDK Stack
- **Location**: `hr_leave_portal/backend_stack.py`
- **Responsibility**: Provisions the core runtime infrastructure — DynamoDB table (with GSI1), FastAPI Lambda function (Python 3.14, Lambda layer from SSM), API Gateway (LambdaRestApi with Cognito Authorizer), and Cognito User Pool + App Client.
- **Exports**: `api_function` (Lambda function handle), `user_pool` (Cognito User Pool handle) for cross-stack use.
- **Outputs**: `ApiUrl`, `TableName`, `UserPoolId`, `UserPoolClientId`
- **Dependencies**: SSM parameter `/hr-leave-portal/fastapi-layer-arn` (must exist before `cdk deploy`)

## NotificationStack

- **Kind**: CDK Stack
- **Location**: `hr_leave_portal/notification_stack.py`
- **Responsibility**: Owns the SNS email topic (`HrEmailTopic`) with a hardcoded email subscription (`hr@example.com` — TODO placeholder).
- **Exports**: `hr_email_topic` (SNS Topic handle)
- **Outputs**: `HrEmailTopicArn`
- **Dependencies**: none

## StateMachineStack

- **Kind**: CDK Stack
- **Location**: `hr_leave_portal/state_machine_stack.py`
- **Responsibility**: Provisions the Step Functions state machine from `state_machines/hr_state_machine_definition.json`, patches the SNS topic ARN into the ASL at synth time, creates the IAM role (Bedrock `InvokeModel`, SNS `Publish`, CloudWatch `PutMetricData`), and injects `HR_STATE_MACHINE_ARN` into the ApiFunction Lambda env.
- **Dependencies**: `NotificationStack.hr_email_topic`, `BackendStack.api_function`
- **Outputs**: `HrStateMachineArn`

## ApiFunction (Lambda)

- **Kind**: AWS Lambda function (Python 3.14)
- **Location**: `api/` (deployed from `BackendStack`)
- **Responsibility**: Serves all 8 REST endpoints via FastAPI + Mangum. Reads/writes DynamoDB; starts Step Functions executions.
- **Runtime**: Python 3.14, 512 MB, 10 s timeout
- **Layer**: FastAPI layer (ARN from SSM) containing FastAPI, Pydantic, Mangum, aws-lambda-powertools
- **Env vars**: `TABLE_NAME` (injected by BackendStack), `HR_STATE_MACHINE_ARN` (injected by StateMachineStack)
- **Dependencies**: DynamoDB (HrTable), Step Functions (HrStateMachine)

## employee_controller

- **Kind**: FastAPI router module
- **Location**: `api/controllers/employee_controller.py`
- **Responsibility**: Handles `POST /employees`, `GET /employees`, `GET /employees/{employee_id}`.
- **Dependencies**: `employee_service`

## leave_controller

- **Kind**: FastAPI router module
- **Location**: `api/controllers/leave_controller.py`
- **Responsibility**: Handles `POST /employees/{id}/leave`, `GET /employees/{id}/leave`, `PUT /employees/{id}/leave/{date}`.
- **Dependencies**: `leave_service`

## hr_request_controller

- **Kind**: FastAPI router module
- **Location**: `api/controllers/hr_request_controller.py`
- **Responsibility**: Handles `POST /hr-requests/time-off` and `POST /hr-requests`.
- **Dependencies**: `hr_request_service`

## employee_service

- **Kind**: Service module
- **Location**: `api/services/employee_service.py`
- **Responsibility**: DynamoDB CRUD for employee records. Data model: `PK="USER"`, `SK=employee_id`. Lazy table resolution.
- **Dependencies**: boto3 (DynamoDB resource)

## leave_service

- **Kind**: Service module
- **Location**: `api/services/leave_service.py`
- **Responsibility**: DynamoDB put/query for leave records. Data model: `PK=employee_id`, `SK=startDate`. Optional month-prefix filter.
- **Dependencies**: boto3 (DynamoDB resource)

## hr_request_service

- **Kind**: Service module
- **Location**: `api/services/hr_request_service.py`
- **Responsibility**: Starts Step Functions executions for time-off and general HR requests.
- **Note**: Reads `HR_STATE_MACHINE_ARN` at module import (eager); Lambda cold-start fails if env var is absent.
- **Dependencies**: boto3 (Step Functions client)

## HrStateMachine (Step Functions)

- **Kind**: AWS Step Functions state machine (Standard, JSONata query language)
- **Location**: `state_machines/hr_state_machine_definition.json`
- **Responsibility**: Routes HR requests. `TimeOff` → build email body → SNS. `BenefitsInquiry` (default) → Bedrock Nova Lite → SNS → CloudWatch metric.
- **States**: `Route By Request Type`, `Build TimeOff Body`, `Bedrock InvokeModel`, `SNS Publish`, `PutMetricData`

## React UI (ui/)

- **Kind**: Frontend SPA
- **Location**: `ui/`
- **Responsibility**: To be implemented — will provide the employee-facing web interface for leave management and the AI assistant chat. Currently an unmodified Vite + React 19 scaffold (`App.tsx` is the default Vite template with no domain logic).
- **Declared dependencies**: `aws-amplify ^6.22.2`, `@aws-amplify/ui-react ^6.15.7`, `react ^19.3.1`, `react-dom ^19.3.1`
- **Build**: `tsc -b && vite build`
- **Status**: Blank scaffold — no application code, no Amplify configuration, no routing.

## hrAgent

- **Kind**: Strands-based AgentCore AI agent
- **Location**: `hrAgent/` (source files absent from repo)
- **Responsibility**: Conversational HR assistant. Accepts `{prompt, messages, actorId}` at `POST /invocations`. Uses 10 tools to read/write employee and leave data and send HR emails.
- **Model**: Amazon Nova Lite v1 (`us.amazon.nova-2-lite-v1:0`)
- **Runtime SDK**: `bedrock-agentcore >=1.18.1,<2.0.0`, `strands-agents >=1.62.0,<2.0.0`
- **Source status**: `hrAgent/app/agent/` is an editable install with an empty source directory. Tool list and system prompt recovered from OTLP traces in `hrAgent/agentcore/.cli/traces/otlp/`. Source files (`main.py`, `model/load.py`, `parse.py`, `tools/*.py`) were never committed.
- **Known tools** (from OTLP traces): `create_employee`, `save_employee`, `get_employee`, `list_employees`, `list_employees_by_hire_date`, `delete_employee`, `save_leave`, `list_leave`, `generate_leave_email`, `send_email_to_hr`

## FastAPI Lambda Layer

- **Kind**: Lambda Layer (out-of-band build artifact)
- **Location**: built by `scripts/build_layer.sh`; ARN stored in SSM `/hr-leave-portal/fastapi-layer-arn`
- **Responsibility**: Packages FastAPI, Pydantic, Mangum, aws-lambda-powertools into a reusable Lambda layer to keep the function zip small.
- **Note**: Must be built and published manually before `cdk deploy`. No automation to rebuild when dependency versions change.
