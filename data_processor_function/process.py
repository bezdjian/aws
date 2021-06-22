import json
import os
import base64
import boto3
import uuid
import logging
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


def handler(event, context):
    records = []
    try:
        for record in event["Records"]:
            # Kinesis data is base64 encoded so decode here
            # payload = base64.b64decode(record["kinesis"]["data"]).decode('utf-8')
            payload = record["kinesis"]["data"].decode('utf-8')
            logger.info("Decoded payload: %s", payload)
            record = json.loads(payload)
            put_item(record["Model"], record["Speed"], record["Timestamp"])

            records.append(payload)

        logger.info("%s records are processed and saved to table", len(records))

    except ClientError as e:
        logger.exception("Could not process records! %s", str(e.response))


def put_item(model, speed, timestamp):
    table_name = os.getenv('DB_TABLE')
    data_id = str(uuid.uuid4())

    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(table_name)
    table.put_item(Item={
        'id': data_id,
        'model': model,
        'speed': speed,
        'timestamp': timestamp
    })
