import json
import boto3
import os
import uuid
from typing import Dict, Any

from botocore.exceptions import ClientError
from datetime import datetime
from dateutil import parser


def lambda_handler(event, context):
    db_table = os.getenv("DB_TABLE", "")
    endpoint_url = os.getenv("LOCAL_STACK_ENDPOINT", "")
    account_id = os.getenv("ACCOUNT_ID", "")
    
    print(f"account_id: {account_id}")
    print(f"db_table: {db_table}")
    print(f"endpoint_url: {endpoint_url}")

    dynamodb = get_dynamo_client(endpoint_url)

    sns_record = event['Records'][0]['Sns']
    message, subject, message_id, timestamp, topic_arn = (
        sns_record['Message'],
        sns_record['Subject'],
        sns_record['MessageId'],
        sns_record['Timestamp'],
        sns_record['TopicArn'],
    )

    date = parser.parse(timestamp)

    dynamo_items = create_dynamo_items(message_id, message, subject, date, topic_arn)
    print("Dynamo Items to put: ", dynamo_items)

    try:
        dynamodb.put_item(TableName=db_table, Item=dynamo_items)
        return {
            "statusCode": 200, 
            "body": json.dumps({
                "message": message, 
                "messageId": message_id
                })
            }
    except ClientError as err:
        error_code, error_message = err.response['Error']['Code'], err.response['Error']['Message']
        status_code = err.response['ResponseMetadata']['HTTPStatusCode']
        if error_code == 'ResourceNotFoundException':
            return {
                "statusCode": status_code,
                "body": json.dumps({
                    "message": f"{error_message}: {db_table} not found in account {account_id}",
                    "exception":  error_code
                }),
            }
        else:
            return {
                "statusCode": status_code,
                "body": json.dumps({
                    "message": error_message,
                    "exception": error_code
                }),
            }


def create_dynamo_items(message_id: str, message: str, subject: str, date: datetime, topic_arn: str) -> Dict[str, Dict[str, str]]:
    return {
        "id": {'S': str(uuid.uuid4())},
        "messageId": {"S": message_id},
        "message": {"S": message},
        "subject": {"S": subject},
        "created": {"S": date.isoformat()},
        "topicArn": {"S": topic_arn}
    }


def get_dynamo_client(endpoint_url: str) -> Any:
    print("Getting default dynamodb client" if not endpoint_url else f"Getting localstack dynamodb client with endpoint {endpoint_url}")
    return boto3.client("dynamodb", endpoint_url=endpoint_url) if endpoint_url else boto3.client("dynamodb")
