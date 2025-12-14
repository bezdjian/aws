import json
import boto3
import os
import uuid

from botocore.exceptions import ClientError
from datetime import datetime


def lambda_handler(event, context):
    db_table = os.environ.get("DB_TABLE")
    endpoint_url = os.environ.get("LOCAL_STACK_ENDPOINT")
    print(f"db_table: {db_table}")
    print(f"endpoint_url: {endpoint_url}")

    dynamodb = get_dynamo_client(endpoint_url)

    body = event["Records"][0]["body"]
    message_id = event["Records"][0]["messageId"]
    timestamp = event["Records"][0]["attributes"]["SentTimestamp"]
    event_source_arn = event["Records"][0]["eventSourceARN"]
    # 1765737845 -> "2024-06-14T07:24:05"
    date = datetime.fromtimestamp(int(timestamp) / 1000).strftime("%Y-%m-%dT%H:%M:%S")

    dynamo_items = {
        "id": {"S": uuid.uuid4().__str__()},
        "messageId": {"S": message_id},
        "body": {"S": body},
        "eventSourceArn": {"S": event_source_arn},
        "created": {"S": date.__str__()},
        # We can add EventSource, EventSubscriptionArn if we use this lambda for other triggers?
    }
    print("Dynamo Items to put: ", dynamo_items)

    try:
        response = dynamodb.put_item(TableName=db_table, Item=dynamo_items)
        response_code = response["ResponseMetadata"]["HTTPStatusCode"]
        # Do we need this check?
        if response_code == 200:
            print(f"Successfully put item into {db_table}")
        else:
            print(f"Failed to put item into {db_table}")

    except ClientError as err:
        return {
            "statusCode": err.response["ResponseMetadata"]["HTTPStatusCode"],
            "body": json.dumps(
                {
                    "message": err.response["Error"]["Message"],
                    "exception": err.response["Error"]["Code"],
                }
            ),
        }


def get_dynamo_client(endpoint_url):
    if endpoint_url == "" or endpoint_url is None:
        dynamodb = boto3.client("dynamodb")
    else:
        dynamodb = boto3.client("dynamodb", endpoint_url=endpoint_url)
    return dynamodb
