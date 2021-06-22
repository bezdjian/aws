import json
import os
import boto3
import logging
import base64
from botocore.exceptions import ClientError
from json import JSONDecodeError

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


def handler(event, context):
    body = event['body']
    record_count = 0
    status_code = ''
    shard_id = ''

    try:
        data = json.loads(body)
        stream_name = os.getenv('STREAM_NAME')
        kinesis = boto3.client('kinesis')

        for record in data:
            record_count += 1

            # Convert record to Json.
            record = json.dumps(record)
            logger.info("Event record: %s ", record)
            encoded_data = base64.b64encode(bytes(record, 'utf-8'))
            logger.info("Encoded data: %s", encoded_data)

            response = kinesis.put_record(StreamName=stream_name,
                                          Data=encoded_data,
                                          PartitionKey='CarDataStreamKey'
                                          )
            status_code = response["ResponseMetadata"]["HTTPStatusCode"]
            shard_id = response["ShardId"]

        return respond(status_code=status_code,
                       json_body={
                           "shardId": shard_id,
                           "records": record_count
                       })

    except ClientError as c:
        logger.exception("Couldn't put record to stream. %s", c)
        raise
    except JSONDecodeError as j:
        return respond(status_code=400,
                       json_body={
                           "error": "Records to be inserted should be a list of data!"
                       })
    except Exception as e:
        logger.exception("Internal error %s.", e)
        raise


def respond(status_code, json_body):
    return {
        'statusCode': status_code,
        'body': json.dumps(json_body)
    }
