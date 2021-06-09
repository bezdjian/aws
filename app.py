#!/usr/bin/env python3

from aws_cdk import core as cdk
from cdk_python.serverless_stack import ServerlessStack

app = cdk.App()

ServerlessStack(app, "CdkPythonServerlessStack",
                # If you don't specify 'env', this stack will be environment-agnostic.
                # Account/Region-dependent features and context lookups will not work,
                # but a single synthesized template can be deployed anywhere.

                # Uncomment the next line to specialize this stack for the AWS Account
                # and Region that are implied by the current CLI configuration.
                # env=get_env()
                )

app.synth()
