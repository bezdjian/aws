import json
import os
import boto3
import logging
from botocore.exceptions import ClientError


def handler(event, context):
    table_name = os.getenv('DB_TABLE')
    stream_name = os.getenv('STREAM_NAME')
    logger = logging.getLogger(__name__)
    kinesis = boto3.client('kinesis')

    print("table_name: ", table_name)
    print("stream_name: ", stream_name)

    try:
        response = kinesis.describe_stream(StreamName=stream_name)
        shard_id = response['StreamDescription']['Shards'][0]['ShardId']
        print("ShardId: ", shard_id)

    except ClientError:
        logger.exception("Couldn't get records from stream %s.", stream_name)
        raise
    except Exception as e:
        logger.exception("Internal error %s.", e)
        raise

    return {
        'statusCode': 200,
        'body': json.dumps({
            "message": "Hello Consumer!"
        })
    }
