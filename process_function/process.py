import json
import os


def handler(event, context):
    table_name = os.getenv('DB_TABLE')
    stream_name = os.getenv('STREAM_NAME')

    print("table_name: ", table_name)
    print("stream_name: ", stream_name)

    return {
        'statusCode': 200,
        'body': json.dumps({
            "message": "Hello Consumer!"
        })
    }
