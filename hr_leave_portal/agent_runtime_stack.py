# The only model the agent invokes. Keep this in step with
# hrAgent/app/agent/model/load.py and email_tools.py.
AGENT_MODEL_ID = "global.anthropic.claude-sonnet-5"
table.grant_read_write_data(agent_runtime.role)


class AgentRuntimeStack(Stack):
    def __init__(
        self,
        scope: Construct,
        construct_id: str,
        table: dynamodb.Table,
        hr_email_topic: sns.Topic,
        user_pool: cognito.IUserPool,
        user_pool_client: cognito.IUserPoolClient,
        **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # A "global." model id is served by inference profiles, so the role needs
        # both the profile it calls through and the underlying foundation models.
        model_resources = [
            f"arn:aws:bedrock:{Aws.REGION}:{Aws.ACCOUNT_ID}:inference-profile/{AGENT_MODEL_ID}",
            "arn:aws:bedrock:*::foundation-model/anthropic.claude-sonnet-5",
        ]

agent_runtime.add_to_role_policy(
    iam.PolicyStatement(actions=["ecr:GetAuthorizationToken"], resources=["*"])
)
agent_runtime.add_to_role_policy(
    iam.PolicyStatement(
        actions=[
            "ecr:BatchGetImage",
            "ecr:GetDownloadUrlForLayer",
            "ecr:BatchCheckLayerAvailability",
        ],
        resources=[
            f"arn:aws:ecr:{Aws.REGION}:{Aws.ACCOUNT_ID}:repository/{agent_repo_name}"
        ])
)


agent_runtime.add_to_role_policy(
    iam.PolicyStatement(
        actions=[
            "bedrock:InvokeModel",
            "bedrock:InvokeModelWithResponseStream",
        ],
        resources=model_resources)
)

agent_runtime.add_to_role_policy(
            iam.PolicyStatement(
                actions=[
                    "dynamodb:PutItem",
                    "dynamodb:GetItem",
                    "dynamodb:Query",
                    "dynamodb:DeleteItem",
                ],
                resources=[table.table_arn, f"{table.table_arn}/index/*"])
        )