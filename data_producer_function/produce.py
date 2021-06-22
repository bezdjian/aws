import json
import os
import boto3
import logging
import base64
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


def handler(event, context):
    logger.info("API Event: %s", event)
    body = event['body']

    stream_name = os.getenv('STREAM_NAME')
    kinesis = boto3.client('kinesis', region_name='us-east-1')

    logger.info("Event body: %s ", str(body))
    logger.info("Encode data...")
    encoded_data = base64.b64encode(str.encode(str(body)))
    logger.info("Encoded data: %s", encoded_data)

    try:
        response = kinesis.put_record(StreamName=stream_name,
                                      Data=encoded_data,
                                      PartitionKey='CarDataStreamKey'
                                      )
        return {
            'statusCode': response["ResponseMetadata"]["HTTPStatusCode"],
            'body': json.dumps({
                "message": response["ShardId"]
            })
        }

    except ClientError:
        logger.exception("Couldn't put record to stream %s.", stream_name)
        raise
    except Exception as e:
        logger.exception("Internal error %s.", e)
        raise
