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
    # logger.info("Event records: %s", event["Records"])
    records = []
    record_size = len(event["Records"])

    try:
        for record in event["Records"]:
            record_data = record["kinesis"]["data"]
            logger.info("Record Data: %s", record_data)
            # Decode the data
            decoded_data = base64.b64decode(record_data).decode('utf-8')
            logger.info("Decoded Data: %s", decoded_data)
            # Covert string to Json object and put in Dynamo Table.
            record = json.loads(decoded_data)
            put_item(record["Model"], record["Speed"], record["Timestamp"])

            records.append(decoded_data)
            logger.info("%s of %s records are processed and saved to table", len(records), record_size)

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
