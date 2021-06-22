import json
import os
import base64
import boto3
import uuid
import logging
from botocore.exceptions import ClientError


def handler(event, context):
    records = []
    logger = logging.getLogger(__name__)
    try:
        for record in event["Records"]:
            # Kinesis data is base64 encoded so decode here
            decoded_data = base64 \
                .b64decode(record["kinesis"]["data"]) \
                .decode('utf-8')
            # TODO, why double decodes to work?
            payload = base64 \
                .b64decode(decoded_data) \
                .decode('utf-8')

            payload = payload.replace('\'', '\"')
            logger.info("payload: ", payload)
            record = json.loads(json.dumps(eval(payload)))
            put_item(record["Model"], record["Speed"], record["Timestamp"])

            records.append(payload)

        return {
            "StatusCode": 200,
            "body": json.dumps({
                "Data": records
            })
        }

    except ClientError as e:
        return {
            "StatusCode": 500,
            "body": json.dumps({
                "message": e.response
            })
        }


def put_item(model, speed, timestamp):
    table_name = os.getenv('DB_TABLE')
    data_id = str(uuid.uuid4())

    dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
    table = dynamodb.Table(table_name)
    table.put_item(Item={
        'id': data_id,
        'model': model,
        'speed': speed,
        'timestamp': timestamp
    })
