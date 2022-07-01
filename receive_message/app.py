import json
import boto3
import os
import uuid

from botocore.exceptions import ClientError
from datetime import datetime
from dateutil import parser


def lambda_handler(event, context):
    db_table = os.environ.get("DB_TABLE")
    endpoint_url = os.environ.get("LOCAL_STACK_ENDPOINT")
    print(f"db_table: {db_table}")
    print(f"endpoint_url: {endpoint_url}")

    dynamodb = get_dynamo_client(endpoint_url)

    json_event = json.dumps(event, indent=2)
    print("Received event: " + json_event)
    message = event['Records'][0]['Sns']['Message']
    subject = event['Records'][0]['Sns']['Subject']
    message_id = event['Records'][0]['Sns']['MessageId']
    timestamp = event['Records'][0]['Sns']['Timestamp']
    topic_arn = event['Records'][0]['Sns']['TopicArn']

    parsed_timestamp = parser.parse(timestamp).strftime("%Y-%m-%dT%H:%M:%S")
    date = datetime.fromisoformat(parsed_timestamp)

    try:
        response = dynamodb.put_item(
            TableName=db_table,
            Item={
                "id": {'S': uuid.uuid4().__str__()},
                "messageId": {"S": message_id},
                "message": {"S": message},
                "subject": {"S": subject},
                "created": {"S": date.__str__()},
                "topicArn": {"S": topic_arn}
                # We can add EventSource, EventSubscriptionArn if we use this lambda for other triggers?
            }
        )

        response_code = response["ResponseMetadata"]["HTTPStatusCode"]
        # Do we need this check?
        if response_code == 200:
            return {
                "statusCode": 200,
                "body": json.dumps({
                    "message": message,
                    "messageId": message_id,
                })
            }
        else:
            return {
                "statusCode": response_code,
                "body": json.dumps({
                    "message": f"Failed to put item into {db_table}"
                })
            }

    except ClientError as err:
        return {
            "statusCode": err.response['ResponseMetadata']['HTTPStatusCode'],
            "body": json.dumps({
                "message": err.response['Error']['Message'],
                "exception": err.response['Error']['Code']
            }),
        }


def get_dynamo_client(endpoint_url):
    if endpoint_url == "" or endpoint_url is None:
        dynamodb = boto3.client("dynamodb")
    else:
        dynamodb = boto3.client("dynamodb", endpoint_url=endpoint_url)
    return dynamodb
