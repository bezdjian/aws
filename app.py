#!/usr/bin/env python3
import os

from aws_cdk import core as cdk
from cdk_python.pipeline.pipeline import PipelineStack

app = cdk.App()


def get_env():
    return cdk.Environment(
        account=os.getenv('CDK_DEFAULT_ACCOUNT'),
        region=os.getenv('CDK_DEFAULT_REGION')
    )


# ServerlessStack(app, "CdkPythonServerlessStack")
PipelineStack(app, "CdkPythonPipelineStack",
              # If you don't specify 'env', this stack will be environment-agnostic.
              # Account/Region-dependent features and context lookups will not work,
              # but a single synthesized template can be deployed anywhere.

              # Uncomment the next line to specialize this stack for the AWS Account
              # and Region that are implied by the current CLI configuration.
              # env=get_env()
              )

app.synth()
