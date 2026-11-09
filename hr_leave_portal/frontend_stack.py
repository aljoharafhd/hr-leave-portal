from aws_cdk import (
    CfnOutput,
    RemovalPolicy,
    Stack,
    aws_cloudfront as cloudfront,
    aws_cloudfront_origins as origins,
    aws_s3 as s3,
)
from constructs import Construct


class FrontendStack(Stack):
    """
    Hosts the compiled React bundle on S3 + CloudFront.

    FR6.1 — S3 bucket with all public access blocked; CloudFront in front.
    FR6.2 — HTTPS enforced (ViewerProtocolPolicy.REDIRECT_TO_HTTPS);
             SPA fallback: 403 and 404 from S3 are rewritten to /index.html
             with status 200 so React Router can handle client-side routes.
    FR6.3 — CfnOutput "FrontendUrl" for the CloudFront domain.
             CfnOutput "BucketName" for use with `aws s3 sync`.
    """

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # S3 bucket — all public access blocked; OAC grants CloudFront read access.
        bucket = s3.Bucket(
            self,
            "HrUiBucket",
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL,
            removal_policy=RemovalPolicy.DESTROY,
            auto_delete_objects=True,
            enforce_ssl=True,
        )

        # SPA error fallback: S3 returns 403 (key not found with OAC) or 404;
        # CloudFront rewrites both to /index.html with 200 so React Router works.
        error_responses = [
            cloudfront.ErrorResponse(
                http_status=403,
                response_http_status=200,
                response_page_path="/index.html",
            ),
            cloudfront.ErrorResponse(
                http_status=404,
                response_http_status=200,
                response_page_path="/index.html",
            ),
        ]

        # CloudFront distribution with OAC
        distribution = cloudfront.Distribution(
            self,
            "HrUiDistribution",
            default_behavior=cloudfront.BehaviorOptions(
                origin=origins.S3BucketOrigin.with_origin_access_control(bucket),
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                cache_policy=cloudfront.CachePolicy.CACHING_OPTIMIZED,
            ),
            default_root_object="index.html",
            error_responses=error_responses,
        )

        # Stack outputs
        CfnOutput(
            self,
            "FrontendUrl",
            value=f"https://{distribution.distribution_domain_name}",
            description="CloudFront URL for the HR Leave Portal UI",
        )

        CfnOutput(
            self,
            "BucketName",
            value=bucket.bucket_name,
            description=(
                "S3 bucket name — use with: "
                "aws s3 sync ui/dist/ s3://<BucketName> --delete"
            ),
        )

        CfnOutput(
            self,
            "DistributionId",
            value=distribution.distribution_id,
            description=(
                "CloudFront distribution ID — use with: "
                "aws cloudfront create-invalidation --distribution-id <id> --paths '/*'"
            ),
        )
