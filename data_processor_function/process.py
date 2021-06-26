import json
import os
import base64
import boto3
import uuid
import logging
from botocore.exceptions import ClientError
from binascii import Error

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


def handler(event, context):
    record_size = len(event["Records"])

    try:
        for i, record in enumerate(event["Records"]):
            record_data = record["kinesis"]["data"]
            logger.info("Record Data: %s", record_data)
            # Decode the data
            decoded_data = base64.b64decode(bytes(record_data, 'utf-8')).decode('utf-8')
            logger.info("Decoded Data: %s", decoded_data)

            # Convert to Json object and put in Dynamo Table.
            record = json.loads(decoded_data)
            put_item(record["Model"], record["Speed"], record["Timestamp"])

            logger.info("%s of %s records are processed and saved to table", i + 1, record_size)

    except Error as base64_error:
        logger.warning("Could not process base64! %s", base64_error)
    except TypeError as type_error:
        logger.warning(type_error)
    except KeyError as key_error:
        logger.warning("Key %s was not found in json data.", key_error)
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
