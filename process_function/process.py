import json
import os
import base64


def handler(event, context):
    records = []
    print("Kinesis Stream Event: ", json.dumps(event))

    table_name = os.getenv('DB_TABLE')
    stream_name = os.getenv('STREAM_NAME')

    print("table_name: ", table_name)
    print("stream_name: ", stream_name)

    for record in event['Records']:
        # Kinesis data is base64 encoded so decode here
        payload = base64.b64decode(record["kinesis"]["data"])
        decoded = str(payload)
        print("Decoded payload: " + decoded)
        records.append(decoded)

    return {
        "StatusCode": 200,
        "body": json.dumps({
            "Data": records
        })
    }
