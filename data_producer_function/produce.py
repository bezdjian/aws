import json
import os
import boto3
import logging
import base64
from botocore.exceptions import ClientError


def handler(event, context):
    print("API Event: ", event)
    body = event['body']
    print("Event body: ", body)

    stream_name = os.getenv('STREAM_NAME')

    logger = logging.getLogger(__name__)
    kinesis = boto3.client('kinesis', region_name='us-east-1')

    print("data_payload: ", str(body))
    print("Encode data...")
    encoded_data = base64.b64encode(str.encode(str(body)))
    print("Encoded data: ", encoded_data)

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
