import json
import os
import boto3
import logging
from botocore.exceptions import ClientError


def handler(event, context):
    print("Kinesis Stream Event: ", event)

    table_name = os.getenv('DB_TABLE')
    stream_name = os.getenv('STREAM_NAME')

    logger = logging.getLogger(__name__)
    kinesis = boto3.client('kinesis')

    # for record in event['Records']:
    #     # Kinesis data is base64 encoded so decode here
    #     payload = base64.b64decode(record["kinesis"]["data"])
    #     print("Decoded payload: " + str(payload))

    print("table_name: ", table_name)
    print("stream_name: ", stream_name)

    max_records = 100
    try:
        response = kinesis.describe_stream(StreamName=stream_name)
        shard_id = response['StreamDescription']['Shards'][0]['ShardId']
        print("ShardId: ", shard_id)

        response = kinesis.get_shard_iterator(
            StreamName=stream_name,
            ShardId=shard_id,
            ShardIteratorType='LATEST')
        shard_iter = response['ShardIterator']
        record_count = 0
        while record_count < max_records:
            response = kinesis.get_records(
                ShardIterator=shard_iter,
                Limit=10)
            shard_iter = response['NextShardIterator']
            records = response['Records']
            record_count += len(records)
            logger.info("Got %s records.", record_count)
            yield records

        return {
            'statusCode': 200,
            'body': json.dumps({
                "message": "Hello Consumer!"
            })
        }

    except ClientError:
        logger.exception("Couldn't get records from stream %s.", stream_name)
        raise
    except Exception as e:
        logger.exception("Internal error %s.", e)
        raise
