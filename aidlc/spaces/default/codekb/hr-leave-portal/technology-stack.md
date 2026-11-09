# Technology Stack

## Languages

| Language | Version | Where used |
|---|---|---|
| Python | 3.14 (pinned in `.python-version`) | CDK app, Lambda function, hrAgent |
| TypeScript | ~6.0.3 | React UI (`ui/`) |
| Bash | — | Lambda layer build script (`scripts/build_layer.sh`) |
| JSON (JSONata) | — | Step Functions ASL definition |

## Infrastructure / IaC

| Name | Version | Purpose |
|---|---|---|
| aws-cdk-lib | 2.275.0 (resolved from `>=2.273.0,<3.0.0`) | All three CDK stacks |
| constructs | ~10.5.x | CDK construct tree |
| uv | (build backend: `uv_build >=0.13.5,<0.14.0`) | Python dependency management and build |

## Backend — Lambda Runtime

| Name | Version | Purpose |
|---|---|---|
| FastAPI | from Lambda layer (version not pinned in pyproject.toml) | HTTP framework |
| Pydantic | from Lambda layer | Request/response validation |
| Mangum | ^0.22.0 (in pyproject.toml) | ASGI-to-Lambda adapter |
| aws-lambda-powertools | from Lambda layer | Tracer instrumentation |
| boto3 | Lambda runtime (managed by AWS) | DynamoDB and Step Functions clients |

> The FastAPI layer is built by `scripts/build_layer.sh` using `uv pip install` into a zip. Exact package versions at build time are not pinned in the repository.

## Frontend — UI

| Name | Version | Purpose |
|---|---|---|
| React | ^19.3.1 | UI framework |
| react-dom | ^19.3.1 | DOM renderer |
| aws-amplify | ^6.22.2 | Cognito auth + API client |
| @aws-amplify/ui-react | ^6.15.7 | Pre-built Amplify UI components |
| Vite | ^8.3.6 | Build tool and dev server |
| @vitejs/plugin-react | ^6.1.2 | React HMR via Oxc transform |
| TypeScript | ~6.0.3 | Static typing |
| eslint | ^10.14.0 | Linting |
| typescript-eslint | ^8.72.1 | TypeScript ESLint rules |
| eslint-plugin-react-hooks | ^7.1.1 | Hooks lint rules |
| eslint-plugin-react-refresh | ^0.5.7 | HMR safety lint rules |

## AgentCore Agent (hrAgent)

| Name | Version | Purpose |
|---|---|---|
| bedrock-agentcore | >=1.18.1,<2.0.0 | AgentCore runtime SDK (Starlette ASGI) |
| strands-agents | >=1.62.0,<2.0.0 | Agent loop framework |
| aws-opentelemetry-distro | ~0.21.0 | OTEL auto-instrumentation |
| botocore[crt] | ~1.43.0 | Low-level AWS client |

## AWS Services

| Service | Usage |
|---|---|
| AWS Lambda | ApiFunction (FastAPI); Python 3.14 runtime |
| Amazon API Gateway | REST API fronting the Lambda |
| Amazon Cognito | User Pool (HrUserPool), App Client for browser SPA |
| Amazon DynamoDB | HrTable — single-table design (employees + leave) |
| AWS Step Functions | HrStateMachine — async HR request routing |
| Amazon SNS | HrEmailTopic — HR email notifications |
| Amazon Bedrock | Nova Lite v1 (`us.amazon.nova-2-lite-v1:0`) for HR enquiry responses |
| Amazon Bedrock AgentCore | hrAgent runtime endpoint |
| AWS Systems Manager (SSM) | Stores Lambda layer ARN (`/hr-leave-portal/fastapi-layer-arn`) |
| Amazon CloudWatch | Metrics from `PutMetricData` step in state machine |

## Build Tools

| Tool | Purpose |
|---|---|
| `uv` | Python dependency resolution, lock file, virtualenv |
| npm | Frontend dependency management |
| `tsc -b && vite build` | Frontend production build |
| `scripts/build_layer.sh` | Manual Lambda layer build + SSM publish |
| `cdk deploy` | CDK stack deployment |
