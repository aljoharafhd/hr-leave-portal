# API Documentation

## REST API (FastAPI / Lambda + API Gateway)

Base URL: `<ApiUrl>` (CloudFormation output from `HrLeavePortalBackend` stack).

**Authentication**: All endpoints require a Cognito JWT in the `Authorization: Bearer <token>` header. The API Gateway Cognito Authorizer validates the token against `HrUserPool` before forwarding to Lambda.

**CORS**: `allow_origins=["*"]`, `allow_methods=["*"]`, `allow_headers=["*"]` — wildcard, development configuration only.

---

### Employees

#### `POST /employees`
Create a new employee.

- **Auth**: Required
- **Request body** (`EmployeeIn`):
  ```json
  {
    "name": "string",
    "department": "string",
    "startDate": "YYYY-MM-DD",
    "role": "employee"
  }
  ```
- **Response** `201`: Employee item with generated `employeeId` (8-hex UUID prefix).
- **DynamoDB write**: `PK="USER"`, `SK=<employeeId>`

---

#### `GET /employees`
List all employees.

- **Auth**: Required
- **Response** `200`: Array of employee items.
- **DynamoDB**: `query(PK="USER")` — no pagination; returns all records.

---

#### `GET /employees/{employee_id}`
Get a single employee.

- **Auth**: Required
- **Path param**: `employee_id` (string)
- **Response** `200`: Employee item. `404` if not found.

---

### Leave

#### `POST /employees/{employee_id}/leave`
Create a leave record.

- **Auth**: Required
- **Path param**: `employee_id`
- **Request body** (`LeaveIn`):
  ```json
  {
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD",
    "note": ""
  }
  ```
- **Response** `201`: Leave item. Key: `PK=employee_id`, `SK=startDate`.

---

#### `GET /employees/{employee_id}/leave`
List leave records for an employee.

- **Auth**: Required
- **Path param**: `employee_id`
- **Query param**: `month` (optional) — format `YYYY-MM`; filters by SK prefix.
- **Response** `200`: `{ "leave": [...] }`

---

#### `PUT /employees/{employee_id}/leave/{start_date}`
Upsert a leave record.

- **Auth**: Required
- **Path params**: `employee_id`, `start_date` (YYYY-MM-DD)
- **Request body** (`LeaveUpdate`):
  ```json
  {
    "endDate": "YYYY-MM-DD",
    "note": ""
  }
  ```
- **Response** `200`: Updated leave item.

---

### HR Requests

#### `POST /hr-requests/time-off`
Start a time-off workflow. Returns immediately (async).

- **Auth**: Required
- **Request body** (`TimeOffRequestIn`):
  ```json
  {
    "user_id": "string",
    "start_date": "YYYY-MM-DD",
    "end_date": "YYYY-MM-DD"
  }
  ```
- **Response** `202`: `{ "executionArn": "arn:aws:states:..." }`
- **Side effect**: Starts Step Functions execution → `Build TimeOff Body` → SNS email to HR.

---

#### `POST /hr-requests`
Start a general HR request workflow. Returns immediately (async).

- **Auth**: Required
- **Request body** (`HrRequestIn`):
  ```json
  {
    "user_id": "string",
    "prompt": "string"
  }
  ```
- **Response** `202`: `{ "executionArn": "arn:aws:states:..." }`
- **Side effect**: Starts Step Functions execution → Bedrock Nova Lite (prompt, max 200 tokens) → SNS email to HR.

---

## AgentCore Runtime Endpoint

> **Note**: The hrAgent source files (`main.py`, `model/load.py`, `parse.py`, `tools/*.py`) are absent from the repository. The endpoint and its protocol were recovered from OTLP traces captured in `hrAgent/agentcore/.cli/traces/otlp/`.

Base URL: AgentCore-managed runtime URL (separate from API Gateway).

#### `POST /invocations`
Send a message to the hrAgent.

- **Auth**: AgentCore manages authentication (Cognito identity credentials or IAM; integration pattern not yet decided for the UI).
- **Request headers**:
  - `X-Amzn-Bedrock-AgentCore-Runtime-Session-Id: <session_id>` — maintains conversation context.
- **Request body**:
  ```json
  {
    "prompt": "string",
    "messages": [...],
    "actorId": "string"
  }
  ```
- **Response**: Agent's final text response.
- **Underlying model**: Amazon Nova Lite v1 (`us.amazon.nova-2-lite-v1:0`)
- **Agent tools** (recovered from OTLP traces — not verifiable from source):
  - `create_employee`
  - `save_employee`
  - `get_employee`
  - `list_employees`
  - `list_employees_by_hire_date`
  - `delete_employee`
  - `save_leave`
  - `list_leave`
  - `generate_leave_email`
  - `send_email_to_hr`

---

## Cognito Auth Details

- **User Pool**: `HrUserPool` (output: `UserPoolId`)
- **App Client**: `HrUserPoolClient` (output: `UserPoolClientId`); `generate_secret=False` (suitable for SPA/browser)
- **Auth flow**: `user_password` (Amplify `signIn` with username + password)
- **Sign-in alias**: email only; self-sign-up disabled (admin-created accounts only)
