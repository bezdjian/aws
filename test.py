#!/usr/bin/env python3

import boto3
from botocore.exceptions import ClientError

try:
    # When running without container, host.docker.internal can resolve the correct url.
    s3 = boto3.client("s3", endpoint_url="http://host.docker.internal:4566")
    response = s3.list_buckets()
    response = s3.list_buckets()
    bucket_names = []
    for b in response["Buckets"]:
        bucket_names.append(b["Name"])

    print(bucket_names)

except ClientError as e:
    print(e)
    raise
