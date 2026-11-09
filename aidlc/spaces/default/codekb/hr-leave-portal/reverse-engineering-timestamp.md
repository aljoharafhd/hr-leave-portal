# Reverse Engineering Timestamp

## Run Record

- Date: 2026-11-09
- Commit: 7c7d8977963eafce313aebfd3b9c27bd8a59cecc

## Scope of Analysis

```yaml
scope_version: 1
kind: full
intent: 261109-react-frontend-agentcore
fingerprint: c84c692567486be2f93e8428cc877955f296e6c3
analyzed:
  paths:
    - ./
  components:
    - BackendStack
    - NotificationStack
    - StateMachineStack
    - ApiFunction (Lambda)
    - employee_controller
    - leave_controller
    - hr_request_controller
    - employee_service
    - leave_service
    - hr_request_service
    - HrStateMachine (Step Functions)
    - React UI (ui/)
    - hrAgent
    - FastAPI Lambda Layer
shallow:
  paths:
    - hrAgent/agentcore/.cli/traces/otlp/
```
