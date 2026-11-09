# Business Overview

## Domain

HR (Human Resources) leave management. The system lets employees request and track time off, and allows HR staff to process and respond to leave and benefits enquiries.

## Purpose

Provide a cloud-hosted portal that:

1. Stores employee records and leave history in a serverless backend.
2. Automates HR request processing via a Step Functions workflow that routes time-off requests to an email notification and general enquiries to a Bedrock LLM response.
3. Exposes an AI HR assistant (hrAgent) running on Amazon Bedrock AgentCore that can answer HR questions conversationally and take actions on behalf of the employee (look up records, submit leave, send emails to HR).
4. Delivers a React web UI (currently a blank scaffold) through which authenticated employees will interact with all of the above.

## Key Functionality

| Feature | Status |
|---|---|
| Employee CRUD (create, read, list) | Implemented — `api/` backend |
| Leave record management (create, list by month, upsert) | Implemented — `api/` backend |
| Time-off request workflow (Step Functions → SNS email) | Implemented — state machine + notification stack |
| General HR request (Step Functions → Bedrock Nova Lite → SNS email) | Implemented — state machine |
| Cognito-authenticated API Gateway | Implemented — BackendStack |
| AI HR assistant (Strands-based AgentCore agent) | Partially implemented — source files absent from repo; tooling recovered from OTLP traces |
| React web UI | Not yet implemented — blank Vite + React 19 scaffold only |
| CDK deployment stack for UI (S3/CloudFront or Amplify Hosting) | Not yet implemented — to be added |

## Users

- **Employees**: submit leave requests, view leave history, chat with the HR assistant.
- **HR Staff**: receive email notifications for time-off requests and Bedrock-generated summaries of general enquiries.

## Business Rules

- All API calls require a valid Cognito JWT (email sign-in, `user_password` auth flow, no self-sign-up).
- Leave records are keyed by `employee_id` + `startDate` (ISO-8601); an upsert on the same key replaces the record.
- Time-off requests trigger an asynchronous Step Functions execution; the API returns 202 with `executionArn`.
- General HR requests are routed to Bedrock Nova Lite (`us.amazon.nova-2-lite-v1:0`), capped at 200 tokens, then published to SNS.
- HR email destination is hardcoded as `hr@example.com` (TODO placeholder — see `notification_stack.py`).
