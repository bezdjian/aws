import json
import os

import boto3
from botocore.exceptions import ClientError


def lambda_handler(event, context):
    try:
        env = os.getenv("ENV")

        if env == "dev":
            print("it is dev")
            # 1: Does not work on Linux, only Mac as of now:
            # s3 = boto3.client("s3", endpoint_url="http://host.docker.internal:4566")

            # 2: Works on Linux (also Mac), need to add ´--docker-network sam_localstack_network´
            # localstack is the name of the service in docker-compose
            s3 = boto3.client("s3", endpoint_url="http://localstack:4566")
        else:
            print("it is not dev")
            s3 = boto3.client("s3")

        response = s3.list_buckets()
        bucket_names = []
        for b in response["Buckets"]:
            bucket_names.append(b["Name"])

        return {
            "statusCode": 200,
            "body": json.dumps({
                "message": "hello world",
                "buckets": bucket_names
            }),
        }

    except ClientError as e:
        print(e)
        raise
