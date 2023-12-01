import json
import os

import boto3


def lambda_handler(event, context):
    table_name = os.getenv("TABLE_TABLE_NAME", "Nada")
    table_arn = os.getenv("TABLE_TABLE_ARN", "Nada")
    env_name = os.getenv("ENV_NAME", "Nada")

    print(f"table_name: {table_name}")
    print(f"table_arn: {table_arn}")
    print(f"env_name: {env_name}")

    # list tables from dynamodb
    body = json.loads(event.get("body"))
    print(f"body: {body}")

    dynamo = get_dynamo_client(env_name)
    response = dynamo.scan(TableName=table_name)

    print(f"response: {response}")
    items = response['Items']
    print(f"Items: {items}")

    return {
        "statusCode": 200,
        "body": json.dumps({
            "message": items,
        }),
    }


def get_dynamo_client(env):
    is_local = env == "local"
    endpoint_url = "http://host.docker.internal:4566"
    print("Getting default dynamodb client" if not is_local \
        else f"Getting localstack dynamodb client with endpoint {endpoint_url}")
    return boto3.client("dynamodb", endpoint_url=endpoint_url) if env == "local" else boto3.client("dynamodb")
