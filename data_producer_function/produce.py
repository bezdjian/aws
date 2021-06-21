import json
import os
import boto3
import logging
import base64
from datetime import datetime
from botocore.exceptions import ClientError


def handler(event, context):
    print("API Event: ", event)
    body = event['body']
    print("Event body: ", body)

    table_name = os.getenv('DB_TABLE')
    stream_name = os.getenv('STREAM_NAME')

    logger = logging.getLogger(__name__)
    kinesis = boto3.client('kinesis')

    print("table_name: ", table_name)
    print("stream_name: ", stream_name)

    data_payload = {
        'Model': 'someCarModel',
        'Speed': '90km/h',
        'Timestamp': datetime.now()
    }

    print("data_payload: ", data_payload)
    print("Encode data...")
    encoded_data = base64.b64encode(data_payload)

    try:
        response = kinesis.put_record(StreamName=stream_name,
                                      Data=encoded_data,
                                      PartitionKey='CarDataStreamKey'
                                      )
        shard_id = response['StreamDescription']['Shards'][0]['ShardId']
        print("put_record response: ", response)

        return {
            'statusCode': 200,
            'body': json.dumps({
                "message": response
            })
        }

    except ClientError:
        logger.exception("Couldn't get records from stream %s.", stream_name)
        raise
    except Exception as e:
        logger.exception("Internal error %s.", e)
        raise
