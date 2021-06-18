#!/usr/bin/env python3

from aws_cdk import core as cdk
from lambda_kinesis_stack.kinesis_serverless_stack import KinesisServerlessStack

app = cdk.App()
KinesisServerlessStack(app, "KinesisServerlessStack",
                       # env=core.Environment(account=os.getenv('CDK_DEFAULT_ACCOUNT'), region=os.getenv('CDK_DEFAULT_REGION')),
                       # For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html
                       )

app.synth()
