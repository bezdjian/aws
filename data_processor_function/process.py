import json
import os
import base64
import boto3
import uuid
from botocore.exceptions import ClientError


def handler(event, context):
    records = []
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
            print("payload: ", payload)
            record = json.loads(json.dumps(eval(payload)))
            put_item(record["Model"], record["Speed"], record["Timestamp"])

            records.append(payload)

        return respond(200, records)

    except ClientError as e:
        return respond(500, e.response)


def put_item(model, speed, timestamp):
    table_name = os.getenv('DB_TABLE')
    print("table_name: ", table_name)
    data_id = str(uuid.uuid4())
    try:
        dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
        table = dynamodb.Table(table_name)
        table.put_item(Item={
            'id': data_id,
            'model': model,
            'speed': speed,
            'timestamp': timestamp
        })
    except ClientError as c:
        print("Could not put item in to %s: %s", table_name, c.response)
        return respond(500, c.response)


def respond(status, text):
    return {
        "StatusCode": status,
        "body": json.dumps({
            "message": text
        })
    }
